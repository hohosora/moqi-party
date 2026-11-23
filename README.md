# 🤪 默契失控局｜10–20 人手機競賽破冰遊戲

> 四個荒謬答案 → 選自己最像的 → 猜全場最多人選的 → 立刻開獎、累積積分 → 最後公布排行榜。
>
> **網站可直接放在 GitHub Pages**；真正的跨手機即時連線另需 **Firebase Authentication + Cloud Firestore**。GitHub Pages 只負責靜態網頁，**沒有自己的即時資料庫**。

## 語言版本與介面說明

- **玩家及主持人看到的畫面採用台灣繁體中文**，包含首頁、房間、大廳、作答、開獎、計分、排行榜、倒數及錯誤提示。
- 28 道題目、全部選項與聊天引導皆為繁體中文；網站的語言標示為 `zh-Hant-TW`。
- GitHub Pages、Firebase 等產品名稱，及 HTML、JavaScript、`app.js`、`README.md` 等程式或檔案名稱保留原文，因為部署時需要使用這些名稱；這些不是遊戲中的英語操作介面。
- 若多人連線遭遇 Firebase 錯誤，玩家端會顯示繁體中文提示，不會直接展示英文錯誤碼與程式訊息。

## 內容與功能

- 手機優先響應式設計，適合 10–20 人同場參加。
- 主持人建立 6 碼房間，分享連結；其他玩家輸入暱稱加入。
- 28 道預先準備的幽默題目，6 / 8 / 10 / 12 回合隨機抽題，題庫可在 `app.js` 的 `QUESTIONS` 編輯。
- 每回合選自己的答案 + 猜最多人的選擇；可選一次性「雙倍王牌」。
- 猜中最多人的選擇 +100；持續猜中每回合加成 20、40、60（上限 +60）。如果第一名並列，兩個或多個選項都算猜中。
- 自己的答案只有自己選到 +40，其他非多數派 +20；雙倍王牌只加倍「猜中多數」基本分數，猜錯也會消耗。
- 30 / 45 / 60 秒倒數，每回合全場票數、得分及 **即時個人排名**。
- 另附不需要 Firebase 的 **示範模式**（12 位虛擬玩家）。
- 主持人能手動揭曉、推進回合；倒數結束且主持人網頁保持開啟時，會自動揭曉。
- 匿名 Firebase 登入，**不用玩家註冊帳號**。同一手機/瀏覽器重開、同一匿名身分可藉邀請碼回到房間。

## 先快速看看畫面（示範模式）

直接打開 `index.html`，輸入暱稱，選 **「🎭 先玩示範局」**，就能體驗投票與排行榜，完全不需要後端。請注意，這是**個人搭配虛擬玩家的示範**，不是跨手機同步的多人局。

## 讓 10–20 支手機真正連線：設定 Firebase（僅設定一次）

1. 開啟 https://console.firebase.google.com/ ，建立 Firebase 專案。依 Firebase 提示建立 **網頁應用程式**。
2. 選擇 **Authentication → Sign-in method → Anonymous（匿名登入）**，啟用匿名登入。
3. 選擇 **Firestore Database → Create database**，按你所在區域建立資料庫；完成後進入 **Rules**，用此資料夾內 `firestore.rules` 的**全部內容**取代預設規則並發布。**不要選擇允許所有人讀寫的永久測試規則**。
4. 在 **專案設定 → 一般 → 你的應用程式 → SDK 設定和配置 → Config**，複製 `firebaseConfig` 物件。
5. 開啟 `firebase-config.js`，把 `window.GAME_FIREBASE_CONFIG = null;` 改成：

   ```javascript
   window.GAME_FIREBASE_CONFIG = {
     apiKey: "你 Firebase 專案的 apiKey",
     authDomain: "你的專案.firebaseapp.com",
     projectId: "你的專案ID",
     storageBucket: "你的專案.firebasestorage.app",
     messagingSenderId: "你專案的 sender ID",
     appId: "你的 appId"
   };
   ```

