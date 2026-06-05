import { ScrollArea, ScrollBar } from "#/components/ui/scroll-area";
import { CustomButton } from "./button";

const CategoriesSelection = () => {
  return (
    <div className="shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-100">
      <ScrollArea>
        <ScrollBar orientation="horizontal" />
        <div className="flex gap-2 p-3">
          <CustomButton
            variant={selectedCategory === null ? "primary" : "secondary"}
            className="px-4 py-2 text-sm whitespace-nowrap"
            onClick={() => setSelectedCategory(null)}
          >
            Semua
          </CustomButton>
          {categories.map((c: Category) => (
            <CustomButton
              key={c.id}
              variant={selectedCategory?.id === c.id ? "primary" : "secondary"}
              className="px-4 py-2 text-sm whitespace-nowrap"
              onClick={() => setSelectedCategory(c)}
            >
              {c.name}
            </CustomButton>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
