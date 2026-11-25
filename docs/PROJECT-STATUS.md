# 專案狀態

## 2026-11-25 · P2.5／P3-2 雲端驗收

長期 Spark 測試站已部署 main `417c79a`。7 項 API 清單、舊房 8 題流程與 V3 的 20 人上限已在隔離雲端驗證；實體手機驗收與正式發布待完成。[版本、實際操作、證據與還原](P25-P32-CLOUD-ACCEPTANCE.md)。

## P2.5 · 30 天金鑰使用查核

Secret Scanning #1 唯讀查核完成，警示維持 open。限制提案、共享來源風險與還原程序已提交，待管理者確認後再進入隔離驗證。 [完整查核與修正方案](P25-KEY-REVIEW.md)

## 2026-11-25 · P2.5 供應鏈修正已合併，金鑰警示待審

#26、#24、#22 已依序合併。#23 與當時 main 衝突，以 [#35](https://github.com/hohosora/moqi-party/pull/35) 取代。[#36](https://github.com/hohosora/moqi-party/pull/36) 聯合取代 #25、#27；三個舊 PR 均已關閉，未直接合併。測試端使用 firebase 13.4.0、rules-unit-testing 6.0.0 與 firebase-tools 15.37.0。詳細版本、回歸與剩餘中度公告見[測試紀錄](TEST-LOG.md)。

從 P2 結案版本至 #36，程式差異只在兩個 GitHub Actions 工作流程、package.json 與新增的 npm 鎖定檔。正式前端、計分與 firestore.rules 相同。本次使用 demo 模擬器回歸。Cloud Billing 回報未啟用計費。金鑰用途已核實，但 API 清單超出遊戲直接使用範圍，[警示 #1](https://github.com/hohosora/moqi-party/security/secret-scanning/1) 仍開啟。[下一步與驗收條件](AI-TASKS.md)。

## 2026-11-25 · P2 已結案

驗收版本為 main [e90d8b8](https://github.com/hohosora/moqi-party/commit/e90d8b8e6b905e928b289c890d122564fab5baac)，[正式 Pages 建置與部署成功](https://github.com/hohosora/moqi-party/actions/runs/45561057609)。使用者回報六題同步均達標，重新加入、提前揭曉及最終計分正常。詳見[最終驗收紀錄](TEST-LOG.md#p2-最終驗收)。

第 5 階段唯讀預覽共掃描 12 間房間，候選 0、跳過 0、刪除 0。使用者確認 Cloud Firestore 的 App Check 已強制執行，Authentication 維持監控。

P2.5 待處理 API Key 警示及相依套件更新。P3 待處理投票保密、匿名濫用防護、硬性人數限制及 10–20 人壓測。

## 歷史狀態 · d4a0644（待驗收狀態已由上述結果取代）

2026-11-25 核對 `hohosora/moqi-party` 的 main，基準為 [d4a0644](https://github.com/hohosora/moqi-party/commit/d4a0644e334287d98f2c48e391b0f4151fbaa19e)。

- [PR #31](https://github.com/hohosora/moqi-party/pull/31) 已合併。主持人畫面保留即時監聽，另以有限次數的伺服器票數查詢更新已答人數。手機送出後的實際顯示延遲仍待驗收。
- 此版本的 UI 與計分回歸、Firestore 規則回歸及 Pages 部署均成功。證據與實機驗收條件見 [測試紀錄](TEST-LOG.md)。
- P2 第 5 階段唯讀預覽已完成。共掃描 12 間，人工審核候選 0、跳過 0。見[測試紀錄](TEST-LOG.md)。

既有 [P1 設定紀錄](P1-security-setup.md) 與 [P2 強化及保留政策](P2-security-hardening.md) 提供各階段的背景。