6. 若 Firebase Authentication 拒絕登入，檢查 **Authentication → Settings → Authorized domains**，確認已將網站所用的主機網域（例如 `yourname.github.io`）加入允許清單。
7. 注意免費額度與用量限制：Firebase 計畫的配額及功能可能調整，請在 Firebase Console 確認你的專案可用額度。小型活動通常用量不高，但不保證永遠免費。

**安全提醒：** `firebase-config.js` 裡面是 Firebase 網頁公開設定，會隨 GitHub 公開發布；**絕對不要放入 service account / Admin SDK 私鑰**。實際資料操作權限由 Firestore 規則控制。

## 發布到 GitHub Pages（不用 Node.js 伺服器）

1. 登入 https://github.com/ ，建立新儲存庫（例如 `moqi-party`），選擇 **Public**。
2. 將壓縮包內的 `index.html`、`styles.css`、`app.js`、`firebase-config.js`、`.nojekyll`（以及 README）上傳到**儲存庫根目錄**。**不是把 ZIP 檔整包上傳**。
3. 進入儲存庫 **Settings → Pages → Build and deployment → Deploy from a branch**，選 `main` 和 `/(root)`，按 Save。
4. 網站網址通常是：`https://你的帳號.github.io/moqi-party/`
5. 主持人開啟網站 → 輸入暱稱 → 建立房間 → 分享網頁連結（含 `?room=ABC123`）；玩家用手機直接點網址、填暱稱加入。
6. 建議先用 **2–3 支真實手機**測試房間建立、加入、倒數、揭曉與排名，再進行正式活動。

### 使用時必須知道的限制

- **只放上 GitHub Pages、但不設定 Firebase，只有示範模式能玩**，無法即時同步 10–20 人。這是 GitHub Pages 靜態主機的限制，非本程式的錯誤。
- 線上遊戲的分數由**主持人的瀏覽器**彙整。一般聚會足夠，但它是休閒遊戲設計，不是嚴格防作弊競賽系統。
- 如果主持人關閉網站，倒數到時不會由伺服器自動結算；主持人回來可以繼續主持、手動公布。請勿於比賽期間清除主持人瀏覽器的 Firebase 網站資料。
- 匿名登入身分和原瀏覽器綁定，換瀏覽器或清除網站資料會產生新身分；若已開局，無法以新的身分補加入已開始的房間。
- 依瀏覽器/網路情況，投票同步有短暫延遲；請提醒大家接上穩定 Wi-Fi 或行動網路。
- 房間代碼只為輕量活動辨識，**不要拿本程式存放機密資訊**。資料目前不會自動刪除，需要到 Firebase Console 手動清理舊房間，或另設自動到期清理服務。
- 限制 20 人是在網站前端檢查，極短時間同時加入可能超過 20 人（未做伺服器端硬性人數管制）。

## 推薦現場流程（約 20–30 分鐘）

1. **2 分鐘**：主持人開房、投影網址／房號，大家加入。
2. **8–15 分鐘**：玩 8 回合，每題 45 秒作答，揭曉後搭配 30–60 秒互動。
3. **3 分鐘**：頒發「默契王」、「爆笑冷門王」（由主持人自由加頒），全場合照。
4. **3–5 分鐘**：找一位剛才答案意想不到的人，延伸聊天，增進小組關係。

## 專案檔案

```text
index.html          # 網站入口
styles.css          # 手機 / 桌機排版
app.js              # 遊戲流程、題目、分數計算、Firebase 連線
firebase-config.js  # 貼上自己的 Firebase 網頁設定（預設 null）
firestore.rules     # 貼到 Firebase Console 的規則（不會被 GitHub Pages 自動部署）
.nojekyll           # GitHub Pages 靜態檔相容
README.md           # 本說明
```

## 自行修改玩法

- **修改題目**：`app.js` 最上方 `QUESTIONS` 陣列，`q` 是題目、`a` 是四個答案、`talk` 是開獎後聊天引導。
- **修改計分**：搜尋 `evaluateRound`，即可調整猜中、冷門和連勝分數。畫面規則說明也請一併改成相同的分數。
- **修改顏色**：`styles.css` 的 `:root` 變數。

祝大家不是變成尷尬的「找人採訪」，而是真的玩到笑出來！
