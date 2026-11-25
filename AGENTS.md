# ChatGPT 與 Codex 協作規範

接手工作時先讀 [專案狀態](docs/PROJECT-STATUS.md) 和 [任務清單](docs/AI-TASKS.md)，確認目前分支、任務狀態與授權範圍。GitHub 保存交接紀錄；另一個工作階段須收到讀取指令才會接手，工具與登入狀態須在接手端確認。

- 從最新 main 建立工作分支，以 PR 提交。保留既有文件與歷史紀錄。
- Firebase 任務先讀 [環境狀態](docs/FIREBASE-STATUS.md) 與 [P2 政策](docs/P2-security-hardening.md)。第 5 階段僅授權唯讀預覽，禁止寫入或刪除 Firebase 資料、修改遊戲功能、安全規則或 App Check 設定。
- 文件、提交、PR 與聊天回報只用彙總資訊。禁止收錄私鑰、登入權杖、登入檔、房號、玩家識別資料、投票內容或原始查詢輸出。
- 完成或受阻時更新任務狀態，在 [測試紀錄](docs/TEST-LOG.md) 註明日期、版本、方法、結果及未驗項目。環境有變化時同步更新 Firebase 狀態。
