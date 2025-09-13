import type { Route } from "./+types/browse";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@goldstart/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Browse" },
    { name: "description", content: "Browse phone repair parts" },
  ];
}

export default function Browse() {
  const categories = useQuery(api.categories.list);
  const marks = useQuery(api.marks.list);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMark, setSelectedMark] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const items = useQuery(api.items.list, {
    categoryId: selectedCategory as any,
    markId: selectedMark as any,
    search,
  });

  const categoryOptions = categories ?? [];
  const markOptions = marks ?? [];
  const itemList = items ?? [];

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="space-y-4">
        <section>
          <h2 className="font-semibold mb-2">Category</h2>
          <div className="flex gap-2 overflow-x-auto">
            {categoryOptions.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(selectedCategory === c._id ? null : (c._id as any))}
                className={`px-3 py-1 rounded-full border ${selectedCategory === c._id ? "bg-primary text-primary-foreground" : "bg-background"}`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Brand</h2>
          <div className="flex gap-2 overflow-x-auto">
            {markOptions.map((m) => (
              <button
                key={m._id}
                onClick={() => setSelectedMark(selectedMark === m._id ? null : (m._id as any))}
                className={`px-3 py-1 rounded-full border ${selectedMark === m._id ? "bg-primary text-primary-foreground" : "bg-background"}`}
              >
                {m.icon} {m.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
          />
        </section>

        <section className="grid gap-2">
          {itemList.map((item) => (
            <Card key={item._id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <img src={item.coverImage} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="text-sm text-muted-foreground">
                    {item.variants.map((v) => (
                      <div key={v.name}>{v.name}: ${v.price.toFixed(2)}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {items === undefined && <div className="text-center py-10">Loading...</div>}
          {items?.length === 0 && <div className="text-center py-10">No items found</div>}
        </section>
      </div>
    </div>
  );
}