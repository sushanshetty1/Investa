"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  onPresetChange?: (preset: string) => void;
  showPresets?: boolean;
}

const presets = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last year", value: "1y" },
  { label: "Year to date", value: "ytd" },
  { label: "Custom range", value: "custom" }
];

export function DateRangePicker({
  className,
  date,
  onDateChange,
  onPresetChange,
  showPresets = true
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = React.useState("30d");
  const [isCustom, setIsCustom] = React.useState(false);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    setIsCustom(value === "custom");
    
    if (value !== "custom") {
      onPresetChange?.(value);
    }
  };

  const getPresetDates = (preset: string): DateRange | undefined => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset) {
      case "7d":
        return {
          from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
          to: today
        };
      case "30d":
        return {
          from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
          to: today
        };
      case "90d":
        return {
          from: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
          to: today
        };
      case "6m":
        return {
          from: new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
          to: today
        };
      case "1y":
        return {
          from: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
          to: today
        };
      case "ytd":
        return {
          from: new Date(today.getFullYear(), 0, 1),
          to: today
        };
      default:
        return undefined;
    }
  };

  const displayDate = isCustom ? date : getPresetDates(selectedPreset);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showPresets && (
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {isCustom && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayDate?.from ? (
                displayDate.to ? (
                  <>
                    {format(displayDate.from, "LLL dd, y")} -{" "}
                    {format(displayDate.to, "LLL dd, y")}
                  </>
                ) : (
                  format(displayDate.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={displayDate?.from}
              selected={displayDate}
              onSelect={onDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
      
      {!isCustom && displayDate && (
        <div className="text-sm text-muted-foreground">
          {format(displayDate.from!, "MMM dd")} - {format(displayDate.to!, "MMM dd, yyyy")}
        </div>
      )}
    </div>
  );
}
