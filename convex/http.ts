import { httpRouter } from "convex/server";
import {Webhook} from "svix"
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter()



http.route({
  // 對應 clerk 的 webhook 設定的 path 
  path:'/clerk-webhook',
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error("webhook 環境變數遺失")
    }
    // 檔頭確認
    const svix_id = req.headers.get("svix-id")
    const svix_signature = req.headers.get("svix-signature")
    const svix_timestamp = req.headers.get("svix-timestamp")
    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("驗證失敗-- no svix headers", {
        status:400
      })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(webhookSecret)
    let evt:any
    // 驗證 webhook
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature":svix_signature
      }) as any
    } catch (error) {
      console.log("驗證失敗",error);
      return new Response("發生錯誤",{status:400})
    }
    // 寫入資料庫
    const eventType = evt.type;
    if (eventType == "user.created") {
      const {id,email_addresses,first_time,last_time,image_url} =evt.data

      const email = email_addresses[0].email_address
      const name = `${first_time||""}${last_time||""}`.trim()
      try {
        await ctx.runMutation(api.user.createUser, {
          email:email,
          fullname: name,
          image: image_url,
          clerkId: id,
          username: email.split("@")[0],
        })
      } catch (error) {
        console.log("創建用戶失敗",error);
        return new Response("創建用戶失敗",{status:500})
      }
    }
    return new Response("創建用戶成功",{status:200})
  }) 
})

export default http;
