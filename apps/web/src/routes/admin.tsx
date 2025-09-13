import type { Route } from "./+types/admin";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@goldstart/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin" },
    { name: "description", content: "Manage categories, brands, and items" },
  ];
}

export default function Admin() {
  return (
    <div className="container mx-auto max-w-4xl p-4 grid gap-6">
      <CategoryAdmin />
      <MarkAdmin />
      <ItemAdmin />
    </div>
  );
}

function CategoryAdmin() {
  const categories = useQuery(api.categories.list);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

  const handleAdd = async () => {
    const n = name.trim();
    const i = icon.trim();
    if (!n || !i) return;
    await createCategory({ name: n, icon: i });
    setName("");
    setIcon("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
          <Button onClick={handleAdd}>Add</Button>
        </div>
        <ul className="space-y-2">
          {(categories ?? []).map((c) => (
            <li key={c._id} className="flex items-center gap-2">
              <span className="w-8 text-center">{c.icon}</span>
              <span className="flex-1">{c.name}</span>
              <Button
                variant="outline"
                onClick={() => updateCategory({ id: c._id as any, name: c.name, icon: c.icon })}
              >
                Save
              </Button>
              <Button variant="destructive" onClick={() => removeCategory({ id: c._id as any })}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MarkAdmin() {
  const marks = useQuery(api.marks.list);
  const createMark = useMutation(api.marks.create);
  const updateMark = useMutation(api.marks.update);
  const removeMark = useMutation(api.marks.remove);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

  const handleAdd = async () => {
    const n = name.trim();
    const i = icon.trim();
    if (!n || !i) return;
    await createMark({ name: n, icon: i });
    setName("");
    setIcon("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brands</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
          <Button onClick={handleAdd}>Add</Button>
        </div>
        <ul className="space-y-2">
          {(marks ?? []).map((m) => (
            <li key={m._id} className="flex items-center gap-2">
              <span className="w-8 text-center">{m.icon}</span>
              <span className="flex-1">{m.name}</span>
              <Button
                variant="outline"
                onClick={() => updateMark({ id: m._id as any, name: m.name, icon: m.icon })}
              >
                Save
              </Button>
              <Button variant="destructive" onClick={() => removeMark({ id: m._id as any })}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ItemAdmin() {
  const categories = useQuery(api.categories.list);
  const marks = useQuery(api.marks.list);
  const items = useQuery(api.items.list, {} as any);

  const createItem = useMutation(api.items.create);
  const updateItem = useMutation(api.items.update);
  const removeItem = useMutation(api.items.remove);

  const [draft, setDraft] = useState({
    name: "",
    coverImage: "",
    gallery: "",
    categoryId: "",
    markId: "",
    variants: "",
  });

  const handleAdd = async () => {
    const variants = draft.variants
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, price] = line.split("|").map((s) => s.trim());
        return { name, price: Number(price) };
      });

    const gallery = draft.gallery
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!draft.name || !draft.coverImage || !draft.categoryId || !draft.markId || variants.length === 0)
      return;

    await createItem({
      name: draft.name,
      coverImage: draft.coverImage,
      gallery: gallery.length ? gallery : undefined,
      categoryId: draft.categoryId as any,
      markId: draft.markId as any,
      variants,
    });

    setDraft({ name: "", coverImage: "", gallery: "", categoryId: "", markId: "", variants: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <Input placeholder="Cover Image URL" value={draft.coverImage} onChange={(e) => setDraft({ ...draft, coverImage: e.target.value })} />
          <textarea className="border rounded p-2 text-sm" rows={3} placeholder="Gallery URLs (one per line)" value={draft.gallery} onChange={(e) => setDraft({ ...draft, gallery: e.target.value })} />
          <select className="border rounded p-2 text-sm" value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}>
            <option value="">Select Category</option>
            {(categories ?? []).map((c) => (
              <option key={c._id} value={c._id as any}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="border rounded p-2 text-sm" value={draft.markId} onChange={(e) => setDraft({ ...draft, markId: e.target.value })}>
            <option value="">Select Brand</option>
            {(marks ?? []).map((m) => (
              <option key={m._id} value={m._id as any}>
                {m.name}
              </option>
            ))}
          </select>
          <textarea className="border rounded p-2 text-sm" rows={4} placeholder="Variants (one per line: name | price)" value={draft.variants} onChange={(e) => setDraft({ ...draft, variants: e.target.value })} />
          <div>
            <Button onClick={handleAdd}>Add Item</Button>
          </div>
        </div>

        <ul className="space-y-2">
          {(items ?? []).map((it) => (
            <li key={it._id} className="flex items-center gap-2 border rounded p-2">
              <img src={it.coverImage} alt={it.name} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-muted-foreground">
                  {it.variants.map((v) => `${v.name}: $${v.price.toFixed(2)}`).join(", ")}
                </div>
              </div>
              <Button variant="outline" onClick={() => updateItem({
                id: it._id as any,
                name: it.name,
                coverImage: it.coverImage,
                gallery: it.gallery as any,
                categoryId: it.categoryId as any,
                markId: it.markId as any,
                variants: it.variants as any,
              })}>Save</Button>
              <Button variant="destructive" onClick={() => removeItem({ id: it._id as any })}>Delete</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}