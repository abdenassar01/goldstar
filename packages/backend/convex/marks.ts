import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("marks")
      .withIndex("by_name")
      .order("asc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("marks") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("marks", args);
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("marks"),
    name: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("marks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true } as const;
  },
});