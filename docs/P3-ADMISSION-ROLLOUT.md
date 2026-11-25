# P3-2 遊戲入房協定整合（暫未啟用）
基準 main 7cf36b6；#40 隔離測試與依賴工具已合併。此 PR 將入房概念接到 app.js、firestore.rules 與既有 emulator suite，待本 PR CI。正式 Firebase 未變更。
- protocol:3 房間沿用 rooms / players / votes；新增 roomInvites，僅 exact get 且不含玩家識別資訊。房間建立以三筆 batch；加入以交易保證席位與 player 互相驗證。開始第一題以交易同步關閉入房。會員才可讀取 V3 完整房間、名單、投票；會員仍可讀彼此投票，計分仍由主持人，留給 P3-4。
- 既有房間（無 protocol）保留舊流程與權限。兩個編譯常數 READS_ENABLED 與 CREATE_ENABLED 皆為 false；合併此 PR 不會啟用新版建房、不會增加 invite lookup。不得以 URL 或 localStorage 開啟。
- 測試直接取出 app.js 協定 helpers，使用同一 emulator rules 驗證 12 題房、原子建立、會員隔離、20 人、並行最後席位、21 人拒絕、重連、開始、投票及揭曉。既有舊版斷言保留；尚未取得新 CI 結果。測試並非完整實機遊戲。
- 發布順序：P2.5 金鑰隔離驗收與結案／風險核准 → CI 確認 → 授權管理工作階段部署相容 Rules（保存原版本，先核對正式舊房、App Check、配額）→ 啟用 READS 並驗證新版前端在舊房正常 → 受控測試環境啟用 CREATE，驗證桌機手機與重新整理、投票、同步、提前揭曉、計分 → 正式建房啟用另行 PR。不得在 Rules 更新前開啟 READS。若新房有問題，停止 CREATE，保留 READS 及相容 Rules 至 V3 房結束；不可直接回退到舊 Rules 暴露 V3 資料。舊客戶端不能加入 V3，邀請需提示更新頁面；正式開啟前補足可辨識錯誤訊息及實機快取驗證。
- 舊版建房仍可繞過硬上限；後續待舊客戶端退場才停用 legacy create，既有房間維持到結束。保留政策若遞迴清理 V3，需另行核對並清除對應 roomInvites；目前不執行刪除。P3-3 時間/限流、P3-4 保密與可信結算、P3-5/7 穩定性與完整壓測仍待實作。
