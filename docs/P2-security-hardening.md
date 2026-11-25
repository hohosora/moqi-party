# P2 security hardening — 默契失控局（2026-11-25）

## App Check 現況（2026-11-25）
- Firebase Console 的網頁應用「默契失控局」已由管理者完成 Fraud Defense / reCAPTCHA Enterprise 註冊。
- Google Cloud 的 reCAPTCHA Enterprise Web site key 已建立，綁定正式網域 hohosora.github.io。
- GitHub 的 app-check-config.js 已填入**公開 site key**；index.html 版本更新避免手機舊快取；前端已使用 ReCaptchaEnterpriseProvider、權杖自動刷新及啟動時驗證。
- **仍處於觀察階段，Cloud Firestore 和 Authentication 的 App Check Enforcement 均尚未由本次程式碼修改啟用。**
- 為避免非預期的 reCAPTCHA 網路故障讓整個多人遊戲不可用，初始 token 錯誤會寫入 console warning，而不直接阻止匿名登入；因此，正常玩遊戲**不代表 App Check 已驗證成功**，務必查看 Firebase App Check → API 指標的「已驗證請求」比例。
- 待正式桌機＋手機都完成完整測試，且 Firestore 已驗證請求比例穩定後，**再另行決定**是否對 Cloud Firestore 啟用 Enforcement。不要同時對 Firebase Authentication 啟用 Enforcement。
- 如尚有大量未驗證請求，先查驗瀏覽器是否禁止 reCAPTCHA、金鑰的域名設定、API 配額／Spark 無付費帳單、及 SDK console 訊息。**不要先啟用強制驗證**。

## 已完成且可直接隨 GitHub Pages 上線的部分

1. **前端防護惡意計分資料**：Firestore 的 `scores` 和 `lastResult.gains` 是主持人可寫的欄位；先前部分資料直接插入 `innerHTML`，可能導致 HTML 注入。現在對顯示分數和票數採取嚴格的非負整數、上限驗證，格式錯誤一律顯示為 0；票數圖表會先驗證陣列和數字。既有遊戲計分演算法保持不變。
2. **房號改用密碼學安全亂數**：以瀏覽器 `crypto.getRandomValues` 產生 6 碼代碼。房號長度及可用字元維持不變，舊版分享網址仍可使用；不再使用 `Math.random` 產生正式房號。
3. **App Check 觀察階段**：已註冊 reCAPTCHA Enterprise、設定公開網站金鑰及初始化／自動更新權杖；**尚未啟用強制驗證**，必須先檢查 Firebase Console 的已驗證請求指標。
4. **供應鏈與秘密檔案防護**：`.gitignore` 預防誤提交本機 Admin SDK 私鑰、金鑰和 `.env` 檔；`.github/dependabot.yml` 每週檢查 GitHub Actions 與測試用 npm 相依套件，透過分支保護的 PR 更新。
5. **持續測試**：新增 `tests/client-security.cjs`，和 UI、計分、Firestore emulator 測試一同執行。

## App Check 設定回顧與下一步（請勿直接開 enforce）

**目標網站：** `https://hohosora.github.io/moqi-party/`  
**Firebase 專案：** `moqi-party`（請在控制台再次確認 Project ID）。

1. 開啟 Google Cloud Console → reCAPTCHA / Fraud Defense → **Create key**。
2. 選擇 **Web、Score-based**，網域填 `hohosora.github.io`（**只填網域，不加 https:// 或 /moqi-party 路徑**）。**保留網域驗證**，不要勾選 checkbox challenge，也不要把 `localhost` 加入正式 key。
3. 前往 Firebase Console → **Security → App Check → Apps**，選擇目前這個 Firebase Web App，用 **reCAPTCHA Enterprise** 註冊，並填入上一個步驟取得的 **public site key**。
4. **已完成**：將公開 site key 填入 GitHub `app-check-config.js`，經分支 → PR → 自動測試 → 合併發布。切勿放入私人 reCAPTCHA secret 或 debug token。
5. 新版網站部署完成後，先用桌機、手機各自測試**開房、加入、開始、投票、揭曉、下一題及排行榜**，並觀察 App Check **Cloud Firestore** 的請求驗證指標。
6. 確認大部分合法流量已驗證、沒有失敗或不相容問題後，才到 **App Check → APIs → Cloud Firestore → Enforce**。Firebase Authentication 若也要 enforce，**須另外先驗證其指標和匿名登入流程**，勿一併直接開啟。
7. 如大量合法請求被拒絕，應先於 Firebase 控制台暫停相關服務 enforce，確認 App Check provider、正式網域、site key 和 SDK 的設定；不可將 reCAPTCHA secret key／debug token 提交 GitHub。

