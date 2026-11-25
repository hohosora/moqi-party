# 測試紀錄

## 2026-11-25 · P2.5 依賴與安全性驗證

P2 結案 PR #34 合併於 `36e5c47`。[Rules](https://github.com/hohosora/moqi-party/actions/runs/45563186274) 與 [UI／計分](https://github.com/hohosora/moqi-party/actions/runs/45563186194) 皆成功。下方六題實測屬 P2 正式版驗收。

| 更新 | 合併版本 | main 上成功的工作 |
| --- | --- | --- |
| #26 firebase-tools 14.27.0 → 15.37.0 | caed4e7 | [Rules](https://github.com/hohosora/moqi-party/actions/runs/45563961010)、[Pages](https://github.com/hohosora/moqi-party/actions/runs/45563960586) |
| #24 checkout v4/v5 → v7 | 01c6711 | [Rules](https://github.com/hohosora/moqi-party/actions/runs/45564141894)、[UI](https://github.com/hohosora/moqi-party/actions/runs/45564141880)、[Pages](https://github.com/hohosora/moqi-party/actions/runs/45564141002) |
| #22 setup-java v5 → v6，Temurin 21 | 381766c | [Rules](https://github.com/hohosora/moqi-party/actions/runs/45564349858)、[Pages](https://github.com/hohosora/moqi-party/actions/runs/45564348927) |
| #35 取代 #23，setup-node v4/v5 → v7 | 92df403 | [Rules](https://github.com/hohosora/moqi-party/actions/runs/45564734423)、[UI](https://github.com/hohosora/moqi-party/actions/runs/45564734341)、[Pages](https://github.com/hohosora/moqi-party/actions/runs/45564733638) |

#36 合併版本為 `790f6a2`。PR 的 [UI／計分](https://github.com/hohosora/moqi-party/actions/runs/45564854644) 與 [Rules](https://github.com/hohosora/moqi-party/actions/runs/45564854675) 均成功（39 項模擬器權限斷言）。main 合併後通過 [Rules](https://github.com/hohosora/moqi-party/actions/runs/45565075347) 與 [Pages](https://github.com/hohosora/moqi-party/actions/runs/45565075007)。UI 工作在這次 push 依路徑篩選未觸發。

CI 使用 GitHub 管理的 Ubuntu runner。#26 的發布說明列出 MCP SDK、undici 與 proxy-addr 的安全修補。三個 Actions 均核對上游公告頁與 PR diff，沒有將例行版本升級認定為特定 CVE 修補。#26 和 #22 合併時，main 的路徑篩選只觸發 Rules 與 Pages；原 PR 的 UI 也通過。

#25 的 [job 138940429128](https://github.com/hohosora/moqi-party/actions/runs/45535336444/job/138940429128) 顯示 rules-unit-testing 4.0.1 要求 firebase ^11；#27 的 [job 138940600192](https://github.com/hohosora/moqi-party/actions/runs/45535386833/job/138940600192) 顯示 6.0.0 要求 firebase ^13。兩者均在 npm 安裝時 ERESOLVE。6.0.0 另要求 Node >=24.12.0。此前工作使用 Node 22、無鎖定檔，每次重新解析依賴。

#36 的 [Rules job](https://github.com/hohosora/moqi-party/actions/runs/45564854675/job/139037048713) 已用 Node 24.22.3、Java 21 與 npm ci 通過。測試端使用 firebase 13.4.0、rules-unit-testing 6.0.0、CLI 15.37.0，正式站仍從 gstatic 載入 11.10.0。鎖檔中 713 個含下載來源的項目均來自官方 npm registry 且有 integrity。舊版組合與單純配對新版皆有 5 個 high、14 個 moderate、0 個 critical 的套件項目。針對 Firestore Node 相依指定已修補的 gRPC 1.14.7 後，high 與 critical 均為 0。

