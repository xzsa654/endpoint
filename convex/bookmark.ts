import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./user";

export const toggleBookMark = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, arg) => {
    const currentUser = await getAuthenticatedUser(ctx)
    const post = await ctx.db.get(arg.postId)
    if(!post) throw new Error("貼文不存在")
    const existing = await ctx.db.query("bookmarks")
      .withIndex("by_user_and_post", (q) => q.eq("userId", currentUser._id).eq("postId", arg.postId))
      .first()

    if (existing) {
      ctx.db.delete(existing._id)
      return false
    } else {
      ctx.db.insert("bookmarks", {
        userId: currentUser._id,
        postId:arg.postId
      })
      return true
    }
  }
})

export const getBookMark = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx)
    const bookmarks = await ctx.db.query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .order("desc")
      .collect()
    const bookmarksWithInfo = await Promise.all(
      bookmarks.map(async(bookmark) => {
        const post = await ctx.db.get(bookmark.postId)
        return post
       }
      )
    )
    return bookmarksWithInfo
  }
})