**費用提醒**：reCAPTCHA Enterprise 依方案及用量計價，請確認 Google Cloud 計費及通知；Billing budget 通常只發出通知，不能視為硬性上限。App Check 不能替代 Firestore Security Rules。

Google 官方參考：
- https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider
- https://firebase.google.com/docs/app-check/recaptcha-keys
- https://firebase.google.com/docs/app-check/enable-enforcement
- https://firebase.google.com/docs/app-check/monitor-metrics

## 尚未解決（必須清楚區分）

- **投票保密**：目前 `firestore.rules` 仍允許已登入使用者讀取投票集合，知道房號的人可能在揭曉前查看選項。若要隱藏每人票，需把目前「玩家直接讀取 votes 作答人數」的架構改成由受信任的服務端／受控聚合欄位發布票數，並修改規則和前端。請勿單獨把 `allow read: if signedIn()` 改成 `false`，這會破壞同步投票／主持人結算。
- **20 人上限**：目前依靠前端檢查，不能防止惡意用戶直接向 Firestore 建立更多玩家文件。真正的多人上限和每 IP／每 UID 建房限速需要可靠後端或其他受控方案。
- **匿名濫用**：單靠 Firebase 匿名登入、網頁 API key 限制或 App Check 都無法完全阻止有真人瀏覽器的濫用者。
- **GitHub Pages 安全標頭**：純 GitHub Pages 沒有自行設定 HTTP 安全標頭的能力，不能把 HTML meta CSP 當作 `frame-ancestors`、HSTS 的等價替代。
- **金鑰**：Firebase Web API Key 是用戶端公開設定；既有 GitHub secret scanning 警示須先確認 Google Cloud API restrictions 和用途後再依規則註記，不應誤刪會破壞登入的設定。
- **Firestore Rules 部署**：GitHub PR 更新不會自動把規則發佈至 Firebase Console。本次 PR 不改 `firestore.rules`，因此**無需重新貼規則**。


## P2-1／P2-2 執行追蹤（2026-11-25）

### P2-1：App Check 強制驗證（正式開關仍待管理員）

上次回報的 Firestore / Authentication 已驗證請求均為 100%，未驗證 0%；這是先前觀察值，不是本次重新讀取的即時指標。前端已改善 permission-denied 的中文指引，console 不再假定 Enforcement 未開啟。原有監控模式及匿名登入保留；未更動 site key、App Check token refresh 或規則。切勿將 App Check 改為前端自訂開關。

| 環境 | 新開房 | 加入 | 投票、揭曉、排行榜 | 重開／重連 | 狀態 |
|---|---|---|---|---|---|
| Chrome 桌機 | 待測 | 待測 | 待測 | 待測 | 待確認 |
| Edge 桌機 | 待測 | 待測 | 待測 | 待測 | 待確認 |
| iPhone Safari | 待測 | 待測 | 待測 | 待測 | 待確認 |
| Android Chrome | 待測 | 待測 | 待測 | 待測 | 待確認 |

正式網址使用無痕或新瀏覽器工作階段重測。測試期間確認 App Check API 指標有實際請求量且合法請求已驗證；非零樣本才有意義。通過後由管理者在 Firebase Console → Security → App Check → APIs → Cloud Firestore → Enforce。先不要啟用 Authentication Enforcement。等待設定傳播後重跑上述流程，若合法玩家遭拒絕或驗證率異常則暫停 Firestore Enforcement、回到監控並排查，不改寬安全規則。

### P2-2：舊房間資料保留與清理（Spark 友善）

以下期限為建議的初始政策，未經正式遊戲運營驗證；依實際使用量調整。依 Firestore 伺服器文件 updateTime 及 players/votes 子文件 updateTime 取最近一次活動，避免信任用戶端可改動的 createdAt / joinedAt / at。清理工具僅讀取，不會自動刪除。

| 階段 | 無活動至少 | 處置 |
|---|---|---|
| finished | 7 天 | 列為人工審核候選；確認無保留需求再刪除 |
| lobby | 7 天 | 列為候選；確認無活動安排再刪除 |
| voting / reveal | 30 天 | 列為候選；特別確認並非進行中的局 |
| 未知階段或時間 | 不適用 | 跳過，人工檢查 |

