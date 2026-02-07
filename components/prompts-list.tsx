"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CircleCheck,
  Loader,
  CircleDashed,
  ExternalLink,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProject } from "@/lib/project-context";
import type { PromptResponseDto } from "@/lib/Api";

// ---------- Drag Handle ----------
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// ---------- Status helpers ----------
type PromptStatus = "done" | "in_progress" | "pending";

/**
 * Derive a visual status from the prompt.
 * The API does not expose a status field yet, so we infer one from the topic:
 *   - topic exists  -> "done"
 *   - otherwise     -> "pending"
 * This can be swapped for a real field when the API supports it.
 */
function deriveStatus(prompt: PromptResponseDto): PromptStatus {
  if (prompt.topic) return "done";
  return "pending";
}

const statusConfig: Record<
  PromptStatus,
  { icon: React.ElementType; label: string; className: string }
> = {
  done: {
    icon: CircleCheck,
    label: "Done",
    className: "fill-green-500 dark:fill-green-400 text-background",
  },
  in_progress: {
    icon: Loader,
    label: "In Progress",
    className: "text-primary animate-spin",
  },
  pending: {
    icon: CircleDashed,
    label: "Pending",
    className: "text-muted-foreground",
  },
};

// ---------- Columns ----------
const columns: ColumnDef<PromptResponseDto>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    size: 40,
  },
  {
    accessorKey: "text",
    header: () => (
      <span className="text-xs font-normal text-muted-foreground">Prompt</span>
    ),
    cell: ({ row }) => (
      <span className="text-foreground line-clamp-1 font-medium">
        {row.original.text}
      </span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "topic",
    header: () => (
      <span className="text-xs font-normal text-muted-foreground">Topic</span>
    ),
    cell: ({ row }) => {
      const topic = row.original.topic;
      if (!topic) {
        return <span className="text-muted-foreground text-sm italic">--</span>;
      }
      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {String(topic)}
        </Badge>
      );
    },
    size: 150,
  },
  {
    id: "status",
    header: () => (
      <span className="text-xs font-normal text-muted-foreground">Status</span>
    ),
    cell: ({ row }) => {
      const status = deriveStatus(row.original);
      const config = statusConfig[status];
      const Icon = config.icon;
      return (
        <Badge variant="outline" className="text-muted-foreground gap-1 px-1.5">
          <Icon className={`size-3.5 ${config.className}`} />
          {config.label}
        </Badge>
      );
    },
    size: 130,
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground size-8 transition-all opacity-70"
        onClick={() => {
          toast.info(
            `Navigation to prompt detail not implemented yet (id: ${row.original.id})`
          );
        }}
      >
        <ExternalLink className="size-4" />
        <span className="sr-only">View prompt details</span>
      </Button>
    ),
    size: 48,
  },
];

// ---------- Draggable Row ----------
function DraggableRow({ row }: { row: Row<PromptResponseDto> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-dragging={isDragging}
      ref={setNodeRef}
      className="group relative z-0 cursor-pointer transition-colors hover:bg-muted/50 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// ---------- Main Component ----------
export function PromptsList() {
  const { activeProject } = useProject();
  const prompts = activeProject?.prompts ?? [];

  const [data, setData] = React.useState<PromptResponseDto[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sync external prompts into local state for drag reorder
  React.useEffect(() => {
    setData(prompts);
  }, [prompts]);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.map(({ id }) => id),
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    getRowId: (row) => row.id,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  if (!activeProject) return null;

  return (
    <div className="flex w-full flex-col gap-4 px-4 py-4 md:py-6 lg:px-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Prompts</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Add prompt not implemented yet")}
        >
          <Plus />
          <span className="hidden lg:inline">Add Prompt</span>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 [&_tr]:border-b-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No prompts yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredRowModel().rows.length} prompt(s) total
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="prompts-rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-20"
                id="prompts-rows-per-page"
              >
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
