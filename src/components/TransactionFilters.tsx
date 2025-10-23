import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";
import { DateRange } from "react-day-picker";

interface TransactionFiltersProps {
  selectedCategory: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
}

export function TransactionFilters({
  selectedCategory,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
}: TransactionFiltersProps) {
  const categories = ["All Categories", ...TRANSACTION_CATEGORIES];

  const handleCategorySelect = (value: string) => {
    onCategoryChange(value === "All Categories" ? undefined : value);
  };

  const isFiltered = selectedCategory !== undefined || dateRange?.from || dateRange?.to;

  return (
    <div className="flex flex-wrap gap-4 p-4 border-b border-border bg-muted/20 rounded-t-xl">
      {/* Category Filter */}
      <div className="w-full sm:w-auto">
        <Select
          value={selectedCategory || "All Categories"}
          onValueChange={handleCategorySelect}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Filter by Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters Button */}
      {isFiltered && (
        <Button variant="outline" onClick={onClearFilters} className="w-full sm:w-auto">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}