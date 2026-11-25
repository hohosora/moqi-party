# 雙 AI 任務交接調度器 v1

GitHub Issue → 單一 Windows 桌機輪詢 → 官方 Codex CLI `codex queue --thread UUID --message ...` → 既有本機 session → GitHub issue 回報及 PR。不是遠端桌面、不是 Firebase 代理伺服器、不建立 webhook、不開放入站連線。使用現有 ChatGPT/Codex 登入及 GitHub CLI 登入；不新增 API 計費。實際模型用量仍受方案限制。Codex CLI 必須能看到該桌機 session；既有 Firebase 插件、帳號及核准狀態不會因安裝橋接器而自動轉移。

## Windows 第一次設定（必須由本人在桌機完成）

1. 確認 Node.js 22+、Git、GitHub CLI（`gh --version`）、Codex CLI（`codex --version`）。缺少 gh 可用 `winget install --id GitHub.cli -e`，缺少 Codex CLI 可依官方文件安裝 `npm install -g @openai/codex`，不要另建付費 API key。重新開 PowerShell 後檢查。以 `gh auth login` 登入 github.com，使用瀏覽器核准，`gh api user --jq .login` 必須是 repository owner。
2. 在專用目錄 clone 本 repo，檢查並測試已審核的 main 版本；不要自動 pull 後直接執行新腳本。現有工作樹勿強制 reset。

```powershell
git clone https://github.com/hohosora/moqi-party.git moqi-ai-bridge
cd moqi-ai-bridge
node --test admin/ai-bridge/bridge.test.cjs
codex login status
codex queue --help
```

3. 於 Codex 桌機找出具 Firebase 工作權限之既有 session 的 UUID，核對專案、工作目錄、帳號與權限。可用 CLI `codex resume` 查看 session，勿選錯 session，勿把 UUID 寫到 GitHub。若 CLI 看不到桌機 session 或 queue 不存在，停止；不要切換到危險 sandbox 或任意以新 session 取代。官方 CLI 說明：https://learn.chatgpt.com/docs/developer-commands
4. 本機配置與唯讀檢查（將 UUID 替換為實際值）：

```powershell
node admin/ai-bridge/bridge.cjs --configure --thread "00000000-0000-0000-0000-000000000000"
node admin/ai-bridge/bridge.cjs --check
node admin/ai-bridge/bridge.cjs --once
node admin/ai-bridge/bridge.cjs --once --dispatch
```

`--configure` 一次寫入本機 LOCALAPPDATA（其他系統為 home）下 moqi-ai-bridge-v1/config.json，不覆蓋舊設定；最後一行只允許 probe/status/audit，staging 預設不啟用。先確認既有 session 已空閒、沒有待執行正式變更或未處理的授權；再確認 probe 的 CLI 送達、既有 session 實際收到訊息、沒有 Firebase 操作，並由該 session 回寫 DONE marker。再次 `--once --dispatch` 讀回完成狀態，才進入下一階段。

5. 本人確認 staging 工作階段的 IAM／專案限制及正常 approval policy，才開始自動化 staging。正式專案的憑證若同時存在，提示詞不是 IAM 隔離；推薦另外使用 staging-only IAM 帳號，或保留互動核准並不授權無人正式操作。不能確認安全範圍則維持只允許 probe/status/audit。啟用後預設 60 秒輪詢，前景 PowerShell 必須保持開啟，電腦不得休眠：

```powershell
node admin/ai-bridge/bridge.cjs --once --allow-staging
node admin/ai-bridge/bridge.cjs --watch --dispatch --allow-staging
```

Ctrl+C 停止輪詢；不會撤銷已送達的 Codex 工作。請在首次完整 probe 與 staging 驗收後才考慮 Windows Task Scheduler 開機執行；v1 不安裝背景服務，不自動登入、不修改防火牆。電腦關機、休眠、失去網路、工作階段不可用時無法工作。CLI 回覆成功僅代表 queue 接受，並非 session 已執行。

## GitHub 佇列協議

固定 repo hohosora/moqi-party，僅認可實際 GitHub owner ID 359014506（hohosora）、OWNER association 的 open issues、完整精確標題。PR 與他人 issue 忽略；issue 內容和留言完全不作為 Codex 指令。預先定義的任務只有：
- [AI-QUEUE:PROBE]：只測訊息送達及 issue ack。
- [AI-QUEUE:STATUS]：唯讀版本與 CI 狀態。
- [AI-QUEUE:AUDIT]：唯讀相依審查。
- [AI-QUEUE:STAGING]：需本機 --allow-staging，僅 staging 自動化驗收；既有 issue #46 也可作為此固定類型。本機 ledger 必須先記錄已確認 DONE 的 probe，即使傳入 --allow-staging 亦不能跳過。
未設 production 任務類型。Issue #46 的正式部分一律不能由自動調度器執行。任何正式 API Key、Rules、App Check、計費、發布旗標變更仍走人工授權和既有發布關卡。

本機每次只處理一個任務，先寫入不可覆蓋的 job 檔，再張貼 owner claim marker，才呼叫 CLI。CLI 接受後記錄 QUEUED。實際 Codex 必須在同一 issue 的首行回覆精確的 DONE 或 BLOCKED + task UUID。橋接器只讀 owner 留言、匹配 token，且只信任 claim 後的時間；完成仍是 Codex 自報，須由 ChatGPT 驗收 evidence/CI/PR。未知送達、崩潰、失去權限不自動重送；同一 issue 不重複執行。遠端 claim 也阻止新本機 ledger 再派。GitHub comment 不是分散式原子鎖，v1 僅支援單桌機單實例，不允許同時在第二台電腦啟動。發生 stale dispatcher.lock 時先確認程序確實停止、Codex 是否收到及是否回報，再人工處理；不得為重試盲目刪除 job/lock。所有任務重試以新 issue 建立並審核，舊 issue 保留。

本機 config、job、lock 不進 repo，不包含 Firebase token 或 key；不回寫原始 CLI 輸出。GitHub 只保存公開可見的彙總資訊、固定 status 與證據。此設計不是權限沙箱：真正的 Firebase IAM、Codex approval 與登入狀態依現有管理端控制，未驗證不得啟用 staging 寫入。正式環境仍禁止無人自動變更。

## 驗收

CI Windows/Ubuntu 只跑本地 mock 測試，不連 GitHub 或 Firebase，不呼叫 Codex CLI。真正的 CLI 語法支援、桌機 session 可達性、owner auth、Firebase stage scope 和回寫需首次桌機 probe 驗證。此 PR 不修改遊戲前端、Rules、正式金鑰、計費或 App Check；未開始桌機工作。
