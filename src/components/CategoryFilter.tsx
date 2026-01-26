import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
            selectedCategory === category
              ? "gradient-bg text-primary-foreground glow-shadow"
              : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