尚有 14 個 moderate 套件項目（含上層相依），涵蓋 [OpenTelemetry](https://github.com/advisories/GHSA-8988-4f7v-96qf)、[glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)、[minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249)、[uuid](https://github.com/advisories/GHSA-w5hq-g745-h8pq)。這是 npm 測試依賴樹的稽核範圍。後續應分支驗證上游升級，重新執行 npm audit、npm ci、完整 Rules 與 UI 工作，並於 Firestore 上游支援修補版後檢視 gRPC override。前端 CDN 與瀏覽器測試工具各自獨立於此鎖檔。

## P2 最終驗收

2026-11-25，P2 結案。驗收版本為 main [e90d8b8](https://github.com/hohosora/moqi-party/commit/e90d8b8e6b905e928b289c890d122564fab5baac)，[正式 Pages 建置與部署成功](https://github.com/hohosora/moqi-party/actions/runs/45561057609)。

使用者於正式站以手機送出答案，觀察桌機主持人票數更新。第 1 至 6 題依序約為 **3、1、1、1、1、1 秒**，平均約 **1.33 秒**，最大約 **3 秒**，**6/6 題達到 1–3 秒目標**。重新加入、提前揭曉及最終計分均正常。秒數來自使用者回報，未另行獨立量測。

第 5 階段唯讀預覽共掃描 12 間房間，候選 0、跳過 0、刪除 0。使用者確認 Cloud Firestore 的 App Check 已強制執行，Authentication 維持監控。

以下保留各次核對的歷史結果。「待測」及「正式環境未量測，0 題」記載的是使用者回報前的狀態，已由本節取代。

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

### 2026-11-25 · 依 PR #33 再次試查

沿用 main `d4a0644` 的 P2-2 政策與 `9445d87` 的交接紀錄。已登入的外掛仍可辨識專案，但未列出 Firestore 查詢工具。獨立官方 MCP 已對 `moqi-party` 預設資料庫的 `rooms` 重試上限 3 筆的唯讀查詢，於 CLI 登入檢查停止。該程序已啟動 Google 授權流程，待操作者完成。

本次試查筆數、實際掃描房間數、候選數與跳過數均未取得。已完成 0 頁；未進入首頁或讀取子集合。完成授權後須先驗證 3 筆試查，再從首頁執行預覽。

### 2026-11-25 14:24（臺北）· P2 第 5 階段完成

同一官方 MCP 程序完成 Google 授權後，`firestore_query_collection` 的正式資料請求因指定的 `read_time` 在未來而收到 HTTP 400。以官方 MCP `firestore_list_documents` 對 `moqi-party` 的 `(default)/rooms` 設定上限 3 筆，成功返回 3 筆。試查與正式掃描分開計數。

| 政策版本 | 分頁涵蓋 | 實際掃描 | 人工審核候選 | 跳過／未評估 |
|---|---|---:|---:|---:|
| main `d4a0644` 的 P2-2 | 全部 1 頁，無後續頁 | 12 | 0 | 0 |

以每頁最多 50 筆列出房間，只要求 `phase` 欄位與文件中繼資料。使用 Firestore 服務的 HTTP 日期作為判定時間（06:24:30 UTC），沿用 `admin/room-retention.cjs` 的 `assessRoom`。12 間房間的父文件 `updateTime` 全部在各自階段的保留期內（lobby、finished 為 7 天；voting、reveal 為 30 天）。依既有預覽工具的父文件初篩，沒有房間需要檢查 players 或 votes，子文件讀取數為 0。全程僅讀取正式資料，紀錄只保留彙總。

## 2026-11-25 · #33、#32 合併與正式部署驗收

| 階段 | 核對的提交 | 結果 |
|---|---|---|
| [#33](https://github.com/hohosora/moqi-party/pull/33) 合入 #32 分支 | head `cc292bbd4e0ab6f0e18febf9883f525858fd7df8`，base 為 #32 分支的 `f306c0a` | [UI 與計分](https://github.com/hohosora/moqi-party/actions/runs/45560477343)、[Firestore 規則](https://github.com/hohosora/moqi-party/actions/runs/45560477326) 均成功。合併時鎖定上述 head，產生 `c9213c931fd18bea4bb7931ca966fc3d2d0d4f23`。 |
| 更新後的 [#32](https://github.com/hohosora/moqi-party/pull/32) 合入 main | head `c9213c931fd18bea4bb7931ca966fc3d2d0d4f23` | [UI 與計分](https://github.com/hohosora/moqi-party/actions/runs/45560858090)、[Firestore 規則](https://github.com/hohosora/moqi-party/actions/runs/45560858040) 均成功。以同一 head 合併，main 提交為 [e90d8b8](https://github.com/hohosora/moqi-party/commit/e90d8b8e6b905e928b289c890d122564fab5baac)。 |
| 正式 Pages | `e90d8b8e6b905e928b289c890d122564fab5baac` | [建置與部署成功](https://github.com/hohosora/moqi-party/actions/runs/45561057609)。部署完成後從[正式站](https://hohosora.github.io/moqi-party/)讀回首頁及其直接引用的 3 份 CSS、4 份 JS，以 Git blob SHA-1 對照此提交，8/8 相符。 |

正式首頁引用 `app.js?v=20261125-host-vote-sync-v1`，檔案 blob 為 `9e634eca85c8ed9aa827823b72f0b51c69c913f2`。主持人同步功能來自 [#31](https://github.com/hohosora/moqi-party/pull/31)，#32、#33 僅更新協作文件。

**主持人票數同步：正式環境未量測，0 題。** 正式站開房、加入及投票會寫入 Firestore，因此只讀取公開靜態檔案。既有實機回報記載，改善前手機已確認送達，主持人有時到倒數剩 3–5 秒才看到票數。此數字是題目剩餘時間。每 2 秒最多一次是新版的查詢頻率；目前沒有本版手機送達至主持人畫面更新的成對時間戳。

依 [P2-4](P2-security-hardening.md)，仍待在可寫入的獨立測試環境，以手機與桌機連測至少 6 題、每題 30 秒，核對正常網路的 1–3 秒目標，以及重連、提前揭曉與最終分數。既有第 5 階段唯讀掃描的 12 間、候選 0、跳過 0 沿用上節紀錄。
