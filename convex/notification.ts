import { query } from "./_generated/server";
import { getAuthenticatedUser } from "./user";

export const getNotification = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx)
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_receiver",(q)=>q.eq("receiverId",currentUser._id))
      .collect()
    const notificationsWithInfo = await Promise.all(
      notifications.map(async (notification) => {
        const sender =await ctx.db.get(notification.senderId)
        let post = null
        let comment = null;
        if (notification.postId) {
          post =await ctx.db.get(notification.postId)
        }
        if (notification.type=="comment"&&notification.commentId) {
          comment = await ctx.db.get(notification.commentId)
        }
        return {
          ...notification,
          postImage:post?.imageUrl, 
          sender: {
            _id:sender?._id!,
            username:sender?.username!,
            image:sender?.image!
          },
          comment :comment?.content
        }
      })
    )
    return notificationsWithInfo
    }
  }) 






