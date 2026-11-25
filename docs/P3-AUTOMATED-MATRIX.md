# P3 無真人測試矩陣及登入診斷

基線 #44 合併 ffa9cef。新增 P3 automated game matrix PR CI，兩個獨立工作。Emulator 2、5、10、15、20 人各六題，共 30 回合、312 票預期，使用真實 app.js 入房與計分 helpers、候選 Rules、並行投票、逐回合所有玩家讀回分數、重複投票拒絕、離線再連線及 21 人拒絕。耗時僅本機 emulator，不可視為雲端 SLA。瀏覽器 Chromium 桌機、Chromium Android、WebKit iPhone、Firefox 窄版 × 3 主題，執行 demo 作答／揭曉／重新整理；阻止外部網路。未聲稱真實 iOS 裝置或雲端 App Check。

診斷僅 moqi-party-staging.web.app 且 URL 加 diagnostics=1；記錄 SDK、App Check、Auth、房間、名單、首次非快取快照等耗時與成功/失敗，最多 100 筆純記憶體記錄。瀏覽器 console 可執行 window.__MOQI_CONNECTION_DIAGNOSTICS__() 查看；不傳送、不存 localStorage、不輸出 token、UID、房號、暱稱、原始錯誤。加入或建房時保留 diagnostics 參數，重新整理仍可啟用（資料不跨頁保留）；僅診斷模式訂閱 room/roster metadata 事件，等待首次非快取快照。正式站不啟用。未修改金鑰或 Rules、兩開關保持關閉。尚未取得此 PR CI。

雲端 API 7/8/25 對照、reCAPTCHA 真實取證與 iOS Safari 裝置差異不能由 emulator 或無頭 browser 完整取代；需以已授權 Firebase Codex 的 staging browser 執行受控自動測試，不應要求使用者先手動操作。維持正式 25 項；不能以測試環境結果直接判定正式重加異常的根因。
