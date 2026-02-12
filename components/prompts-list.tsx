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
  CircleX,
  Play,
  RefreshCw,
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
import { useRouter } from "next/navigation";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProject } from "@/lib/project-context";
import { api } from "@/lib/api-client";
import type { PromptResponseDto } from "@/lib/Api";

// ---------- Polling interval ----------
const POLLING_INTERVAL_MS = 5000;

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
type PromptStatus = "done" | "in_progress" | "pending" | "failed";

/**
 * Derive a visual status from the prompt's latestVisibility field.
 *   - latestVisibility.status === "completed" -> "done"
 *   - latestVisibility.status === "analyzing" -> "in_progress"
 *   - latestVisibility.status === "failed"    -> "failed"
 *   - latestVisibility === null               -> "pending"
 */
function deriveStatus(prompt: PromptResponseDto): PromptStatus {
  const vis = prompt.latestVisibility;
  if (!vis) return "pending";
  switch (vis.status) {
    case "completed":
      return "done";
    case "analyzing":
      return "in_progress";
    case "failed":
      return "failed";
    default:
      return "pending";
  }
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
    label: "Analyzing",
    className: "text-primary animate-spin",
  },
  pending: {
    icon: CircleDashed,
    label: "Pending",
    className: "text-muted-foreground",
  },
  failed: {
    icon: CircleX,
    label: "Failed",
    className: "fill-destructive text-background",
  },
};

// ---------- Columns factory (needs router + trigger callback) ----------
function createColumns(
  onNavigate: (promptId: string) => void,
  onTriggerSingle: (promptId: string) => void,
  triggeringIds: Set<string>
): ColumnDef<PromptResponseDto>[] {
  return [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
      size: 40,
    },
    {
      accessorKey: "text",
      header: () => (
        <span className="text-xs font-normal text-muted-foreground">
          Prompt
        </span>
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="text-foreground line-clamp-1 cursor-pointer text-left font-medium hover:underline"
          onClick={() => onNavigate(row.original.id)}
        >
          {row.original.text}
        </button>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "topic",
      header: () => (
        <span className="text-xs font-normal text-muted-foreground">
          Topic
        </span>
      ),
      cell: ({ row }) => {
        const topic = row.original.topic;
        if (!topic) {
          return (
            <span className="text-muted-foreground text-sm italic">--</span>
          );
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
      id: "score",
      header: () => (
        <span className="text-xs font-normal text-muted-foreground">
          Score
        </span>
      ),
      cell: ({ row }) => {
        const vis = row.original.latestVisibility;
        if (!vis || vis.score === null || vis.score === undefined) {
          return (
            <span className="text-muted-foreground text-sm italic">--</span>
          );
        }
        return (
          <span className="text-foreground text-sm font-medium tabular-nums">
            {vis.score}
          </span>
        );
      },
      size: 80,
    },
    {
      id: "status",
      header: () => (
        <span className="text-xs font-normal text-muted-foreground">
          Status
        </span>
      ),
      cell: ({ row }) => {
        const status = deriveStatus(row.original);
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground gap-1 px-1.5"
          >
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
      cell: ({ row }) => {
        const promptId = row.original.id;
        const isTriggering = triggeringIds.has(promptId);
        return (
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-8 transition-all opacity-70"
                    disabled={isTriggering}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerSingle(promptId);
                    }}
                  >
                    {isTriggering ? (
                      <Loader className="size-4 animate-spin" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    <span className="sr-only">Run visibility check</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Run visibility check</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-8 transition-all opacity-70"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(promptId);
                    }}
                  >
                    <ExternalLink className="size-4" />
                    <span className="sr-only">View prompt details</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      size: 96,
    },
  ];
}

// ---------- Draggable Row ----------
function DraggableRow({
  row,
  onNavigate,
}: {
  row: Row<PromptResponseDto>;
  onNavigate: (promptId: string) => void;
}) {
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
      onClick={(e) => {
        // Avoid navigating when clicking drag handle or action buttons
        const target = e.target as HTMLElement;
        if (
          target.closest("button") ||
          target.closest('[role="button"]') ||
          target.closest("a")
        ) {
          return;
        }
        onNavigate(row.original.id);
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
  const router = useRouter();
  const { activeProject, loadProjects } = useProject();
  const prompts = activeProject?.prompts ?? [];

  const [data, setData] = React.useState<PromptResponseDto[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [triggeringIds, setTriggeringIds] = React.useState<Set<string>>(
    new Set()
  );
  const [isTriggeringAll, setIsTriggeringAll] = React.useState(false);

  // Sync external prompts into local state for drag reorder
  React.useEffect(() => {
    setData(prompts);
  }, [prompts]);

  // ---- Polling: auto-refresh when any prompt is "analyzing" ----
  React.useEffect(() => {
    const hasAnalyzing = data.some(
      (p) => p.latestVisibility?.status === "analyzing"
    );
    if (!hasAnalyzing) return;

    const interval = setInterval(() => {
      loadProjects();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [data, loadProjects]);

  // ---- Navigation ----
  const handleNavigate = React.useCallback(
    (promptId: string) => {
      router.push(`/prompts/${promptId}`);
    },
    [router]
  );

  // ---- Trigger single visibility ----
  const handleTriggerSingle = React.useCallback(
    async (promptId: string) => {
      if (!activeProject) return;
      setTriggeringIds((prev) => new Set(prev).add(promptId));
      try {
        await api.api.promptsControllerTriggerVisibility(
          activeProject.id,
          promptId
        );
        toast.success("Visibility check triggered");
        await loadProjects();
      } catch {
        toast.error("Failed to trigger visibility check");
      } finally {
        setTriggeringIds((prev) => {
          const next = new Set(prev);
          next.delete(promptId);
          return next;
        });
      }
    },
    [activeProject, loadProjects]
  );

  // ---- Trigger all visibility ----
  const handleTriggerAll = React.useCallback(async () => {
    if (!activeProject) return;
    setIsTriggeringAll(true);
    try {
      await api.api.promptsControllerTriggerVisibilityForProject(
        activeProject.id
      );
      toast.success("Visibility checks triggered for all prompts");
      await loadProjects();
    } catch {
      toast.error("Failed to trigger visibility checks");
    } finally {
      setIsTriggeringAll(false);
    }
  }, [activeProject, loadProjects]);

  // ---- Columns with callbacks ----
  const columns = React.useMemo(
    () => createColumns(handleNavigate, handleTriggerSingle, triggeringIds),
    [handleNavigate, handleTriggerSingle, triggeringIds]
  );

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
      {/* Header with trigger-all & add buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Prompts</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerAll}
            disabled={isTriggeringAll || data.length === 0}
          >
            {isTriggeringAll ? (
              <Loader className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            <span className="hidden lg:inline">Check All</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Add prompt not implemented yet")}
          >
            <Plus />
            <span className="hidden lg:inline">Add Prompt</span>
          </Button>
        </div>
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
                    <DraggableRow
                      key={row.id}
                      row={row}
                      onNavigate={handleNavigate}
                    />
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
            <Label
              htmlFor="prompts-rows-per-page"
              className="text-sm font-medium"
            >
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
