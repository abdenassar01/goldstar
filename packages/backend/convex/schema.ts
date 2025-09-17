import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    icon: v.string(),
  }).index("by_name", ["name"]),
  marks: defineTable({
    name: v.string(),
    icon: v.string(),
  }).index("by_name", ["name"]),
  items: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    coverImage: v.id("_storage"),
    gallery: v.optional(v.array(v.id("_storage"))),
    categoryId: v.id("categories"),
    markId: v.id("marks"),
    variants: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
      })
    ),
  })
    .index("by_category_mark", ["categoryId", "markId"])
    .index("by_category", ["categoryId"])
    .index("by_mark", ["markId"])
    .index("by_name", ["name"]),
});
