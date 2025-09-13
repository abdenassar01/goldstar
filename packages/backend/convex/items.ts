import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const Variant = v.object({ name: v.string(), price: v.number() });

export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    markId: v.optional(v.id("marks")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { categoryId, markId, search } = args;

    let items;
    if (categoryId && markId) {
      items = await ctx.db
        .query("items")
        .withIndex("by_category_mark", (q) =>
          q.eq("categoryId", categoryId).eq("markId", markId)
        )
        .collect();
    } else if (categoryId) {
      items = await ctx.db
        .query("items")
        .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
        .collect();
    } else if (markId) {
      items = await ctx.db
        .query("items")
        .withIndex("by_mark", (q) => q.eq("markId", markId))
        .collect();
    } else {
      items = await ctx.db.query("items").collect();
    }

    if (search && search.trim().length > 0) {
      const term = search.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(term));
    }

    return items;
  },
});

export const get = query({
  args: { id: v.id("items") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    name: v.string(),
    coverImage: v.string(),
    gallery: v.optional(v.array(v.string())),
    categoryId: v.id("categories"),
    markId: v.id("marks"),
    variants: v.array(Variant),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("items", args);
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("items"),
    name: v.string(),
    coverImage: v.string(),
    gallery: v.optional(v.array(v.string())),
    categoryId: v.id("categories"),
    markId: v.id("marks"),
    variants: v.array(Variant),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true } as const;
  },
});