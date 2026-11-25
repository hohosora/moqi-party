# P2.5／P3-2 雲端驗收紀錄

## 還原 25 項後的正式站實機複測

使用者在收到「桌機保持開啟、手機投票後於原分頁重新整理並重加」的對照步驟後，回報 25 項正式站測試一切正常；未回報逐步耗時或瀏覽器版本。正式 restrictions 再次讀回，與變更前備份逐項相同。這次回報支持繼續使用 25 項，7 項正式發布驗收仍未通過。

台北時間 2026-11-25 14:36–17:36，Cloud Monitoring 的 consumed_api / api/request_count 指標中，帶此 key 憑證標籤的 HTTP 403 計數為 App Check 3、Identity Toolkit 12。兩者均在 7 項清單內。統計跨越多次測試與設定切換，缺少該手機請求的對應時間和錯誤原因，無法歸因。下次先在 staging 以受影響的實機與瀏覽器重測，分段觀察取證、登入狀態還原、房間讀取及訂閱的耗時，再決定是否重新安排正式縮減。

## 正式實機第二輪：投票同步通過，重新整理後重加延遲

管理者確認正式站 25 項設定下桌機建房與手機加入正常。再次核對發布條件後，正式金鑰暫時縮至 7 項。管理者看到桌機票數更新，但手機重新整理後重加等待很久，直到桌機網頁關閉才進入房間。未取得實際秒數；事件先後不能證明桌機關閉是恢復原因。

已依方案還原，讀回完整 restrictions 與原備份完全相同（25 項）。本輪未部署正式 Rules，保留 V3 關閉及 Secret Scanning #1。以 staging 的 7 項設定針對性複測：桌機房主全程開啟，行動版面 Edge 玩家投票後，在原分頁連續重新整理並重加三次，從重新整理到顯示已投票狀態分別為 1.021、0.978、0.994 秒。此環境未重現實機延遲。正式 25 項後續已回報正常，未提供耗時；必要時依載入 SDK、App Check、Auth 還原、房間與玩家查詢及訂閱分段量測，只記錄時長與錯誤類別。

2026-11-25，版本 `417c79a13055bf253af98ca95990763fafc1b234`。#42 合併為 `daf70aeb`，#43 合併為 `417c79a1`。[main Rules 工作](https://github.com/hohosora/moqi-party/actions/runs/45577958791) 實際日誌為 104 項模擬器權限斷言通過。[main Pages 部署](https://github.com/hohosora/moqi-party/actions/runs/45577957703) 成功。Pages 發布與正式 Firebase Rules 發布分別核對。

## 正式環境預檢與備份

管理端 testIamPermissions 已確認 Rules release 更新、ruleset 建立／讀取、API key 讀取／更新等 9 項權限。私有本機備份保存 release 與完整 Rules 原文、key restrictions 與 etag、App Check enforcement、billingEnabled。未保存 keyString、權杖或玩家資料。正式資料庫只讀取指定發布控制文件，回覆 404。兩個正式前端開關均為 false。

| 正式項目 | 查得結果 |
| --- | --- |
| Rules | ruleset `bf22fa00-7304-41f0-9286-7e899b883940`，release 更新時間 2026-11-25 01:57:57 UTC |
| Rules SHA-256（LF） | 現行 `d263e6d77bbc1f4fcb1c86707241f2ee00e166133cb3ed498411034959f8dd00`；候選 `4d5abc9b49d93ce8660d61d1917abad15c72507d4aa7cdbaceee0bf3a301bcda` |
| key 與方案 | 25 個 API targets，原有兩條 Pages referrer；billingEnabled=false。管理者確認僅此遊戲使用 |
| App Check | Firestore ENFORCED；Authentication UNENFORCED |
| 監控 | 2026-10-26 至 11-25 08:47 UTC 的 30 天 services/verification_count，Firestore ALLOW/VALID 680，Authentication ALLOW/VALID 24。這是可見時間序列，未涵蓋所有瀏覽器或未來快取客戶端 |
| Secret Scanning #1 | GitHub 回覆 open；保留至正式限制及相容性核實 |

Authentication 樣本量有限。初始化 App Check 取證失敗時，現行應用仍嘗試匿名登入；若強制執行，這些裝置可能在登入階段受阻。建議保留 Authentication 現況，另以實機新登入、舊登入更新與錯誤率評估獨立切換。維持 Firestore enforcement。

## 長期 Spark 測試環境

