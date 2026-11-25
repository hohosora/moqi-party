# Secret Scanning #1 · 30 天唯讀查核與變更提案

2026-11-25，查核基準 main `e36cb70`。GitHub #1 為 open，警示值、正式 Web App SDK 設定與儲存庫設定相符。比對全程在記憶體內進行。正式環境只執行管理與監控查詢。建議保留警示，先核准隔離測試。

## 最近 30 天的可見用量

台北時間 2026-10-26 15:01 至 2026-11-25 15:01。Cloud Monitoring 查詢 `consumed_api` 的 `serviceruntime.googleapis.com/api/request_count`，讀完分頁，將原始 DELTA 計數依服務加總。依正式 Web App 的 apiKeyId 取得 API Keys v2 金鑰資源，再比對資源的 credential_id 標籤。查得 28 條時間序列、7 個服務。

| 服務（省略 .googleapis.com） | 專案請求 | 歸屬這把 key |
| --- | ---: | ---: |
| identitytoolkit | 73 | 73 |
| firebaseappcheck | 11 | 11 |
| securetoken | 10 | 10 |
| firestore | 43 | 0 |
| recaptchaenterprise | 33 | 0 |
| serviceusage | 85 | 0 |
| cloudbilling | 15 | 0 |
| 合計 | 270 | 94 |

上述 33 次 reCAPTCHA 請求無憑證標籤。Firestore 有實際流量，該指標未將其歸屬本 key。數字含各種回應狀態；無法從此指標還原玩家人數、來源頁面、Firestore 文件操作數、帳單或個別請求目的。其他服務在這組指標沒有時間序列。這項觀測不足以證明移除限制後的完整功能。

## 25 個 API targets 的處理建議

以下均省略 `.googleapis.com`。API Keys 與 Service Usage 已重新交叉比對。25 項中 14 項已啟用、11 項未啟用。來源限制仍是整個 `https://hohosora.github.io` 及其子路徑。Cloud Billing 唯讀查核回覆 billingEnabled=false。

| 隔離測試建議 | 服務 | 根據 |
| --- | --- | --- |
| 保留（3） | identitytoolkit、securetoken、firebaseappcheck | 金鑰用量與匿名登入、權杖更新及 App Check 取證一致。 |
| 保留（2） | firestore、datastore | app.js 直接載入 Firestore Web SDK，官方清單列出兩者。 |
| 保留（2） | firebase、logging | 官方清單列為跨產品服務，即使該 key 在觀測期間未出現這兩項用量。 |
| 條件保留（1） | firebaserules | 官方註明第三方工具或直接 REST 使用此 key 時才需要。先確認其他使用者；若存在該用途或未能排除，隔離測試先採 8 項。 |
| 候選移除，已啟用（6） | firebasehosting、fcmregistrations、firebaseappdistribution、firebaseinstallations、firebaseremoteconfig、firebaseremoteconfigrealtime | 正式站部署於 GitHub Pages，程式未見 Messaging、App Distribution、Remote Config 或官方表列需 Installations 的產品；另需核對其他消費端。 |
| 候選移除，未啟用（11） | firebasedatabase、sqladmin、firebaseapphosting、firebaseapptesters、firebasedataconnect、firebaseinappmessaging、firebaseml、firebasestorage、firebasevertexai、mlkit、fpnv | 分別涵蓋 Realtime Database、SQL、託管、測試分發、Data Connect、訊息、ML、儲存、AI 與手機號碼驗證；遊戲未見對應功能。日後若啟用服務或計費，現有寬清單會增加暴露範圍。 |

**待驗證最小清單為 7 項**。其中 3 項有這把 key 的直接用量證據，另 4 項依正式程式及官方相依保留。reCAPTCHA Enterprise 雖有專案流量，目前不在這把 key 的清單；現有證據無需將它加入。建議僅調整此 key 的 API targets，保留專案已啟用服務。[Firebase 官方 API 清單](https://firebase.google.com/docs/projects/api-keys) · [Cloud Monitoring 指標說明](https://docs.cloud.google.com/apis/docs/monitoring)

## 剩餘風險與證據界線

同一帳戶另有 1 個可見 Pages 專案，公開首頁未見相同金鑰或 Firebase Auth 網域。該頁引用 1 個外部腳本，未涵蓋其他路由、動態載入及歷史版本。GitHub 程式碼搜尋回覆不完整，因此尚不能排除其他使用者。瀏覽器 referrer 涵蓋同來源所有路徑；它無法單獨驗證遊戲身分。App Check 與 Firestore Rules 仍是資料保護的一部分。免費方案仍有配額耗盡與登入中斷風險。30 天樣本無法涵蓋低頻或季節性用途。

## 核准、驗證與還原

1. 請管理者先確認同來源其他 Pages、第三方工具及 REST 用途。記錄現有金鑰資源版本、兩條 referrer 與完整 25 個 targets（含方法限制，如有），於受控位置保存可還原的 metadata。排除 keyString。若現況與本報告不同，重新比對差異。
2. 經另行核准後，先以隔離的免費測試專案、測試 key 及受控 HTTPS 來源，驗證上列 7 項或條件式 8 項。先測現行清單作對照，再只改測試 key 的 targets。模擬器可驗證 Rules；實際金鑰限制、匿名登入、token 更新與 App Check 取證需用測試雲端驗證。
3. 桌機與手機都驗證匿名登入、強制更新 Auth／App Check token、測試房間建立與加入、投票同步、提前揭曉、計分與重連。驗證未允許的來源遭拒；在成功對照後查 403、API_KEY_SERVICE_BLOCKED、App Check 驗證與服務彙總。任一流程失敗即停止，記錄服務與狀態碼，避免收錄憑證、房號及識別資料。
4. 僅在測試通過並獲正式變更核准後，由管理者在同一把 key 上更新 API targets；保持 referrer、計費、Auth、Rules 與 App Check 現況。觀察既有自然流量和錯誤率，不寫入正式房間。若出現新增 403、token 更新失敗或遊戲異常，先核對最新版本與其他人的變更，再還原先前保存的 targets／方法限制，等待傳播後確認錯誤恢復至基準。
5. 生產驗證、共享來源審核與還原證據齊備後，再由管理者決定警示分類。本次沒有修改 key、套用限制、輪替、關閉警示或重跑正式房間驗收。
