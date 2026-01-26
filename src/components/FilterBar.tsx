import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  themesCount: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
};

const FilterBar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  themesCount,
}: FilterBarProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters =
    selectedCategory !== "Tất cả" ||
    searchQuery.trim() !== "" ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  const clearAllFilters = () => {
    onCategoryChange("Tất cả");
    onSearchChange("");
    onPriceRangeChange([0, maxPrice]);
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Pills */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                      isSelected
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {category}
                    {isSelected && (
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 blur-md -z-10" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-8 w-px bg-border/50" />

          {/* Price Filter */}
          <Popover open={isPriceOpen} onOpenChange={setIsPriceOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "gap-2 rounded-full border-border/50 bg-secondary/50 hover:bg-secondary",
                  (priceRange[0] > 0 || priceRange[1] < maxPrice) &&
                    "border-primary/50 bg-primary/10 text-primary"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Giá</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Khoảng giá</h4>
                  {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                    <button
                      onClick={() => onPriceRangeChange([0, maxPrice])}
                      className="text-xs text-primary hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(value) =>
                    onPriceRangeChange(value as [number, number])
                  }
                  max={maxPrice}
                  step={100000}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="px-3 py-1.5 bg-secondary rounded-lg font-medium">
                    {formatPrice(priceRange[0])}
                  </span>
                  <span className="text-muted-foreground">—</span>
                  <span className="px-3 py-1.5 bg-secondary rounded-lg font-medium">
                    {formatPrice(priceRange[1])}
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Divider */}
          <div className="hidden md:block h-8 w-px bg-border/50" />

          {/* Search Input */}
          <div
            className={cn(
              "relative flex items-center transition-all duration-300",
              isSearchFocused ? "w-64" : "w-48"
            )}
          >
            <Search
              className={cn(
                "absolute left-3 h-4 w-4 transition-colors",
                isSearchFocused ? "text-primary" : "text-muted-foreground"
              )}
            />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm theme..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "pl-9 pr-9 h-10 rounded-full border-border/50 bg-secondary/50 transition-all",
                isSearchFocused && "border-primary/50 bg-background shadow-lg shadow-primary/10"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 p-0.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters & Results Count */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Results Count */}
          <span className="text-sm text-muted-foreground">
            Hiển thị{" "}
            <span className="font-semibold text-foreground">{themesCount}</span>{" "}
            themes
          </span>

          {/* Active Filter Tags */}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              Tìm kiếm: "{searchQuery}"
              <button
                onClick={() => onSearchChange("")}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              <button
                onClick={() => onPriceRangeChange([0, maxPrice])}
                className="hover:bg-accent/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
