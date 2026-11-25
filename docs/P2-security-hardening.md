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
