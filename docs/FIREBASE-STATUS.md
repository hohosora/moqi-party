# Firebase 環境狀態

## 正式實機第二輪結果

7 項設定下票數更新正常，但手機重新整理後重加延遲；正式金鑰已回復 25 項並讀回核實。正式 Rules 暫緩發布。[實機回報與 staging 對照](P25-P32-CLOUD-ACCEPTANCE.md)。

## 2026-11-25 · P2.5／P3-2 雲端驗收

使用者回報桌機、實體手機操作順暢，退出重加正常。正式 Web key 由 25 項縮至 7 項後，正式 Pages 自動瀏覽器取證收到 403，已還原並讀回原有完整 25 項限制。原設定複測亦遭拒絕裝置證明。正式 Rules 發布暫停，警示 #1 保留。[版本、驗收與還原證據](P25-P32-CLOUD-ACCEPTANCE.md)。

## P2.5 · 30 天金鑰使用查核

已核對 25 項 API targets，14 項服務已啟用。最近 30 天 94 次請求可歸屬此 Web key；建議先在隔離環境驗證 7 項清單，第三方 Rules REST 用途未排除時保留第 8 項。 [完整查核與修正方案](P25-KEY-REVIEW.md)

## 2026-11-25 · P2.5 金鑰查核

GitHub Secret Scanning [#1](https://github.com/hohosora/moqi-party/security/secret-scanning/1) 唯讀查詢結果為 open。記憶體比對 Firebase Management 提供的正式 Web App SDK 設定與 `firebase-config.js:11` 相符。以該 Web App 的 apiKeyId 查詢 API Keys v2 中對應的金鑰中繼資料。瀏覽器限制為 `https://hohosora.github.io` 與 `https://hohosora.github.io/*`，同一來源其他 Pages 路徑也在範圍內。

金鑰設有 25 個 API targets。前端使用 Authentication、Secure Token、Firestore 與 App Check。准許的其他服務包括 Cloud SQL Admin、Firebase ML、Firebase AI Logic、App Hosting、Data Connect、Cloud Storage for Firebase、Cloud Logging。Service Usage 已啟用清單包含 Firestore、Identity Toolkit、Secure Token、App Check、Logging、BigQuery、Pub/Sub、Cloud Storage 和 reCAPTCHA Enterprise。已啟用的 BigQuery、Pub/Sub、reCAPTCHA Enterprise 不在金鑰清單；清單中的 Cloud SQL Admin、Firebase AI Logic、Data Connect 未列入已啟用服務。啟用狀態與金鑰可用範圍需分別審核。

Cloud Billing 回覆 `billingEnabled=false`。本次僅查設定，沒有呼叫這些服務來測試計費能力，沒有存取正式房間。來源與用途已確認，API 清單仍需逐項證明必要性。維持警示開啟，處理條件見[任務清單](AI-TASKS.md)。

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
