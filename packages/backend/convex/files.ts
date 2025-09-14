import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});

export const getFileUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, { storageIds }) => {
    const urls = await Promise.all(storageIds.map((sid) => ctx.storage.getUrl(sid)));
    return storageIds.map((storageId, i) => ({ storageId, url: urls[i] }));
  },
});