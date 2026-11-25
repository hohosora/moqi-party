# Firebase 環境狀態

下表依據 2026-11-25 的 Windows 工作階段回報。本次已嘗試正式資料查詢，於登入檢查停止。

| 項目 | 已知結果 |
|---|---|
| 本機工具 | PowerShell 已驗證 Node.js v26.13.1、npm 與 npx 11.20.0 可執行。 |
| 專案連線 | 官方 Firebase MCP Server 已啟動，Google 帳號已授權，已選取既有專案 moqi-party，狀態為 ACTIVE。 |
| 控制台 | 已列出預設資料庫 (default) 的 rooms 集合並唯讀開啟一份文件。 |
| MCP 直接查詢 | 已登入的外掛可確認專案，但未列出查詢工具。獨立官方 MCP 以 `--only firestore` 啟動後可列出 `firestore_list_collections` 與 `firestore_query_collection`；後者在讀取前回報 CLI 未登入。 |
| PowerShell CLI | 沙箱帳號讀取使用者登入檔及其 ACL 時遭拒（`EPERM`）。改用獨立設定目錄後 CLI 15.37.0 可啟動，但未承接登入狀態。原檔的個別 ACL 規則未能驗證。 |

第 5 階段的掃描範圍與完成條件見 [AI 任務](AI-TASKS.md)。
