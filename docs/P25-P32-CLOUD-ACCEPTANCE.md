# P2.5／P3-2 雲端驗收紀錄

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
| 實體手機 | 尚待實體手機瀏覽器完成 7 項清單下的隔離驗收。行動版面模擬的結果獨立記錄 |

## 正式放行與還原

目前部署限於 staging。正式金鑰、Rules、App Check、計費及 V3 開關保持預檢狀態。待 staging 實機回報後，再比對最新 main／CI、正式 release／etag、控制文件、App Check 和計費；任一有漂移即暫停重核。先只縮減正式 key 的 API targets，保留 referrer，確認自然流量與錯誤率，再只部署候選 firestore:rules。讀回正式 release 並核對來源雜湊，保持 V3 新建關閉，驗證舊房後再依證據處理警示。

若金鑰限制導致 403 或登入更新失敗，核對最新 etag 後按備份還原原有 targets／方法限制與 referrer，再驗證。Rules 回滾前先核對控制文件與是否已有 V3 房：有 V3 房時維持相容 Rules 和讀取路徑直到結束，禁止直接套回可能暴露 V3 資料的舊 Rules。無 V3 房且確認可安全還原時，使用已保存的 release/source。正式資料無需刪除。
