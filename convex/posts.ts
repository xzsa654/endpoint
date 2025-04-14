// 貼文張貼

import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { getAuthenticatedUser } from "./user";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
  // 獲取使用者身分
  const identity = await ctx.auth.getUserIdentity()
  if(!identity) throw new Error("會員驗證失敗")
    return await ctx.storage.generateUploadUrl()
})
  // 創建貼文
export const createPost = mutation({
  args: {
    caption:v.optional(v.string()),
    storageId:v.id("_storage"),
  },
  handler:async(ctx, args)=> {
    const currentUser = await getAuthenticatedUser(ctx)
    
    const imageUrl =  await ctx.storage.getUrl(args.storageId)
    if(!imageUrl) throw new Error("未找到圖片")
    
    // 創建貼文
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments:0,
    })

    // 遞增用戶張貼數
    await ctx.db.patch(currentUser._id, {
      posts:currentUser.posts+1
    })
    
    return postId
  },
})
  // 取得所有貼文
export const getFeedPost = query({
  handler: async (ctx) => {
    const currentUser =await getAuthenticatedUser(ctx)
    const posts = await ctx.db.query("posts").order("desc").collect()
    if(posts.length===0) return []
    // 豐富的貼文資訊
    const postsWithInfo = await Promise.all(
      posts.map(async(post) => {
        const postAuthor = (await ctx.db.get(post.userId))!
        const like = await ctx.db.query("likes").withIndex("by_user_and_post",
          (q) => q.eq("userId", currentUser._id).eq("postId", post._id)).first()
        const bookmark = await ctx.db.query("bookmarks").withIndex("by_user_and_post"
          , (q) =>q.eq("userId",currentUser._id).eq("postId",post._id)).first()
        return {
          ...post,
          author: {
            _id: postAuthor?._id,
            username: postAuthor?.username,
            image:postAuthor?.image
          },
          isLiked: !!like,
          isBookMarked:!!bookmark
        }
      })
    )
    return postsWithInfo
   }
})

  // 喜歡貼文
export const toggleLiked = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx)
    
    const existing = await ctx.db
      .query("likes")     
      .withIndex("by_user_and_post", (q) => q.eq("userId", currentUser._id).eq("postId", args.postId))
      .first()
    const post =await ctx.db.get(args.postId)
    if(!post)  throw new Error("貼文不存在")

    if (existing) {
      // 取消喜歡
      await ctx.db.delete(existing._id)
      await ctx.db.patch(args.postId,{likes:post.likes-1})
      return false
    } else {
      await ctx.db.insert("likes", {
        userId:currentUser._id,
        postId:args.postId
      })
      await ctx.db.patch(args.postId,{likes:post.likes+1})
      // 如果點擊按讚非貼文本人
      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId:args.postId
        })
      }
      return true
    }
  }
}) 
  // 刪除貼文
export const deletePost = mutation({
  args:{postId:v.id("posts")},
  handler: async (ctx, arg) => {
    const currentUser = await getAuthenticatedUser(ctx)
    const post = await ctx.db.get(arg.postId)
    if(!post) throw new Error("貼文不存在");
    // 驗證擁有權
    if(post.userId!==currentUser._id) throw new Error("此用戶不擁有這筆貼文");

    // 刪除貼文
    const likes =await ctx.db
      .query("likes")
      .withIndex("by_post",(q)=>q.eq("postId",arg.postId))
      .collect()

    for(const like of likes) {
      ctx.db.delete(like._id)
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", arg.postId))
      .collect()

    for (const comment of comments) {
      ctx.db.delete(comment._id)
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", arg.postId))
      .collect()

    for (const bookmark of bookmarks) {
      ctx.db.delete(bookmark._id)
    }
    // 刪除通知
    const notification = await ctx.db
      .query("notifications")
      .withIndex("by_post",(q=>q.eq("postId",arg.postId)))
      .collect()
    
    for (const notify of notification) { 
      await ctx.db.delete(notify._id)
    }
    // 刪除圖片的 storage
    await ctx.storage.delete(post.storageId)
    // 刪除貼文
    await ctx.db.delete(arg.postId)

    // 修改會員的貼文數
    await ctx.db.patch(currentUser._id, {
      posts:Math.max(0,(currentUser.posts||1)-1)
    })
  }
})