新建 `moqi-party-staging`、獨立 Web App、Standard Firestore 預設資料庫（asia-east1）、匿名登入、限測試網域的獨立 reCAPTCHA Enterprise SCORE key 與 App Check。確認 staging 未啟用計費。Identity Platform 初始化端點曾回覆 BILLING_NOT_ENABLED，已停止該付費路徑；後續標準匿名登入設定讀回 enabled，實際登入成功。獨立正式與測試設定經比對，發布包僅含測試專案設定。保留長期測試站與測試資料。[測試網站](https://moqi-party-staging.web.app)

Hosting 版本 `b37de4caf44294a0`，staging Rules release 指向 `e50786d0-8542-4a1a-9d6e-d2f91ea4c075`。測試站已發佈的遊戲檔案使用 main 原始前端，兩個開關皆關閉。V3 測試僅在受控瀏覽器內啟用候選前端路徑；伺服器開關只在 staging 原子建房時暫開，房間成功建立後立即寫回 false 並讀回驗證。

| staging 驗收 | 實際結果 |
| --- | --- |
| 獨立 key 來源／API 清單 | 新 key 初始 27 項，先設為與正式相同的 25 項服務名，再測 8 項及 7 項。每輪讀回 targets，允許的 web.app 在真實 Edge 取證、匿名登入與強制 ID token 更新成功；未允許的 firebaseapp.com 得到 HTTP 403 API_KEY_HTTP_REFERRER_BLOCKED |
| 7 項清單 | identitytoolkit、securetoken、firebaseappcheck、firestore、datastore、firebase、logging（各加 .googleapis.com）。8 項另含 firebaserules。staging 最後為 7 項 |
| 舊版相容 | 桌機 Edge 與獨立行動版面瀏覽器工作階段建立／加入、重新加入、8 題投票、提前揭曉及最終排行榜通過。首輪自動操作在第二題逾時，等待主持人揭曉寫入完成後完整重跑通過 |
| V3 | 使用同一套候選 helpers，原子建房成功；關閉新建後既有房達到 20 人，第 21 人被拒絕。重新加入、8 題投票、揭曉及最終排行榜通過。這次驗收未量測 20 台實機同時作答延遲 |
| 實體手機 | 使用者回報桌機與手機測試流程皆順暢，退出後重加正常。未另回報瀏覽器版本或逐項計分數據 |

## 部署後獨立讀回

已從測試站下載 app.js，並透過 Firebase Rules API 讀取已發布 Rules，兩份來源經 LF 正規化後的 SHA-256 各自與 main 候選一致。staging 管理文件已讀回嚴格布林 false；兩個專案均再次回覆 billingEnabled=false。正式 Firestore 過去滾動 24 小時彙總讀取 569、寫入 197、刪除 0；這是監控觀測值，與免費配額的每日結算時段可能不同。

## 正式放行與還原

實機回報後，重新核對 main 與兩項 CI、現行 Rules 原文與 release、key etag、控制文件不存在、App Check 與停用計費。只將正式 Web key 的 API targets 從 25 項縮為通過 staging 的 7 項，讀回確認，原兩條 referrer 保留。

正式 Pages 的全新自動 Edge 工作階段向 App Check 強制取證時收到 HTTP 403；該次驗證在匿名登入及 Firestore 讀取前停止。隨即比對現行限制，使用當下 etag 還原變更前的完整 restrictions，讀回與備份完全相同。原 25 項設定以全新瀏覽器複測也收到 403，服務回覆 PERMISSION_DENIED，訊息指出 attestation 遭拒。這兩次結果不足以判定移除某項 API 導致故障。無正式房間資料寫入。

正式 Rules 未部署，讀回仍為上表原 release；Firestore ENFORCED、Authentication UNENFORCED、計費停用。V3 新建未開啟，Secret Scanning #1 未解除。下一步先以正式網站的正常實機流量建立可觀測的 25 項基準，確認 App Check 驗證成功；若也失敗，唯讀比對 Web App 註冊、reCAPTCHA 網域與驗證指標。再安排同裝置、同來源、可即時還原的 7 項複測，通過後才發布候選 Rules。

若金鑰限制導致 403 或登入更新失敗，核對最新 etag 後按備份還原原有 targets／方法限制與 referrer，再驗證。Rules 回滾前先核對控制文件與是否已有 V3 房：有 V3 房時維持相容 Rules 和讀取路徑直到結束，禁止直接套回可能暴露 V3 資料的舊 Rules。無 V3 房且確認可安全還原時，使用已保存的 release/source。正式資料無需刪除。
