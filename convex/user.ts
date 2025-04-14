import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// 創建會員
export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    image: v.string(),
    bio: v.optional(v.string()),
    email: v.string(),
    clerkId:v.string(),
  },
  handler: async(ctx, args) => {
    // 判斷會員是否已存在
    const existingUser = await ctx.db.query("users")
    .withIndex("by_clerk_id", (query) => query.eq("clerkId", args.clerkId))
    .first()
    if(existingUser) return 
    // 創建新用戶
    ctx.db.insert("users", {
      clerkId:args.clerkId,
      username:args.username,
      fullname: args.fullname,
      email:args.email,
      image:args.image,
      bio: args.bio,
      followers: 0,
      following: 0,
      posts: 0,
    })
  }
})
// 取得以登入會員資料 (help function)
export async function getAuthenticatedUser(ctx: MutationCtx | QueryCtx){
  // 獲取使用者身分
  const identity = await ctx.auth.getUserIdentity()
  if(!identity) throw new Error("會員驗證失敗")
    
  const currentUser =await ctx.db
  .query("users")
  .withIndex("by_clerk_id",(q)=>q.eq("clerkId",identity.subject))
  .first()
  if (!currentUser) throw new Error("未找到當前用戶") 

  return currentUser
}  

// 透過 clerk_id 取得 user 資料
export const getUserByClerkId = query({
  args: {
    clerkId:v.string()
  },
  handler: async (ctx, arg) => {
    const user =await ctx.db.query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", arg.clerkId))
      .unique()
    return user
  },
})

// 更新會員資料
export const updateProfile = mutation({
  args: {
    fullname:v.string(),
    bio:v.optional(v.string()),
  },
  handler: async (ctx, arg) => {
    const currentUser = await getAuthenticatedUser(ctx)

    await ctx.db.patch(currentUser._id, {
      fullname: arg.fullname,
      bio: arg.bio,
    })
  }
})
// 透過 user._id 取會員貼文資料
export const getPostByUserId = query({
  args:{userId:v.optional(v.id("users"))},
  handler: async (ctx, arg) => {
    const user =arg.userId ? await ctx.db.get(arg.userId):await getAuthenticatedUser(ctx)
    if(!user) throw new Error("用戶不存在");
    const posts = await ctx.db.query("posts")
    .withIndex("by_user",(q)=>q.eq("userId",user._id))
      .collect()
    
    return posts
  }
})
// 透過 user._id 取得會員資料
export const getUserProfile = query({
  args:{userId:v.id("users")},
  handler: async (ctx, arg) => { 
    const user =await ctx.db.get(arg.userId)
    if(!user) throw new Error("用戶不存在")

      return user
  }
})
// 取得會員的粉絲數
export const isFollowing = query({
  args:{followingId:v.id("users")},
  handler: async (ctx, arg) => {
    const currentUser =await getAuthenticatedUser(ctx)
    
    const follow = await ctx.db.query("follows")
      .withIndex("by_both", (q) => q.eq("followerId", currentUser._id).eq("followingId", arg.followingId))
      .first()
    
    return !!follow
  }
})
// 追縱 / 取消追蹤
export const toggleFollow = mutation({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => { 
    const currentUser = await getAuthenticatedUser(ctx)

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_both",(q)=>q.eq("followerId",currentUser._id).eq("followingId",args.followingId))
      .first()

    if (existing) {
      await ctx.db.delete(existing._id)
      await updatedFollowCounts(ctx,currentUser._id,args.followingId,false)
    } else {
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.followingId,
      })
      await updatedFollowCounts(ctx,currentUser._id,args.followingId,true)

      await ctx.db.insert("notifications", {
        receiverId: args.followingId,
        senderId: currentUser._id,
        type: "follow",
      })
    }

  }
})
// 修改追蹤數 function
async function updatedFollowCounts(
  ctx: MutationCtx,
  followerId: Id<"users">,
  followingId: Id<"users">,
  isFollow: boolean) {
  const follower =await ctx.db.get(followerId)
  const following =await ctx.db.get(followingId)
  
  if (follower && following) {
    await ctx.db.patch(followerId, {
      following:follower.following +(isFollow ?1:-1)
    })
    await ctx.db.patch(followingId, {
      followers:following.followers +(isFollow ?1:-1)
    })
  }
}