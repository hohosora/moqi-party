# Firebase 環境狀態

下表依據 2026-11-25 的 Windows 工作階段回報。本次文件提交未連線查詢正式資料。

| 項目 | 已知結果 |
|---|---|
| 本機工具 | PowerShell 已驗證 Node.js v26.13.1、npm 與 npx 11.20.0 可執行。 |
| 專案連線 | 官方 Firebase MCP Server 已啟動，Google 帳號已授權，已選取既有專案 moqi-party，狀態為 ACTIVE。 |
| 控制台 | 已列出預設資料庫 (default) 的 rooms 集合並唯讀開啟一份文件。 |
| MCP 直接查詢 | 尚未驗證。原工作階段未載入 Firestore 查詢工具，本機工作目錄已加入最小 firebase.json。接手端須以實際查詢結果更新此列。 |
| PowerShell CLI | 讀取登入檔時回報 EPERM，原因待查。排查時僅記錄操作與錯誤類別，不讀出或提交憑證內容。 |

第 5 階段的掃描範圍與完成條件見 [AI 任務](AI-TASKS.md)。
