# P1 安全保護啟用清單 — 默契失控局

> 狀態：GitHub 原始碼已加強；正式 Firebase 安全規則、帳務預算及 GitHub 分支保護仍需由有管理權限的帳號啟用。**GitHub Pages 部署不會自動更新 Firebase 資料庫安全規則。**

## 1. GitHub 正式程式碼的分支保護（需儲存庫管理員操作）

1. 開啟 https://github.com/hohosora/moqi-party/settings/rules
2. 建立針對預設分支 `main` 的 branch ruleset（或使用 Settings → Branches → Add branch protection rule）。
3. 建議啟用：禁止刪除分支、禁止 force push、Require a pull request before merging、Require status checks to pass before merging。
4. Required checks 選擇目前已成功執行的：
   - `Verify themes and scoring logic`
   - `Validate Firestore rules with emulator`（此 check 只在有修改 Firestore 規則與相關設定時觸發，若設定成每個 PR 的必要檢查，需相應修改 workflow，使所有 PR 都執行，否則其他類型 PR 可能永遠等待。）
5. 單人維護者不要強制啟用「需要另一位 reviewer 批准」，否則無法自行核准自己的 PR。
6. 儲存後回到 https://api.github.com/repos/hohosora/moqi-party/branches/main ，確認 `protected` 變成 `true`。
7. **注意：** 設定 PR-only 保護後，既有的 ChatGPT／GitHub 檔案直接寫入 `main` 會被拒絕。後續應改成「建立分支 → 修改 → 發 PR → CI 通過 → 合併」的流程。

## 2. Firebase Firestore Rules 發布（需 Firebase Console 權限）

- 先確認 Firebase Console 專案確實是目前 `firebase-config.js` 所連接的正式多人遊戲專案。
- 本儲存庫的 `firestore.rules` 已新增 P1 限制，包含：
  - 限制房間建立欄位、題數、題目文字大小、主題與快速開局情境資料。
  - 僅房主可變更視覺資訊，或透過合法遊戲狀態轉換更新計分。
  - 限制玩家暱稱、加入資料、投票內容，拒絕超出規格的值。
  - 保留前端建立房間／加入玩家／投票／開獎／排名的必要讀寫權限。
- 先確認 GitHub Actions `Firestore rules security regression` 已測試成功。
- 先備份 Firebase Console 中目前生效的規則，再將 GitHub `firestore.rules` 貼入 Firebase Console → Firestore Database → Rules → Publish；或在具有正式專案權限的受信任本機環境執行：
  ```bash
  npm install
  npm run test:rules
  npx firebase-tools login
  npx firebase-tools deploy --project <你的正式 Firebase projectId> --only firestore:rules
  ```
- 避免在公開網站、GitHub 檔案、聊天或終端紀錄分享 Firebase Admin SDK 私鑰、Service Account 金鑰或登入 Token。
- 發布後以 2 支手機／2 個匿名使用者，驗收：建立房間、加入玩家、開局、投票、開獎、下一題、雙倍王牌、排行榜、主題切換。
- 如有權限錯誤，將規則還原為備份版本後再檢查；不要在未測試前直接將正式規則切換成大量 `allow false`。

## 3. Firebase 用量與費用通知（需 Firebase / Google Cloud 管理權限）

1. Firebase Console → Cloud Firestore → Usage，先查看文件讀取、寫入、刪除及儲存用量。
2. Firebase Console → Firestore → Rules 查看規則遭拒絕請求的趨勢，辨識突然出現的異常流量。
3. 若已使用 Blaze，進入 Google Cloud Console → Billing → Budgets & alerts，為與 Firebase 專案關聯的帳務建立警示，例如每月 NT$150 / NT$300（依實際預算調整）以及 50% / 90% / 100% 通知門檻。
4. Firestore Usage Dashboard 是近似操作量，**不是精確的帳單**；帳單金額以 Billing 內容為準。
5. **Budget alert 只會通知，不是用量上限，也不會自動停止 Firebase 服務。**
6. 如需異常讀取、寫入或 denied requests 的主動警報，使用 Cloud Monitoring 設定相應的 Firestore metrics alerts。

## 4. 本階段限制

- **沒有**伺服器端每人／每 IP 開房次數限制；匿名登入仍可能被重建。
- **沒有**從前端真正強制 20 人上限：Firestore Security Rules 無法可靠計數子集合文件，之後要用受控後端處理。
- **沒有**完全阻擋知道房號的人讀取投票：既有投票人數同步需要目前的讀取權限，未來需改造同步模式才可隔離。
- **沒有**啟用 Firebase App Check（屬 P2）。
- 此清單僅代表完成前必須執行的項目，不能把原始碼提交等同正式設定已生效。
