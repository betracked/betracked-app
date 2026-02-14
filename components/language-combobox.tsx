"use client";

import { LANGUAGES, type Language } from "@/lib/languages";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

interface LanguageComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  id?: string;
}

export function LanguageCombobox({
  value,
  onValueChange,
  disabled = false,
  id,
  ...props
}: LanguageComboboxProps) {
  return (
    <Combobox
      value={value}
      onValueChange={(val) => onValueChange(val || "")}
      items={LANGUAGES}
      itemToString={(item: Language | null) =>
        item ? `${item.flag} ${item.name}` : ""
      }
      itemToValue={(item: Language | null) => item?.code || ""}
    >
      <ComboboxInput
        id={id}
        placeholder="Search languages..."
        showTrigger
        showClear
        disabled={disabled}
        aria-invalid={props["aria-invalid"]}
      />
      <ComboboxContent>
        <ComboboxList>
          {(item: Language) => (
            <ComboboxItem key={item.code} value={item.code}>
              <span className="flex items-center gap-2.5">
                <span className="text-base leading-none">{item.flag}</span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.nativeName && (
                    <span className="text-muted-foreground text-xs">
                      {item.nativeName}
                    </span>
                  )}
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No language found</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
