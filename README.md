![Cream Brown Promotion Flyer Buy 1 Get 1 Sale Instagram Post](https://github.com/xzsa654/endpoint/blob/main/Group%2020.png)

## 專案簡介

endpoint 是一款使用 React Native 建立的即時社群媒體應用程式。它具有 Google 登入、即時更新、媒體分享以及按讚、評論等互動功能
.
<br>

## 使用技術

- 🚀 React Native + Expo
- 🔐 Clerk 會員驗證系統
- 🔄 Convex 後端
- ❤️ 即時互動
- 🖼️ Media Handling
- 🔔 通知系統
- ✏️ 會員編輯
- 🔄 Webhooks 應用
- 🎈+ 許多 expo 的應用!

![Blendy  The Social Media App](https://github.com/user-attachments/assets/eb7d7d15-6f1a-49a4-9dc1-31c32945b162)

# 網站特色

### 👀 基本功能

- 一鍵登入
- 會員管理

### 💁 我的會員

- 更新個人資料
- 新增圖片

### 📱 社群動態

- 實時動態
- 方便查看他的貼文
- 點讚、留言、加入書籤

### ➕ 貼文

- 圖片選擇
- 支持說明文字
- 貼文刪除

### 🔔 實時通知

- 喜歡提示 - 立即知道誰點讚了我的貼文
- 留言提示 – 立即收到其他用戶對貼文的留言
- 追蹤 - 立即收到誰追蹤了我

### 👯 會員

- 追蹤與未追蹤人數
- 透過貼文查看用戶主頁

### 🔗 書籤

- 收藏喜歡的貼文
- 點擊圖片放大

如有其他問題，歡迎討論: xzsa654@gmail.com

# 初始化

### 請先執行 `npm i` 安裝所有套件

### 註冊

1. 請先至 clerk 官網註冊並快速建立一個會員系統
   官網：https://clerk.com/
2. 至 convex 註冊並創建專案 (‼️ 請將開發環境設為雲端 )
   官網: https://www.convex.dev/
3. 至 clerk/dashboard/Configure 添加一個新的 JWT templates
   並到 convex 資料夾修改 auth.config.example.ts

```
  export default {
providers: [
  {
    domain: "請填入JWT templates Issuer的網址",
    applicationID: "請填入JWT templates 的 Name",
  },
]
};
```

4. 在 clerk 添加 Webhooks：

- 複製環境變數內的 `EXPO_PUBLIC_CONVEX_URL` 並將後面的.cloud 更改為
  .site/clerk-webhook 此為示範`https://modest-mosquito-925.convex. site/clerk-webhook`
- 至 Configure/Webhooks 新增 將剛剛的網址貼入`Endpoint URL`
  並將 `Subscribe to events` 設為 user.created 後創建
- 將剛剛創建的 webhooks 複製 Signing Secret，並至 convex 設定環境變數
  `CLERK_WEBHOOK_SECRET=剛剛複製的內容`

### 環境變數

透過根目錄 `.sample.env` 修改為 `.env.local` 並添加以下變數：

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY= 此處請複製clerkDashboard/Developers/API keys/Quick Copy

 終端機輸入 `npx convex dev` 開啟 convex 伺服器
 下方部分可以為convex環境變數 可以透過 / 專案/project settings / Lost Access 粘貼並輸入至終端機

CONVEX_DEPLOYMENT=

EXPO_PUBLIC_CONVEX_URL=

Environment Variables
```

### 專案演示

請確保已完成以上步驟

📲💻 至 appStore 或者 playStore 下載 Expo Go

- 將手機與電腦連接同一個 WIFI，終端機執行：

```
 npx convex deploy && npx expo start
```

- expo 執行完畢後也可以掃描 QRcode 查看專案

#

感謝各位~祝各位有個美好的一天！
