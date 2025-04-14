import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./user";

export const addComment = mutation({
  args: {
    content: v.string(),
    postId:v.id("posts")
  },
  handler: async (ctx, arg) => {
    const currentUser = await getAuthenticatedUser(ctx)
    const post =await ctx.db.get(arg.postId)
    if(!post) throw new Error("貼文不存在")

    const commentId = await ctx.db.insert("comments", {
      userId:currentUser._id,
      postId:arg.postId,
      content:arg.content,
    })
    //遞增留言數 
    await ctx.db.patch(arg.postId,{comments:post.comments+1})

    // 送出通知
    if (post.userId !== currentUser._id) {
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId:currentUser._id,
        type:"comment",
        postId:arg.postId,
        commentId,
      })
    }
    return commentId;
  }
})

export const getComment = query({
  args:{postId:v.id("posts")},
  handler: async (ctx, arg) => {
    const comments = await ctx.db.query("comments")
      .withIndex("by_post", (q) => q.eq("postId",arg.postId))
      .collect()

    const commentWithInfo = await Promise.all(
      comments.map(async(comment) => {
        const user =await ctx.db.get(comment.userId)
        return {
          ...comment,
          user:{
            _id:user!._id,
            name:user!.fullname||user!.username,
            image: user!.image
          }
        }
      })
    )
    return commentWithInfo
  }
})