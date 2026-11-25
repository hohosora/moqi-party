# 測試紀錄

## 2026-11-25 · main / d4a0644

| 檢查 | 結果與依據 |
|---|---|
| UI 與計分回歸 | [GitHub Actions 通過](https://github.com/hohosora/moqi-party/actions/runs/45554325980)。此版本已納入主持人票數同步及舊房間保留政策測試。 |
| Firestore 規則回歸 | [GitHub Actions 通過](https://github.com/hohosora/moqi-party/actions/runs/45554326020)。 |
| GitHub Pages | [建置與部署成功](https://github.com/hohosora/moqi-party/actions/runs/45554325770)。 |
| 主持人票數實機驗收 | 待測。依 [P2-4](P2-security-hardening.md)，每題 30 秒，至少連測 6 題，量測手機送達至桌機主持人更新的時間（正常網路目標 1–3 秒），並核對重連、提前揭曉與最終分數。 |
| Firestore 讀取 | 依環境回報，控制台唯讀開啟文件成功。MCP 直接讀取 rooms 待驗證；PowerShell CLI 讀取登入檔遇 EPERM。 |
| P2 第 5 階段正式房間預覽 | 尚未執行。掃描數、候選數及跳過數均未取得。 |

本次文件核對採用 GitHub 既有執行紀錄，未另外重跑遊戲或連線 Firebase。

## 2026-11-25 · P2 第 5 階段唯讀預覽

依據 PR #32（`f306c0a`）及 main `d4a0644` 的 P2-2 保留政策與預覽工具。已登入的官方 MCP 回報作用中專案為 `moqi-party`，但其工具清單缺少 Firestore 查詢。使用本機 Firebase CLI 15.37.0 啟動獨立 MCP，列出查詢工具後，對正式 `(default)` 資料庫的 `rooms` 送出上限 3 筆的唯讀請求。該程序在 CLI 登入檢查時拒絕請求，試查筆數未取得。

| 分頁涵蓋 | 實際掃描房間數 | 人工審核候選數 | 跳過數 |
|---|---|---|---|
| 首頁前停止，已完成 0 頁 | 未取得 | 未取得 | 未取得 |

全部房間均未評估；尚未讀取房間或子集合的伺服器 `updateTime`，無從分類個別跳過原因。接手時須先在已授權且提供查詢工具的同一程序重試 3 筆查詢，成功後從首頁執行 P2-2 預覽。