- 不使用付費 TTL 或 Cloud Functions，不自動升級 Blaze；普通 Firestore 讀取與刪除仍消耗每日免費配額，超過配額時停止。
- 目前過期定義是「管理員清理候選」，不是服務端房間存取到期。舊房間在刪除前仍可依原規則重新加入。若要強制禁止過期房間存取，另規劃伺服器可信時間欄位、Rules 與舊房遷移的分階段部署，不用瀏覽器時間當安全邊界。
- 一般玩家不得刪除 rooms、players、votes；維持現行規則，無需重新發布。
- Firestore 刪除父文件不會自動刪除子集合。須遞迴刪除個別房間，避免孤兒玩家和投票文件；不得刪除整個 rooms 集合。
- 管理員工具 admin/preview-old-rooms.cjs 預設每次最多掃描 50 個房間；候選每個已知子集合最多讀 501 筆，超限跳過。只列房號、階段、活動時間和候選理由，不輸出暱稱與投票內容；不掃描已無父文件的孤兒資料，另行人工檢查。管理員須在低流量維護時段確認無正在進行的遊戲，刪除前再次掃描指定房間。任何活動可能在讀取和刪除間發生，工具不是交易鎖。

#### 本機管理員操作（非網站操作）

在受信任本機 clone 專案，確認 Firebase 專案 ID 為 moqi-party。使用具有適當 Firestore 讀取權限的 Google 帳號建立 ADC（例如 gcloud auth application-default login）。管理員 SDK 繞過 Rules，切勿放在前端、GitHub Actions secrets 或公開網站，不要下載或提交私鑰。預覽用帳號優先採唯讀權限；實際刪除用另行授權的管理員身份。

```bash
npm install --no-save --package-lock=false firebase-admin
node --test tests/room-retention.cjs
node admin/preview-old-rooms.cjs --project moqi-party
# 如果輸出 nextAfter，將實際值放在下列命令（不得使用示例作為刪除目標）
node admin/preview-old-rooms.cjs --project moqi-party --after ABC234
# 重新檢查已審核的單一房間
node admin/preview-old-rooms.cjs --project moqi-party --room ABC234
```

預覽完成後只在人工確認、備份需求評估及維護窗口內執行個別房間遞迴刪除。下方 ROOM_CODE 必須替換成已確認的實際房號；不加 --force，保留 CLI 確認。刪除不可復原，若不確定則停止。

```bash
npx firebase-tools login
npx firebase-tools firestore:delete rooms/ROOM_CODE --recursive --project moqi-party
```

刪除後在 Firebase Console 驗證該房間及 players / votes 均無殘留；記錄日期、房號、原因及結果，不保存玩家個資。若 CLI 部分失敗，檢查該房路徑是否有殘留子集合，再針對同一已核准路徑處理。

| 追蹤項目 | 狀態 | 驗收 |
|---|---|---|
| App Check 初始化、自動刷新 | 程式碼確認 | 真實跨裝置重測 |
| App Check 友善錯誤指引 | 本次修改 | Enforcement 開啟後重測 |
| Firestore Enforcement | 待管理員 | Console 切換 + 測試 |
| Authentication Enforcement | 暫不啟用 | 另行評估 |
| 清理候選政策與唯讀工具 | 本次新增 | 合成資料測試 + 本機 ADC 預覽 |
| 首次正式資料刪除 | 未執行 | 管理員審核及遞迴刪除 |
| 自動封鎖過期房間／排程 | 待後續評估 | 不改寬現有規則 |

官方參考：https://firebase.google.com/docs/app-check/enable-enforcement 、https://firebase.google.com/docs/firestore/manage-data/delete-data 、https://firebase.google.com/docs/firestore/quotas

## P2-4 實機回報：主持人已作答人數延遲（2026-11-25）
使用者確認手機已成功送達，但桌機主持人票數常延遲至倒數 3–5 秒。尚未取得網路追蹤資料，不能確定 App Check 或 Firestore watch 是根因。保留 onSnapshot，增加主持人專用 getCountFromServer 聚合查詢，每 2 秒最多一次、每題最多 24 次、同時最多一個（同一題），不在示範、背景分頁、非主持人或結算時查詢，全員完成即停止；按房間與題號隔離結果。聚合只更新顯示，最終計分仍用 getDocsFromServer 投票文件。額外聚合查詢有最低讀取計費，20 人以內每場 12 題最多 288 次（實際通常較少；依索引讀取計費）。不修改安全規則或 App Check。驗收：30 秒題目，手機確認送達後紀錄主持人數字變化時間，至少連續 6 題，目標正常網路 1–3 秒內；再確認重連、提前揭曉與最終分數，未實測前不可宣稱延遲已根治。
