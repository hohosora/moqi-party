# Firebase 環境狀態

## 2026-11-25 · 正式環境

使用者確認 Cloud Firestore 的 App Check 已強制執行，Authentication 維持監控。設定狀態依使用者回報記錄。第 5 階段唯讀預覽共掃描 12 間房間，候選 0、跳過 0、刪除 0。詳見[最終驗收紀錄](TEST-LOG.md#p2-最終驗收)。

下表依據 2026-11-25 的 Windows 工作階段回報。最新一次已完成正式資料唯讀預覽。

| 項目 | 已知結果 |
|---|---|
| 本機工具 | PowerShell 已驗證 Node.js v26.13.1、npm 與 npx 11.20.0 可執行。 |
| 專案連線 | 官方 Firebase MCP Server 已啟動，Google 帳號已授權，已選取既有專案 moqi-party，狀態為 ACTIVE。 |
| 控制台 | 已列出預設資料庫 (default) 的 rooms 集合並唯讀開啟一份文件。 |
| MCP 直接查詢 | 獨立官方 MCP 完成授權。CLI 15.37.0 的 `firestore_query_collection` 收到 `INVALID_ARGUMENT`（read_time 在未來）；改用同一 MCP 的 `firestore_list_documents` 成功試讀 3 筆並完成分頁。 |
| PowerShell CLI | 沙箱帳號讀取使用者登入檔及其 ACL 時遭拒（`EPERM`）。改用獨立設定目錄後 CLI 15.37.0 可啟動，並以獨立授權完成查詢。原檔的個別 ACL 規則未能驗證。 |

第 5 階段的掃描範圍與完成條件見 [AI 任務](AI-TASKS.md)。
