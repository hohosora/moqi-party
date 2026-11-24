/* 默契失控局 - 可部署 GitHub Pages 的靜態網站；即時多人模式使用 Firebase。 */
(() => {
  'use strict';
  const QUESTIONS = [
    { q:'如果你的人生是一種手機通知，最常跳出哪句？', a:['電量只剩 1%，但我還活著','今日適合耍廢，已自動排程','你的薪水已讀不回','腦袋有更新，請稍後重開機'], talk:'請一位朋友用播報員語氣念出自己的答案。' },
    { q:'如果被困在無人島，只能帶一樣東西，你選？', a:['有訊號但沒電的手機','一台不知道插哪的電鍋','會吐槽你的鸚鵡','一個真的很會鼓勵的朋友'], talk:'為你選的物品辯護 15 秒，越荒謬越好。' },
    { q:'早上鬧鐘響的瞬間，你的靈魂通常說？', a:['我昨天不是才睡嗎？','再五分鐘，我跟你保證','今天起我要早睡（明天開始）','這一定是平行宇宙'], talk:'誰有最離譜的賴床故事？自願分享！' },
    { q:'你的超能力只能有一種「沒有很厲害」的功能？', a:['永遠知道襪子的另一隻在哪','走進便利商店就不排隊','拍合照永遠不閉眼','泡麵永遠剛好三分鐘'], talk:'大家投票誰的能力最值得被拍成電影？' },
    { q:'如果你的社交電量只剩 5%，你會？', a:['躲去廁所當充電站','努力微笑假裝 100%','直接變成抱枕','靠食物續命再聊一輪'], talk:'找一位和你選不同選項的人聊聊。' },
    { q:'如果你是一道夜市小吃，你覺得自己是？', a:['看似平凡但不可或缺的地瓜球','外冷內熱的雞蛋糕','氣場強大的臭豆腐','什麼都想加的豪華滷味'], talk:'有誰的選項讓你覺得「太像本人」？' },
    { q:'當朋友說「我們隨便吃就好」，你的反應？', a:['啟動 30 分鐘餐廳研究','真的隨便，但不能難吃','先看誰最有主見','直接提議吃火鍋結束討論'], talk:'全場最快能決定晚餐的是誰？' },
    { q:'你最希望擁有哪種奇怪的日常特權？', a:['每週一自動跳過','手搖飲喝完自動補滿','迷路時路會自己變直','所有照片都自帶柔焦'], talk:'為什麼這個特權值得寫進憲法？' },
    { q:'小組出遊車上突然安靜，你會？', a:['自動接管車內 DJ','開始發問「大家在想什麼」','默默把零食傳給所有人','立刻睡著，演技非常自然'], talk:'誰最適合當整車氣氛組長？' },
    { q:'要用一種動物形容你週五晚上的狀態？', a:['準備冬眠的熊','精力無限的水獺','只想被餵食的貓','突然想冒險的海豚'], talk:'找到一位和你同動物的人互相擊掌。' },
    { q:'若你的待辦事項會說話，第一句會是？', a:['你還記得我嗎？','我們談談你的拖延症','今天很努力了，先吃點心','沒關係，我還可以再等一年'], talk:'請一個人模仿待辦事項的口吻。' },
    { q:'你最有機會在什麼場合不小心成名？', a:['睡過頭還能準時抵達','吃到一半突然跳舞','講冷笑話冷到上新聞','幫陌生人拍出神級照片'], talk:'全場選出最像真人實境秀主角的人。' },
    { q:'假設朋友幫你取一個超荒謬英雄稱號？', a:['最後一口食物守護者','會記得每個人生日的大師','訊息秒讀但慢回俠','冷氣溫度調解委員'], talk:'兩人一組幫對方取一個英雄外號。' },
    { q:'如果你可以替星期一重新命名？', a:['再睡一下日','人生讀取中','咖啡緊急支援日','我還在週末的星期日'], talk:'有人願意幫星期一說一句公道話嗎？' },
    { q:'大家一起拍照時，你通常扮演什麼角色？', a:['閉眼常駐嘉賓','「再一張」發起人','默默站到最後排','負責提醒大家看鏡頭'], talk:'請全場擺出你最經典的合照姿勢。' },
    { q:'如果你突然中了 1,000 元的小獎，你會？', a:['立刻請朋友喝飲料','先拍照發限動','當作沒發生繼續存錢','買一個沒用但可愛的東西'], talk:'互相推薦一樣 1,000 元內最值得買的快樂。' },
    { q:'你手機裡最有可能爆量的是？', a:['截圖但從來沒再看','食物照片，證據確鑿','聊天貼圖收藏','鬧鐘，每五分鐘一個'], talk:'不用亮出手機，分享一件最奇妙的收藏習慣。' },
    { q:'當有人說「我有一個很短的故事」，你認為？', a:['至少二十分鐘起跳','零食要準備好','一定會有驚人反轉','我先搬一張舒服的椅子'], talk:'誰最擅長把短故事講成連續劇？' },
    { q:'突然全世界的人都得跟你學一項技能？', a:['找到最舒服的躺姿','五秒判斷便當好不好吃','假裝有在聽卻真的記得重點','把尷尬瞬間轉成冷笑話'], talk:'請展示這項技能的 3 秒鐘示範（自願）。' },
    { q:'哪一種「尷尬瞬間」最像你？', a:['揮手才發現對方不是找我','講完笑話只有自己笑','走錯方向又假裝看風景','忘了名字只好叫「欸你」'], talk:'分享一次你成功化解尷尬的妙招。' },
    { q:'如果小組要成立一家奇怪公司，你想當？', a:['下午茶首席品管官','會議縮短研究主管','大家情緒充電師','不合理點子發明部長'], talk:'討論這家公司的第一個產品該是什麼。' },
    { q:'如果你變成一個表情符號，你是？', a:['🙂 我很好只是有點累','😂 把一切當笑話','🫠 快融化了但還能撐','😎 沒在怕的先試再說'], talk:'跟旁邊的人做出自己選的表情。' },
    { q:'當你終於有一整天完全沒行程，你會？', a:['把睡覺當成重要行程','出門探險卻沒決定去哪','看完一整季影集','召集朋友來一場臨時聚餐'], talk:'說說你理想中的「放鬆一天」長什麼樣子。' },
    { q:'如果可以把一個日常動作配上史詩音效？', a:['按下電梯按鈕','成功撕開零食包裝','找到停車位','週五下班打卡'], talk:'全場一起幫最多人選的動作配音。' },
    { q:'你最不想在真人實境秀被拍到哪一幕？', a:['深夜在冰箱前發呆','對著導航吵架','吃太燙還假裝沒事','偷練一個根本不會的舞步'], talk:'你願意拍哪一集「平凡人的英雄日常」？' },
    { q:'如果你能設計一個全員必備的求救按鈕？', a:['幫我決定午餐','這句話要怎麼回','快來陪我尬聊','請把我從棉被挖出來'], talk:'找一個和你按鈕不同的人組成救援搭檔。' },
    { q:'週末聚會有人拿出桌遊，你會是？', a:['沒聽完規則就想開始','認真研究說明書的人','輸了還笑超大聲的人','口頭說隨便但偷偷很想贏'], talk:'誰最可能成為小組的隱藏競賽王？' },
    { q:'如果「拖延」有一個官方吉祥物，應該是？', a:['穿睡衣的樹懶','抱著手機的馬鈴薯','拿著明日行事曆的企鵝','一直說馬上來的烏龜'], talk:'一起幫吉祥物想一個廣告口號。' }
  ];
  const BOT_NAMES = ['泡芙','小宇','阿哲','波比','薯條','小安','布丁','阿光','可可','花花','栗子','小海'];
  const EMOJIS = ['🦊','🐸','🐼','🐱','🐥','🦁','🐨','🐰','🐯','🦄','🐻','🐵','🐧','🦦','🐙','🦖'];
  const $app = document.getElementById('app');
  const state = {
    mode:null, room:null, roomCode:'', player:null, players:[], votes:[], uid:null,
    choice:null, guess:null, double:false, nickname:localStorage.getItem('mqs_name') || '',
    codeInput:new URLSearchParams(location.search).get('room')?.toUpperCase() || '',
    rounds:8, seconds:30, busy:false, error:'', toast:'',
    unsubs:[], voteUnsub:null, watchedRound:null, firebase:null, autoRevealing:false,
    page:new URLSearchParams(location.search).has('room')?'join':'home', voteStep:'choice', bankMode:localStorage.getItem('mqs_bank_mode')||'mixed', managerTab:'custom',
    customEditId:null, customDraft:null, geminiDirection:'trends', geminiCount:8, aiText:'',
    aiPreview:[], aiPreviewSkipped:0, managerNotice:'', managerError:'',
    heroImage:'', photoBusy:false, voteSubmitState:'idle', voteSyncFromCache:false, lastVisibleQuestionKey:null,
    themeChoice:normalizeTheme(localStorage.getItem('mqs_visual_theme_v1')),
    minimalHue:normalizeMinimalHue(localStorage.getItem('mqs_minimal_hue_v1'))
  };
  // 只切換視覺樣式，不改答題流程。舊房間或未知主題沿用既有 party 代碼，外觀顯示為經典像素風。
  const THEME_NAMES={party:'經典像素風',panel:'復古機械風',minimal:'極簡設計風'};
  function normalizeTheme(value){return value==='panel'||value==='minimal'?value:'party';}
  function activeTheme(){return state.room?normalizeTheme(state.room.theme):state.themeChoice;}
  // 色相統一限制在 0–359，不讓未驗證的房間資料進入 CSS。
  function normalizeMinimalHue(raw){
    if(raw===null||raw===undefined||raw==='')return 20;
    const value=Number(raw);
    return Number.isInteger(value)&&value>=0&&value<=359?value:20;
  }
  function activeMinimalHue(){return state.room?normalizeMinimalHue(state.room.minimalHue):state.minimalHue;}
  function minimalColorBar(inRoom=false){
    const hue=inRoom?activeMinimalHue():state.minimalHue;
    return `<div class="minimal-color-setting" role="group" aria-label="極簡風主題色">
      <div class="minimal-color-title"><strong>選擇一種主色</strong><span class="minimal-color-sample" aria-hidden="true"></span></div>
      <label class="minimal-color-label" for="minimalHueRange">拖動色彩條，讓整個介面的底色換成你選的主色</label>
      <input id="minimalHueRange" type="range" name="minimalHue" min="0" max="359" step="1" value="${hue}" aria-label="極簡風主色選擇" aria-describedby="minimalHueHelp">
      <p id="minimalHueHelp" class="minimal-color-help">只選一個顏色，整頁背景、卡片、按鈕與選取狀態就會自動依此色系產生深淺。${inRoom&&state.mode==='online'?' 放開色彩條後才同步給所有玩家。':''}</p>
    </div>`;
  }
  function themePicker(inRoom=false){
    const selected=inRoom?normalizeTheme(state.room?.theme):state.themeChoice;
    const themes=[
      {id:'party',name:'經典像素風',detail:'電玩紫黃・像素街機'},
      {id:'panel',name:'復古機械風',detail:'橘黑電路・控制模組・復古按鍵'},
      {id:'minimal',name:'極簡設計風',detail:'全版主色・柔霧浮雕'}
    ];
    return `<section class="theme-setting space-top" aria-label="選擇遊戲介面風格">
      <div class="theme-setting-heading"><strong>🎨 遊戲介面風格</strong><span class="theme-selected-name">目前：${esc(THEME_NAMES[selected])}</span></div>
      <div class="theme-grid" role="group" aria-label="三種視覺主題">
        ${themes.map(t=>`<button type="button" class="theme-choice ${selected===t.id?'active':''}" data-action="choose-theme" data-theme-id="${t.id}" aria-pressed="${selected===t.id}" aria-label="${t.name}，${t.detail}">
          <span class="theme-swatch theme-swatch-${t.id}" aria-hidden="true"><i></i><b></b><em></em><span></span></span>
          <strong>${t.name}</strong><small>${t.detail}</small>
          <span class="theme-check">${selected===t.id?'✓ 已選擇':'點選套用'}</span>
        </button>`).join('')}
      </div>
      ${selected==='minimal'?minimalColorBar(inRoom):''}
      <p class="theme-help">${inRoom?'可在開始前更換；所有玩家會同步看到新主題。':'建立房間後所有玩家會自動使用相同風格；位置、字級、題庫與玩法都不變。'}</p>
    </section>`;
  }
  async function chooseMinimalHue(raw){
    const hue=normalizeMinimalHue(raw);
    if(state.room){
      if(!isHost()||state.room.phase!=='lobby'||normalizeTheme(state.room.theme)!=='minimal')
        throw new Error('只有主持人能在遊戲開始前選擇極簡風主色。');
      // 只有放開色彩條才寫入 Firestore，避免連續拖曳造成大量寫入。
      if(activeMinimalHue()!==hue)await updateRoom({minimalHue:hue});
      state.room={...state.room,minimalHue:hue};
    }
    state.minimalHue=hue;
    try{localStorage.setItem('mqs_minimal_hue_v1',String(hue));}catch{}
    render();
  }
  async function chooseTheme(raw){
    if(!Object.hasOwn(THEME_NAMES,raw))throw new Error('無法辨識這個介面風格。');
    if(state.room){
      if(!isHost()||state.room.phase!=='lobby')throw new Error('只能由主持人在開始前更換本房間風格。');
      if(normalizeTheme(state.room.theme)!==raw)await updateRoom({theme:raw});
    }
    state.themeChoice=raw;
    try{localStorage.setItem('mqs_visual_theme_v1',raw);}catch{}
    // 本機先更新設定，遠端房間待 Firestore 同步後再套用。
    if(state.room)state.room={...state.room,theme:raw};
    render();
  }
  // 右上角主視覺：照片只在主持人裝置留有原圖的壓縮版本。
  // 線上開房時把小圖快照儲存在該房間文件，玩家加入後才會看到。
  const HERO_KEY='mqs_event_hero_v1';
  const HERO_MAX_CHARS=40000; // 資料 URI 最多約 30KB，避免 Firestore 文件過大
  function safeHero(src){
    return typeof src==='string' && src.length<=HERO_MAX_CHARS
      && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(src);
  }
  function readSavedHero(){
    try{const saved=localStorage.getItem('mqs_event_hero_v1');return safeHero(saved)?saved:'';}catch{return '';}
  }
  function heroVisual(src,klass=''){
    const photo=safeHero(src);
    return `<div class="hero-face shine ${photo?'photo-face':'emoji-face'} ${klass}">${photo?`<img class="hero-photo" src="${esc(src)}" alt="主持人選擇的活動主視覺照片">`:'🤪'}</div>`;
  }
  function heroControls(inRoom=false){
    const current=inRoom?state.room?.heroImage:state.heroImage;
    return `<div class="hero-controls card soft section-gap"><div><b>📸 ${inRoom?'更換本房間主視覺':'主持人自訂主視覺'}</b><p class="fineprint">${inRoom?'更新後會同步到所有已加入房間的玩家。':'選一張照片取代右上角的 🤪 吐舌表情。建立多人房間時會將壓縮後照片同步給玩家。'}</p></div><div class="hero-control-actions"><label class="btn dark small-btn hero-upload-label">${state.photoBusy?'⏳ 正在處理照片…':'📷 選擇照片'}<input type="file" id="heroPhotoUpload" accept="image/jpeg,image/png,image/webp" ${state.photoBusy?'disabled':''}></label><button class="btn tertiary small-btn" data-action="reset-hero" ${state.photoBusy||!safeHero(current)?'disabled':''}>↩ 還原 🤪 表情</button></div><p class="fineprint">支援 JPG、PNG、WebP；上傳時自動置中裁切、縮圖與壓縮。圖片僅作活動主視覺，請先取得照片當事人同意。</p></div>`;
  }
  async function compressHero(file){
    if(!['image/jpeg','image/png','image/webp'].includes(file?.type))throw new Error('請選擇 JPG、PNG 或 WebP 格式的照片。');
    if(file.size>8*1024*1024)throw new Error('原始照片不可超過 8 MB，請先縮小再試。');
    const url=URL.createObjectURL(file);
    let img;
    try{img=await new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('照片無法讀取，請換一張 JPG、PNG 或 WebP。'));image.src=url;
    });}finally{URL.revokeObjectURL(url);}
    if(!img.naturalWidth||!img.naturalHeight)throw new Error('這張照片的尺寸無法辨識。');
    const shortest=Math.min(img.naturalWidth,img.naturalHeight);
    const sx=(img.naturalWidth-shortest)/2,sy=(img.naturalHeight-shortest)/2;
    for(const side of [200,168,144,120]){
      const canvas=document.createElement('canvas');canvas.width=side;canvas.height=side;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('瀏覽器無法處理照片，請換一個瀏覽器。');
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,side,side);
      ctx.drawImage(img,sx,sy,shortest,shortest,0,0,side,side);
      for(const quality of [.80,.67,.53,.42]){
        const data=canvas.toDataURL('image/jpeg',quality);
        if(safeHero(data))return data;
      }
    }
    throw new Error('照片壓縮後仍然過大，請換一張內容較簡單的照片。');
  }
  function saveHeroLocally(data){
    state.heroImage=data;
    try{if(data)localStorage.setItem(HERO_KEY,data);else localStorage.removeItem(HERO_KEY);}
    catch{state.toast='瀏覽器儲存空間不足；照片仍可用於本次開房，但重開網頁可能不會保留。';}
  }
  async function setHero(data){
    if(state.mode && state.room && !isHost())throw new Error('只有房間主持人可以更換主視覺。');
    if(data && !safeHero(data))throw new Error('照片格式不正確，請重新選擇照片。');
    // 先更新房間，只有雲端寫入成功才更新本機偏好。
    if(state.mode && state.room)await updateRoom({heroImage:data});
    saveHeroLocally(data);
    render();
  }
  async function onHeroFile(file){
    if(!file || state.photoBusy)return;
    state.photoBusy=true;render();
    try{const data=await compressHero(file);await setHero(data);state.error='';state.toast='主視覺照片已更新！';}
    catch(err){state.error=friendlyError(err);}
    finally{state.photoBusy=false;render();}
  }
  const CONFIGURED = Boolean(window.GAME_FIREBASE_CONFIG?.apiKey && window.GAME_FIREBASE_CONFIG?.projectId);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  state.heroImage=readSavedHero();
  // 讓玩家看到的錯誤訊息一律為台灣繁體中文；技術細節僅留在開發者主控台。
  function friendlyError(err){
    const code=String(err?.code || '');
    const map={
      'permission-denied':'房間存取權限不足，請確認資料庫安全規則已發布。',
      'unavailable':'目前無法連上遊戲資料庫，請檢查網路後再試一次。',
      'unauthenticated':'登入狀態已失效，請重新開啟網頁。',
      'deadline-exceeded':'連線逾時，請檢查網路後再試一次。',
      'failed-precondition':'資料庫尚未完成設定，請主持人檢查設定說明。',
      'auth/unauthorized-domain':'此網站尚未加入 Firebase 授權網域，請主持人檢查設定。',
      'auth/operation-not-allowed':'尚未開啟匿名登入功能，請主持人檢查 Firebase 設定。',
      'auth/network-request-failed':'無法連上登入服務，請檢查網路後再試一次。',
      'auth/configuration-not-found':'找不到登入設定，請主持人檢查 Firebase 專案。',
      'auth/invalid-api-key':'Firebase 設定資料不正確，請主持人確認設定。'
    };
    if(map[code])return map[code];
    const message=String(err?.message || '');
    if(message && /^[\u3400-\u9FFF]/u.test(message) && !/FirebaseError|Error:|https?:\/\//.test(message))return message;
    console.error('遊戲發生錯誤：',err);
    return '發生連線或操作錯誤，請檢查網路與遊戲設定後再試一次。';
  }
  const title = (t,sub='') => `<h1 class="page-title">${t}</h1>${sub ? `<p class="subhead">${sub}</p>` : ''}`;
  const notify = msg => {state.toast=msg;render();setTimeout(()=>{if(state.toast===msg){state.toast='';render();}},2900);};
  function shuffle(xs){let a=[...xs];for(let i=a.length-1;i>0;i--){let k=Math.floor(Math.random()*(i+1));[a[i],a[k]]=[a[k],a[i]];}return a;}
  function sampleQuestions(n){return shuffle(QUESTIONS.map((_,i)=>i)).slice(0,n);}
  // ------ 三合一題庫：經典 28 題永久保留，新增題庫僅保存在主持人這台裝置 ------
  const BANK_KEY='mqs_personal_bank_v2';
  const BANK_LIMIT=100;
  const DIRECTIONS={
    trends:{name:'🔥 最近流行話題',desc:'台灣熱門話題、網路迷因、娛樂與生活流行'},
    everyday:{name:'🤣 荒謬日常',desc:'上班、通勤、飲食、手機、睡眠與朋友聚會的無厘頭選擇'},
    friends:{name:'💛 朋友默契',desc:'友誼、小組相處、習慣反差與相互理解的輕鬆題目'}
  };
  function loadBank(){
    try{
      const b=JSON.parse(localStorage.getItem(BANK_KEY)||'{}');
      return {custom:Array.isArray(b.custom)?b.custom.slice(0,BANK_LIMIT):[],ai:Array.isArray(b.ai)?b.ai.slice(0,BANK_LIMIT):[]};
    }catch{return {custom:[],ai:[]};}
  }
  let bank=loadBank();
  function saveBank(){
    try{localStorage.setItem(BANK_KEY,JSON.stringify(bank));}
    catch{throw new Error('本機儲存空間不足，請先備份題庫並刪除不需要的題目。');}
  }
  function normalKey(q){return String(q||'').replace(/[\s\p{P}\p{S}]/gu,'').toLowerCase();}
  function questionClean(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('題目必須是包含 q、a、talk 的資料物件。');
    const q=typeof raw.q==='string'?raw.q.trim():'';
    const a=Array.isArray(raw.a)?raw.a.map(x=>typeof x==='string'?x.trim():''):[];
    const talk=typeof raw.talk==='string'?raw.talk.trim():'';
    if(!q||q.length>120)throw new Error('題目文字必須有內容且不超過 120 字。');
    if(a.length!==4||a.some(x=>!x||x.length>100))throw new Error('每一題都要有 4 個不超過 100 字的答案。');
    if(new Set(a.map(normalKey)).size!==4)throw new Error('同一題的 4 個答案不能重複。');
    if(!talk||talk.length>160)throw new Error('請提供不超過 160 字的開獎後聊天引導 talk。');
    return {q,a,talk};
  }
  function allExistingKeys(){return new Set([...QUESTIONS,...bank.custom,...bank.ai].map(x=>normalKey(x.q)));}
  function selectedQuestions(){
    const mode=state.bankMode;
    const pool=mode==='classic'?QUESTIONS:mode==='custom'?bank.custom:mode==='ai'?bank.ai:[...QUESTIONS,...bank.custom,...bank.ai];
    const keys=new Set();
    return pool.filter(item=>{const key=normalKey(item.q);if(!key||keys.has(key))return false;keys.add(key);return true;});
  }
  function buildRoomQuestions(){
    const pool=selectedQuestions();
    if(pool.length<state.rounds){
      throw new Error(`目前「${bankModeName()}」只有 ${pool.length} 題，少於本次設定的 ${state.rounds} 題。請新增題目、減少遊戲題數或改用混合題庫。`);
    }
    if(state.bankMode!=='mixed')return shuffle(pool).slice(0,state.rounds).map(x=>questionClean(x));
    // 混合模式均衡選題，避免大量經典題把少量新題完全蓋掉。
    const groups=shuffle([shuffle(QUESTIONS),shuffle(bank.custom),shuffle(bank.ai)].filter(xs=>xs.length));
    const result=[],seen=new Set();
    while(result.length<state.rounds && groups.some(xs=>xs.length)){
      for(const group of groups){
        while(group.length){
          const candidate=group.shift(),key=normalKey(candidate.q);
          if(seen.has(key))continue;
          seen.add(key);result.push(questionClean(candidate));break;
        }
        if(result.length===state.rounds)break;
      }
    }
    return shuffle(result);
  }
  function bankModeName(){return ({classic:'經典歷史題庫',custom:'主持人自訂題庫',ai:'Gemini 生成題庫',mixed:'三種題庫混合'})[state.bankMode]||'三種題庫混合';}
  function geminiCountOptions(){
    const needed=state.rounds;
    const extra=Math.min(20,needed+4);
    return [
      {count:needed,label:`依遊戲題數：${needed} 題（推薦）`},
      {count:extra,label:`多備 4 題：${extra} 題`},
      {count:20,label:'準備 20 題備用'}
    ].filter((option,index,options)=>options.findIndex(x=>x.count===option.count)===index);
  }
  function geminiPrompt(){
    const n=state.geminiCount,d=DIRECTIONS[state.geminiDirection];
    return `你是台灣派對遊戲「默契失控局」的專業綜藝出題企劃。請為 10–20 位朋友準備 ${n} 題真正好笑、放鬆、能引發聊天的四選一破冰題目。\n\n出題方向：${d.name}，重點包含：${d.desc}。\n${state.geminiDirection==='trends'?'請先利用你可用的搜尋能力查找近期台灣流行話題與迷因，再改寫為不需要事先知道新聞背景也能回答的日常情境；如果無法查到近期資料，請明確避免假稱正在流行，改用一般生活幽默。':''}\n\n規則：\n1. 全部使用台灣繁體中文與自然口語，不要簡體字。\n2. 每題是一個輕鬆、有畫面感、沒有正確答案的假設情境，不考時事知識。\n3. 每題提供恰好四個不重複、都有人可能想選的爆笑答案；不要把某一選項做成唯一正確解答。\n4. 加上「開獎後能自願分享或聊天」的短引導，不強迫表演、不要求暴露隱私。\n5. 避免嘲笑個人外貌、身分、疾病、信仰或災難，避免政治對立與令人尷尬的私密話題。\n6. 題目 q 最多 120 字；每個選項最多 100 字；talk 最多 160 字。\n7. 避免重複創意、避免空泛選項，每題要有不同笑點。\n\n非常重要：只輸出可直接解析的 JSON 陣列，絕對不要加說明文字、不要使用 Markdown 代碼框。格式完全遵循：\n[\n  {"q":"如果你的鬧鐘突然變成人會說什麼？","a":["請你放過我","再睡五分鐘我就辭職","我已經響到懷疑人生","今天起你叫我老闆"],"talk":"聊聊你最爆笑的起床經驗。"}\n]\n\n請直接輸出 ${n} 題，不要輸出範例題的重複版本。`;
  }
  function parseAiQuestions(raw){
    let text=String(raw||'').trim();
    if(text.length>100000)throw new Error('一次匯入的文字太長，請每次最多生成 20 題。');
    if(text.startsWith('```'))text=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'').trim();
    let data;
    try{data=JSON.parse(text);}catch{throw new Error('無法解析 Gemini 回覆，請複製完整 JSON 陣列，包含最前面的 [ 與最後的 ]。');}
    if(data&&typeof data==='object'&&!Array.isArray(data)&&Array.isArray(data.questions))data=data.questions;
    if(!Array.isArray(data)||!data.length)throw new Error('請貼上至少一題的 JSON 陣列。');
    if(data.length>30)throw new Error('每次最多匯入 30 題，請分批處理。');
    const known=allExistingKeys(),valid=[];let skipped=0;
    data.forEach((item,i)=>{
      let q;try{q=questionClean(item);}catch(e){throw new Error(`第 ${i+1} 題：${e.message}`);}
      const key=normalKey(q.q);
      if(known.has(key)){skipped++;return;}
      known.add(key);valid.push(q);
    });
    if(!valid.length)throw new Error('這批題目全部與現有題庫重複，沒有可新增的題目。');
    return {items:valid,skipped};
  }
  function bankRows(items,type){
    if(!items.length)return '<p class="fineprint">目前沒有題目。可以使用下方功能新增或匯入。</p>';
    return `<div class="bank-list">${items.map((item,i)=>`<div class="bank-list-item"><div class="bank-list-info"><span class="bank-counter">第 ${i+1} 題</span><strong>${esc(item.q)}</strong><small>${item.a.map(x=>esc(x)).join(' ／ ')}</small></div><div class="bank-actions">${type==='custom'?`<button class="btn dark small-btn" data-action="edit-custom" data-index="${i}">編輯</button>`:''}${type!=='classic'?`<button class="btn dark small-btn" data-action="remove-bank" data-kind="${type}" data-index="${i}">刪除</button>`:''}</div></div>`).join('')}</div>`;
  }
  function renderManager(){
    const tab=state.managerTab;
    const menu=`<div class="bank-tabs"><button data-action="bank-tab" data-tab="custom" class="bank-tab ${tab==='custom'?'active':''}">✏️ 主持人自訂 <span>${bank.custom.length}</span></button><button data-action="bank-tab" data-tab="ai" class="bank-tab ${tab==='ai'?'active':''}">✨ Gemini 生成 <span>${bank.ai.length}</span></button><button data-action="bank-tab" data-tab="classic" class="bank-tab ${tab==='classic'?'active':''}">📚 經典歷史 <span>28</span></button></div>`;
    let body='';
    if(tab==='custom'){
      const original=bank.custom.find(q=>q.id===state.customEditId);
      const draft=state.customDraft||original||{};
      body=`<div class="card"><h2 class="mini-heading">${original?'修改自訂題目':'自己編一題，讓朋友笑出來'}</h2><div class="field"><span>題目</span><textarea id="customQ" rows="2" maxlength="120" placeholder="如果小組要成立一個超怪部門，你會是什麼主管？">${esc(draft.q||'')}</textarea></div><div class="bank-answer-grid">${[0,1,2,3].map(i=>`<label class="field"><span>答案 ${'ABCD'[i]}</span><input id="customA${i}" maxlength="100" value="${esc(draft.a?.[i]||'')}" placeholder="輸入一個荒謬但好選的答案"></label>`).join('')}</div><label class="field space-top"><span>開獎後聊天引導</span><textarea id="customTalk" rows="2" maxlength="160" placeholder="例如：請大家自願分享，為什麼會選這一項？">${esc(draft.talk||'')}</textarea></label><div class="btn-row space-top"><button class="btn secondary" data-action="save-custom">${original?'💾 儲存修改':'➕ 加入自訂題庫'}</button>${original?'<button class="btn tertiary" data-action="cancel-edit">取消編輯</button>':''}</div></div><section class="card section-gap"><h2 class="mini-heading">我的自訂題目（${bank.custom.length} 題）</h2>${bankRows(bank.custom,'custom')}</section>`;
    }else if(tab==='ai'){
      body=`<div class="card"><h2 class="mini-heading">三步驟，請 Gemini 幫你出題</h2><p class="fineprint">不需 API、不需額外帳號串接。主持人使用自己的 Gemini 網頁，把生成的結果複製回這裡即可。</p><div class="field"><span>① 選擇出題方向</span><div class="direction-options">${Object.entries(DIRECTIONS).map(([k,v])=>`<label class="direction-item ${state.geminiDirection===k?'picked':''}"><input type="radio" name="geminiDirection" value="${k}" ${state.geminiDirection===k?'checked':''}><span><strong>${v.name}</strong><small>${v.desc}</small></span></label>`).join('')}</div></div><label class="field space-top"><span>生成題數（依首頁設定）</span><div class="gemini-count-hint">🎯 首頁設定：<strong>${state.rounds} 題</strong>。已自動對應 Gemini 的生成數量，也可以多備一些題目讓每場隨機抽選。</div><select name="geminiCount">${geminiCountOptions().map(option=>`<option value="${option.count}" ${state.geminiCount===option.count?'selected':''}>${option.label}</option>`).join('')}</select></label><div class="btn-row space-top"><button class="btn secondary" data-action="copy-prompt">📋 ② 複製出題指令</button><a class="btn dark" href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer">↗ 開啟 Gemini 網頁</a></div><p class="fineprint">到 Gemini 貼上指令、送出，再複製生成的整段 JSON。這裡不會自動讀取你的 Gemini 對話。</p><details class="prompt-details"><summary>查看這次要給 Gemini 的指令</summary><pre>${esc(geminiPrompt())}</pre></details><div class="divider"></div><label class="field"><span>③ 把 Gemini 產生的 JSON 貼在下方</span><textarea id="aiJson" name="aiJson" rows="8" placeholder='貼入 Gemini 回傳的 JSON，例如：[{"q":"...","a":["...","...","...","..."],"talk":"..."}]'>${esc(state.aiText)}</textarea></label><button class="btn full space-top" data-action="preview-ai">🔎 檢查題目與預覽</button>${state.aiPreview.length?`<div class="preview-panel"><div class="chip mint">✓ ${state.aiPreview.length} 題通過格式檢查${state.aiPreviewSkipped?'，另跳過 '+state.aiPreviewSkipped+' 題重複內容':''}</div>${state.aiPreview.map((q,i)=>`<div class="preview-item"><b>${i+1}. ${esc(q.q)}</b><small>${q.a.map((x,j)=>'ABCD'[j]+' '+esc(x)).join('　·　')}</small><small>🎤 ${esc(q.talk)}</small></div>`).join('')}<button class="btn secondary full space-top" data-action="confirm-ai">✅ 確認加入 Gemini 題庫</button></div>`:''}</div><section class="card section-gap"><h2 class="mini-heading">已收藏的 Gemini 題目（${bank.ai.length} 題）</h2>${bankRows(bank.ai,'ai')}</section>`;
    }else{
      body=`<div class="card"><h2 class="mini-heading">經典 28 題，永久保留</h2><p class="fineprint">這是原始版本的幽默題庫，不會被 Gemini 匯入或主持人編輯覆蓋。已開局的題目也不會中途變動。</p>${bankRows(QUESTIONS,'classic')}</div>`;
    }
    return surface(`<div class="manager-heading"><button class="btn tertiary small-btn" data-action="manager-back">← 返回建立房間</button><div class="eyebrow">主持人專用工作區（本機題庫）</div><h1 class="page-title">🎲 題庫管理中心</h1><p class="subhead">自訂、Gemini、經典三種題庫自由搭配。<br>新題目保存在<span class="accent-text">這台裝置的瀏覽器</span>，不會直接修改 GitHub 原始檔。</p></div>${state.managerError?`<div class="notice" role="alert">${esc(state.managerError)}</div>`:''}${state.managerNotice?`<div class="chip mint manager-notice">✓ ${esc(state.managerNotice)}</div>`:''}${menu}${body}<div class="card soft section-gap"><h2 class="mini-heading">💾 備份與換裝置</h2><p class="fineprint">自訂／AI 題庫僅儲存在本機瀏覽器。清除瀏覽資料或換手機可能遺失，建議定期下載備份。還原時會自動略過重複題目。</p><div class="btn-row"><button class="btn dark" data-action="export-bank">⬇ 下載題庫備份</button><label class="btn tertiary file-restore">⬆ 匯入備份檔<input type="file" id="restoreBank" accept=".json,application/json" hidden></label></div></div>`);
  }
  function collectCustomForm(){
    return questionClean({q:document.getElementById('customQ')?.value,a:[0,1,2,3].map(i=>document.getElementById(`customA${i}`)?.value),talk:document.getElementById('customTalk')?.value});
  }
  function saveCustom(){
    const q=collectCustomForm();
    const own=bank.custom.find(x=>x.id===state.customEditId);
    const duplicate=[...QUESTIONS,...bank.custom.filter(x=>x.id!==state.customEditId),...bank.ai].some(x=>normalKey(x.q)===normalKey(q.q));
    if(duplicate)throw new Error('這道題目已存在，請調整題目名稱以免重複。');
    if(own)Object.assign(own,q);
    else{
      if(bank.custom.length>=BANK_LIMIT)throw new Error(`自訂題庫最多保留 ${BANK_LIMIT} 題，請先備份並整理舊題。`);
      bank.custom.unshift({...q,id:'c'+Date.now()+Math.random().toString(36).slice(2,7)});
    }
    saveBank();state.customEditId=null;state.customDraft=null;state.managerError='';state.managerNotice=own?'題目已更新。':'新題已加入自訂題庫。';
  }
  function previewAi(){const result=parseAiQuestions(state.aiText);state.aiPreview=result.items;state.aiPreviewSkipped=result.skipped;state.managerError='';state.managerNotice=`格式檢查完成，共 ${result.items.length} 題可以匯入。`;}
  function confirmAi(){
    if(!state.aiPreview.length)throw new Error('請先按「檢查題目與預覽」。');
    if(bank.ai.length+state.aiPreview.length>BANK_LIMIT)throw new Error(`Gemini 題庫最多保留 ${BANK_LIMIT} 題，請先備份並整理舊題。`);
    const found=allExistingKeys(),items=state.aiPreview.filter(q=>!found.has(normalKey(q.q))).map(q=>({...q,id:'g'+Date.now()+Math.random().toString(36).slice(2,8)}));
    if(!items.length)throw new Error('這些題目已經匯入過，沒有新的題目。');
    bank.ai.unshift(...items);saveBank();state.aiPreview=[];state.aiText='';state.managerNotice=`已收藏 ${items.length} 道 Gemini 題目，可回首頁選擇使用。`;state.managerError='';
  }
  async function copyGeminiPrompt(){
    const prompt=geminiPrompt();
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(prompt);state.managerNotice='出題指令已複製！現在開啟 Gemini，貼上並送出。';}
    else{window.prompt('請複製下面的指令，貼到 Gemini：',prompt);state.managerNotice='請將指令貼到 Gemini。';}
  }
  function exportBank(){
    const data=JSON.stringify({version:2,app:'默契失控局',exportedAt:new Date().toISOString(),custom:bank.custom,ai:bank.ai},null,2);
    const u=URL.createObjectURL(new Blob([data],{type:'application/json;charset=utf-8'}));
    const a=document.createElement('a');a.href=u;a.download='默契失控局_我的題庫備份.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500);
    state.managerNotice='備份檔已下載，請自行妥善保存。';
  }
  async function restoreBank(file){
    if(!file||file.size>250000)throw new Error('請選擇不超過 250 KB 的 JSON 題庫備份檔。');
    let data;
    try{data=JSON.parse(await file.text());}catch{throw new Error('無法讀取備份檔，請確認它是 JSON 格式。');}
    if(!data||data.app!=='默契失控局'||!Array.isArray(data.custom)||!Array.isArray(data.ai))throw new Error('這不是《默契失控局》的題庫備份檔。');
    const known=allExistingKeys(),valid={custom:[],ai:[]};
    for(const type of ['custom','ai']){
      if(data[type].length>150)throw new Error('備份題目過多，請整理後再匯入。');
      for(let i=0;i<data[type].length;i++){
        let q;try{q=questionClean(data[type][i]);}catch(e){throw new Error(`備份檔「${type}」第 ${i+1} 題：${e.message}`);}
        const key=normalKey(q.q);if(known.has(key))continue;
        known.add(key);valid[type].push({...q,id:type[0]+Date.now()+Math.random().toString(36).slice(2,9)});
      }
    }
    for(const type of ['custom','ai'])if(bank[type].length+valid[type].length>BANK_LIMIT)throw new Error(`「${type==='custom'?'自訂':'Gemini'}」題庫超過 ${BANK_LIMIT} 題，請先整理舊題再還原。`);
    bank.custom.push(...valid.custom);bank.ai.push(...valid.ai);saveBank();
    state.managerError='';state.managerNotice=`已還原 ${valid.custom.length} 道自訂題、${valid.ai.length} 道 Gemini 題（重複題目已跳過）。`;
  }
  function randomCode(){const s='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:6},()=>s[Math.floor(Math.random()*s.length)]).join('');}
  function emojiFor(uid){let v=0;for(const ch of uid)v+=ch.charCodeAt(0);return EMOJIS[v % EMOJIS.length];}
  function inviteUrl(){let u = new URL(location.href);u.searchParams.set('room',state.roomCode);u.hash='';return u.toString();}
  const me=()=>state.players.find(p=>p.uid===state.uid);
  const isHost=()=>!!state.room && state.room.hostUid===state.uid;
  const question=()=>state.room && state.room.roundIndex>=0 ? (state.room.questions?.[state.room.roundIndex] || QUESTIONS[state.room.questionIds?.[state.room.roundIndex]]):null;
  const myVote=()=>state.votes.find(v=>v.uid===state.uid && v.roundIndex===state.room?.roundIndex);
  function currentVoteCount(){
    if(!state.room)return 0;
    const players=new Set(state.players.map(p=>p.uid));
    return new Set(state.votes.filter(v=>v.roundIndex===state.room.roundIndex && players.has(v.uid)).map(v=>v.uid)).size;
  }
  function scoresSorted(){let scores=state.room?.scores||{};return [...state.players].sort((a,b)=>(scores[b.uid]||0)-(scores[a.uid]||0) || a.joinedAt-b.joinedAt);}
  function myRank(){const sorted=scoresSorted();return sorted.findIndex(p=>p.uid===state.uid)+1;}
  function myScore(){return state.room?.scores?.[state.uid]||0;}
  function hasDouble(){return !state.room?.usedDoubles?.[state.uid];}
  function surface(content, right=''){return `<main class="container"><div class="topbar"><button type="button" class="brand brand-home" data-action="brand-home" aria-label="回首頁：默契失控局" title="回首頁"><span class="brand-mark" aria-hidden="true"><span>✦</span></span><span class="brand-title">默契失控局</span><span class="brand-home-hint">回首頁</span></button>${right || `<span class="status-tag">🎮 手機破冰遊戲</span>`}</div><div class="retro-pcb-backplane" aria-hidden="true"><i class="retro-pcb-channel left"></i><i class="retro-pcb-channel right"></i><i class="retro-pcb-chip upper"></i><i class="retro-pcb-chip lower"></i></div><div class="retro-circuit-deck" aria-hidden="true"><span class="retro-deck-switches"><i></i><i></i><i></i></span><span class="retro-deck-pipes"><i></i><i></i><i></i><i></i></span><span class="retro-deck-chip"><b></b><i></i><i></i><i></i></span><span class="retro-deck-leds"><i></i><i></i><i></i></span></div>${state.room && safeHero(state.room.heroImage)?`<div class="room-look ${state.room.phase==='lobby'?'lobby-look':''}"><img class="room-look-image" src="${esc(state.room.heroImage)}" alt="本場活動主視覺"><span>🎉 本場活動主視覺</span></div>`:''}${state.error?`<div class="notice" role="alert">${esc(state.error)}</div>`:''}${state.toast?`<div class="chip mint" style="margin-bottom:12px">✓ ${esc(state.toast)}</div>`:''}${content}<div class="footer">適合 10–20 人 ✦ 有笑點的社交，不是尷尬的面試<br>先笑出來，再慢慢認識彼此 ✨</div></main>`;}
  // 首頁只做角色分流；進階設定全部放進主持人頁面。
  function renderHome(){
    return surface(`
      <section class="grid-hero simple-home-hero"><div><div class="eyebrow">一起笑，才是真的有默契</div><h1 class="hero-title">默契<span>失控局！</span></h1><p class="subhead">選自己的答案，猜大家會怎麼選。<br><b>用笑點開場，用故事認識彼此。</b></p></div><div class="hero-graphic ${safeHero(state.heroImage)?'has-photo':''}"><div class="splat"></div>${heroVisual(state.heroImage)}${safeHero(state.heroImage)?'<i class="star a">✳</i>':''}<i class="star b">✦</i></div></section>
      <section class="role-choices section-gap" aria-label="選擇你的身分">
        <button class="role-choice" data-action="open-join"><span class="role-icon">🙋</span><span><strong>我要加入遊戲</strong><small>有房號或朋友的邀請連結</small></span><span class="role-arrow" aria-hidden="true">→</span></button>
        <button class="role-choice role-host" data-action="open-host"><span class="role-icon">🎤</span><span><strong>我是主持人</strong><small>選題目、設時間，開一場新的局</small></span><span class="role-arrow" aria-hidden="true">→</span></button>
      </section>
      <p class="landing-note">不用下載 App｜適合 10–20 人一起玩｜繁體中文</p>
      <details class="how-to-play"><summary>第一次玩？30 秒看懂玩法</summary><ol><li>選出你自己的答案。</li><li>猜全場最多人選哪個。</li><li>🃏 每人每場有一次「雙倍王牌」：在「猜大家」時勾選，猜中多數可得 200 分（原本 100 分）；猜錯也會用掉，其他加分不加倍。</li><li>開獎後分享最意外的發現，累積分數拚排行榜。</li></ol></details>
    `);
  }
  function renderJoin(){
    const hasInvite=/^[A-Z2-9]{6}$/.test(state.codeInput);
    return surface(`<div class="entry-heading"><button class="btn tertiary small-btn" data-action="open-home">← 回到首頁</button><div class="eyebrow">玩家入口・簡單兩步</div><h1 class="page-title">🙋 加入朋友的遊戲</h1><p class="subhead">輸入暱稱就能玩；收到邀請連結時，房號會自動填好。</p></div>
      <section class="card entry-card"><label class="field"><span>① 你的遊戲暱稱</span><input name="nickname" maxlength="14" autocomplete="nickname" placeholder="例如：火鍋教主" value="${esc(state.nickname)}"></label><label class="field space-top"><span>② 六碼房間代碼</span><input name="codeInput" maxlength="6" inputmode="text" autocapitalize="characters" spellcheck="false" placeholder="例如：AB3P8K" value="${esc(state.codeInput)}"></label>${hasInvite?'<p class="fineprint mint-text">✓ 已從邀請連結帶入房號</p>':''}<button class="btn full space-top" data-action="join">🎉 加入遊戲</button><p class="fineprint">玩家不需要設定題庫、照片或答題秒數，這些都由主持人準備。</p></section>
    `);
  }
  function renderHost(){
    return surface(`<div class="entry-heading"><button class="btn tertiary small-btn" data-action="open-home">← 回到首頁</button><div class="eyebrow">主持人入口・設定好就能開始</div><h1 class="page-title">🎤 建立一場默契局</h1><p class="subhead">選好題數與時間，分享房號，就能讓大家加入。</p></div>
      <section class="card entry-card"><label class="field"><span>主持人暱稱</span><input name="nickname" maxlength="14" autocomplete="nickname" placeholder="例如：火鍋教主" value="${esc(state.nickname)}"></label>
        <div class="form-grid space-top"><label class="field"><span>遊戲題數</span><select name="rounds"><option value="6" ${state.rounds===6?'selected':''}>6 題｜快速暖場</option><option value="8" ${state.rounds===8?'selected':''}>8 題｜推薦</option><option value="10" ${state.rounds===10?'selected':''}>10 題｜歡樂加倍</option><option value="12" ${state.rounds===12?'selected':''}>12 題｜完整挑戰</option></select></label><label class="field"><span>每題作答時間</span><select name="seconds"><option value="15" ${state.seconds===15?'selected':''}>15 秒｜快速挑戰</option><option value="30" ${state.seconds===30?'selected':''}>30 秒（推薦）</option><option value="45" ${state.seconds===45?'selected':''}>45 秒｜輕鬆作答</option></select></label></div>
        <label class="field space-top"><span>本場題庫</span><select name="bankMode"><option value="mixed" ${state.bankMode==='mixed'?'selected':''}>🎲 三種混合｜笑點不重複</option><option value="classic" ${state.bankMode==='classic'?'selected':''}>📚 經典歷史｜原始 28 題</option><option value="custom" ${state.bankMode==='custom'?'selected':''}>✏️ 主持人自訂｜${bank.custom.length} 題</option><option value="ai" ${state.bankMode==='ai'?'selected':''}>✨ Gemini 生成｜${bank.ai.length} 題</option></select></label>
        <div class="host-bank-help"><span>這套題庫目前可用 ${selectedQuestions().length} 題</span><button class="btn dark small-btn" data-action="manage">⚙️ 管理題庫</button></div>
        ${themePicker()}
        <button class="btn full space-top" data-action="host">🚀 建立多人房間</button><button class="btn tertiary full space-top" data-action="demo">🎭 先玩示範局</button>
        <p class="fineprint">${CONFIGURED?'🟢 已填入 Firebase 連線設定；多人功能仍需 Firestore 權限正常。':'⚠️ 尚未設定 Firebase；目前僅可玩示範局。'}</p>
      </section>
      <details class="host-extra section-gap"><summary>進階設定：更換活動主視覺照片</summary>${heroControls(false)}</details>
      <details class="how-to-play"><summary>查看得分規則</summary><p>猜中全場多數 +100 分，連勝有加分；冷門答案也可能加分。每人有一次猜中分數 ×2 的王牌。最後公布完整排行榜。</p><p>Gemini 的生成題數會跟著首頁選擇的遊戲題數，也能在題庫管理多準備幾題。</p></details>
    `);
  }
  function playerPills(){return state.players.map(p=>`<div class="avatar-pill"><span class="avatar-circle">${esc(p.emoji||emojiFor(p.uid))}</span>${esc(p.name)}${p.uid===state.room?.hostUid?'<span class="host-badge">房主</span>':''}${p.uid===state.uid?'<span class="host-badge">你</span>':''}</div>`).join('');}
  function renderLobby(){
    const n=state.players.length, host=isHost();
    return surface(`${title(state.mode==='demo'?'歡迎來到示範局！':'人都到齊了嗎？',state.mode==='demo'?'12 位虛擬玩家已到場。先試試荒謬投票和排行榜，正式活動再開多人房間。':'分享房間網址，讓大家用手機填入暱稱一起加入。')}<div class="card section-gap">${state.mode==='demo'?`<div class="info-box">🎭 <strong>這是單人示範模式</strong>，不能邀請朋友加入；正式版請先設定 Firebase，再建立可共用的房間。</div>`:`<div class="lobby-code"><div><div class="eyebrow">房間代碼</div><div class="code-digits">${esc(state.roomCode)}</div></div><button class="btn dark small-btn" data-action="copy">🔗 複製邀請</button></div><p class="share-link space-top">${esc(inviteUrl())}</p>`}<div class="split space-top"><h2 class="mini-heading tight">👋 已到場 ${n} 人</h2><span class="chip ${n>=10?'mint':'yellow'}">建議 10–20 人</span></div><div class="avatars space-top">${playerPills()||'<p class="empty">正在等待大家加入…</p>'}</div>${host?`${themePicker(true)}${heroControls(true)}`:`<p class="room-theme-label">🎨 本房間風格：${esc(THEME_NAMES[normalizeTheme(state.room.theme)])}</p>`}<div class="divider"></div><div class="split"><span class="muted">${state.room.totalRounds} 題 × 每題 ${state.room.seconds} 秒</span><span class="chip">${state.mode==='demo'?'🎭 示範模式':'🌐 即時連線'}</span></div><div class="space-top">${host?`<button class="btn full" data-action="start" ${n<2?'disabled':''}>🔥 開始荒謬挑戰（${n} 人）</button><p class="fineprint">主持人也能參賽。開始後不接受新玩家加入；玩家中途離開會保留原有分數。</p>`:`<div class="info-box">⏳ 房主正在準備中！先看看今天會與誰展開默契大戰。</div>`}</div></div><div class="space-top"><button class="btn tertiary full" data-action="leave">← 回首頁</button></div>`, `<span class="status-tag">${esc(state.roomCode)}</span>`);
  }
  function choiceButtons(field,selected,q){return `<div class="option-grid">${q.a.map((a,i)=>`<button type="button" class="option ${selected===i?(field==='choice'?'selected':'guess-selected'):''}" data-${field}="${i}" aria-pressed="${selected===i}"><span class="option-letter">${'ABCD'[i]}</span><span>${esc(a)}</span></button>`).join('')}</div>`;}
  function roundHeader(){return `<div class="round-header"><span class="chip yellow">第 ${state.room.roundIndex+1}／${state.room.totalRounds} 題</span><span class="rank-pill">🏅 第 ${myRank()||'–'} 名 · ${myScore()} 分</span></div><div class="progress" aria-label="題目進度"><div style="width:${Math.round(100*(state.room.roundIndex+1)/state.room.totalRounds)}%"></div></div>`;}
  function renderVote(){
    const q=question(), v=myVote(), n=state.players.length, count=currentVoteCount(), remaining=Math.max(0,Math.ceil(((state.room.deadline||Date.now())-Date.now())/1000));
    const step=state.choice===null?'choice':state.voteStep;
    const locked=Boolean(v)||state.voteSubmitState==='sent'||state.voteSubmitState==='sending';
    const confirmedVote=v||((state.voteSubmitState==='sent'||state.voteSubmitState==='sending')?{choice:state.choice,guess:state.guess}:null);
    const waiting=locked?`<section class="card section-gap submitted"><div class="icon">📨</div><strong>${state.voteSubmitState==='sending'&&!v?'⏳ 正在送出答案，請保持網頁開啟…':'✅ 答案已成功送達，等大家一起開獎！'}</strong><p class="muted">你選：${esc(q.a[confirmedVote.choice])}<br>你猜多數：${esc(q.a[confirmedVote.guess])}</p><span class="chip mint">✓ 答案已鎖定</span></section>`:'';
    let task='';
    if(!locked&&step==='choice'){
      task=`<section class="vote-area one-step vote-step-choice"><div class="answer-stepper" aria-label="第一步：選自己的答案"><span class="current" aria-current="step">① 選自己</span><span>② 猜大家</span></div><h2 class="vote-label">如果是你，你會選哪一個？</h2><p class="vote-tip">點一下答案，就會進入下一步。</p>${choiceButtons('choice',state.choice,q)}</section>`;
    }else if(!locked){
      task=`<section class="vote-area one-step vote-step-guess"><div class="answer-stepper" aria-label="第二步：猜大家的答案"><span class="done">✓ 已選自己</span><span class="current" aria-current="step">② 猜大家</span></div><div class="self-selection"><span><small>你選的是</small><strong>${esc(q.a[state.choice])}</strong></span><button class="btn dark small-btn" data-action="edit-choice">修改</button></div><h2 class="vote-label">你猜大家最多人會選哪個？</h2>${choiceButtons('guess',state.guess,q)}<label class="powerup compact-powerup"><input type="checkbox" id="double" ${state.double?'checked':''} ${!hasDouble()||state.voteSubmitState==='sending'?'disabled':''}><span><b>🃏 ${hasDouble()?'使用雙倍王牌':'雙倍王牌已用完'}</b><small>${hasDouble()?'可選，用掉後本局無法再使用':'繼續作答就好'}</small></span></label></section><div class="submit-feedback ${state.voteSubmitState==='sending'?'is-sending':state.voteSubmitState==='error'?'is-error':'is-ready'}" role="status" aria-live="polite">${state.voteSubmitState==='sending'?'⏳ 正在送出，請保持網頁開啟…':state.voteSubmitState==='error'?'⚠️ 上次未送達，答案已保留，請再按送出。':state.guess===null?'請先選擇預測答案':'✅ 已選好答案，最後要按下「確認送出」才算完成！'}</div>
      <div class="sticky-submit"><button class="btn full" data-action="submit" ${state.guess===null||state.voteSubmitState==='sending'?'disabled':''}>${state.voteSubmitState==='sending'?'⏳ 正在送出…':state.guess===null?'請先選一個預測答案':'✅ 確認送出答案（完成作答）'}</button></div>`;
    }
    return surface(`${roundHeader()}<section class="space-top question-card voting-question"><div class="q-label">😈 靈魂拷問 • 第 ${state.room.roundIndex+1} 題</div><div class="question-text">${esc(q.q)}</div></section>
      <div class="poll-status"><span id="vote-count" aria-live="polite">📬 已答 ${count} / ${n} 人 ${state.mode==='demo'?'（含虛擬玩家）':''}</span><span class="timer ${remaining<=10?'urgent':''}" id="timer" role="timer" aria-label="倒數計時，剩餘 ${remaining} 秒"><span class="timer-caption" aria-hidden="true">倒數計時</span><strong class="timer-digits">⏱ ${remaining} 秒</strong></span></div>
      <div class="vote-sync-indicator" id="vote-sync-indicator" role="status">${state.mode==='demo'?'🎭 示範模式':state.voteSyncFromCache?'📡 網路同步中，主持人數字可能稍有延遲':'☁️ 已連線，票數將自動更新'}</div>
      ${locked?waiting:task}
      ${isHost()?`<details class="host-vote-tools"><summary>🎤 主持人控制（<span id="host-vote-count">已作答 ${count}/${n}</span>）</summary><p class="fineprint">所有人完成或時間結束即可開獎；主持人網頁保持開啟，倒數結束會自動揭曉。</p><button class="btn secondary full" data-action="reveal" ${count===0?'disabled':''}>🎊 現在開獎</button></details>`:v?'<p class="look-up-note">👀 抬頭看看大家，猜猜誰跟你選得一樣！</p>':''}
    `, `<span class="status-tag">${esc(state.roomCode)}</span>`);
  }
  function renderPoll(){
    const q=question(),counts=state.room.lastResult?.counts || [0,0,0,0], tops=state.room.lastResult?.top||[],total=counts.reduce((a,b)=>a+b,0);
    return `<div class="card section-gap"><h2 class="mini-heading">📊 全場民調：答案揭曉</h2>${q.a.map((a,i)=>`<div class="result-bar"><div class="bar-letter">${'ABCD'[i]}</div><div class="bar-track ${tops.includes(i)?'winner':''}"><div class="bar-fill" style="width:${total?counts[i]/total*100:0}%"></div><div class="bar-text">${esc(a)} ${tops.includes(i)?'👑':''}</div></div><div class="bar-votes">${counts[i]} 票</div></div>`).join('')}<p class="fineprint">共 ${total} 人作答；票數最多的答案都算猜中。</p></div>`;
  }
  function renderLeaderboard(compact=false){
    const sorted=scoresSorted(), map=state.room?.scores||{};
    const top=sorted.slice(0,3), pad=3-top.length;
    const podium=p=>p?`<div class="podium ${sorted[0]?.uid===p.uid?'first':''}"><div class="medal">${sorted.indexOf(p)===0?'🥇':sorted.indexOf(p)===1?'🥈':'🥉'}</div><div class="person">${esc(p.emoji||emojiFor(p.uid))}</div><div class="name">${esc(p.name)}${p.uid===state.uid?' (你)':''}</div><div class="points">${map[p.uid]||0}</div><div class="fineprint">分</div></div>`:'<div></div>';
    const slots=[top[1]||null,top[0]||null,top[2]||null];
    return `<section class="card section-gap"><div class="split"><h2 class="mini-heading tight">🏆 ${compact?'即時排行榜':'最終排行榜'}</h2><span class="chip yellow">${sorted.length} 位玩家</span></div><div class="leader-top">${slots.map(podium).join('')}</div><div class="rank-list">${sorted.map((p,i)=>`<div class="rank-item ${p.uid===state.uid?'me':''}"><span class="rank-index">${i+1}</span><span>${esc(p.emoji||emojiFor(p.uid))}</span><span class="rank-name">${esc(p.name)} ${p.uid===state.uid?'👈':''}</span><span class="rank-points">${map[p.uid]||0} 分</span></div>`).join('')}</div></section>`;
  }
  // 平時只顯示前三名及自己的名次，完整名單在最後一頁（或玩家主動展開）查看。
  function renderQuickRanking(){
    const sorted=scoresSorted(), scores=state.room?.scores||{};
    const top=sorted.slice(0,3);
    const rows=top.map((p,i)=>`<div class="quick-rank-line"><span>${['🥇','🥈','🥉'][i]} ${esc(p.emoji||emojiFor(p.uid))} ${esc(p.name)}</span><b>${scores[p.uid]||0} 分</b></div>`).join('');
    return `<section class="card quick-ranking section-gap"><div class="split"><h2 class="mini-heading tight">🏆 目前領先</h2><span class="chip yellow">你第 ${myRank()||'–'} 名</span></div>${rows}<details class="full-rank-toggle"><summary>想看完整排行榜？點這裡展開</summary>${renderLeaderboard(true)}</details></section>`;
  }
  function renderReveal(){
    const q=question(),last=state.room.lastResult||{},g=last.gains?.[state.uid],v=myVote();
    const scoreText=g?`${g.total}`:'0';
    return surface(`${roundHeader()}<section class="space-top question-card"><div class="q-label">🎉 答案開獎啦！</div><div class="question-text">${esc(q.q)}</div></section>${renderPoll()}
      <section class="talk-first section-gap"><span class="talk-eyebrow">🎤 最重要的 30–60 秒</span><h2>先抬頭聊聊吧！</h2><p>${esc(q.talk)}</p><small>主持人可以邀請 1–2 位自願分享，沒有標準答案，也不用強迫任何人表演。</small></section>
      <div class="score-highlight section-gap slim-score"><span class="eyebrow">本題得分</span><div class="split"><div><div class="score-big">+${scoreText}</div><div class="score-detail">${v?`猜多數 ${g?.guess||0} 分${g?.doubleUsed?'（王牌生效）':''} · 冷門 ${g?.rare||0} 分 · 連勝 ${g?.streakBonus||0} 分`:'本題未作答'}</div></div><span class="score-emote">${g?.total>=100?'😎':'🤪'}</span></div></div>
      ${renderQuickRanking()}
      <div class="section-gap">${isHost()?`<button class="btn full" data-action="next">${state.room.roundIndex+1>=state.room.totalRounds?'🏆 公布最終排行榜':'➡️ 聊完了，進下一題'}</button><p class="fineprint">請先留一點時間讓大家互相分享，再繼續下一題。</p>`:`<div class="info-box">👂 等主持人帶大家聊完，就會一起進下一題。</div>`}</div>
    `, `<span class="status-tag">${esc(state.roomCode)}</span>`);
  }
  function renderFinished(){
    const sorted=scoresSorted(), winner=sorted[0],myPosition=myRank();
    return surface(`<div class="eyebrow">遊戲結束・全場封神</div><section class="question-card section-gap" style="text-align:center"><div style="font-size:73px">🏆</div><h1 class="page-title" style="margin-top:0;color:#27213a">恭喜默契之王！</h1><div style="font-weight:900;font-size:28px;color:#292039">${esc(winner?.emoji||'🎉')} ${esc(winner?.name||'所有參加者')}</div><p style="font-weight:800;color:#2c253d">以 ${state.room.scores?.[winner?.uid]||0} 分勇奪第一！</p></section>
      <div class="card section-gap"><h2 class="mini-heading">🙌 你的最後成績</h2><div class="split"><div><div class="score-big">#${myPosition||'–'}</div><div class="fineprint">個人名次／${state.players.length} 人</div></div><div style="text-align:right"><div class="score-big">${myScore()}</div><div class="fineprint">總分</div></div></div></div>${renderLeaderboard(false)}
      <section class="info-box section-gap"><strong>🗣 遊戲結束，再留 3 分鐘：</strong><div>找一位你今天最意外「原來你也這樣！」的朋友，分享一件剛才還沒說完的趣事。<br>或是全場選出「最荒謬但最有道理的答案」。</div></section>
      <div class="btn-row section-gap">${state.mode==='online'?`<button class="btn secondary" data-action="copy">🔗 複製活動網址</button>`:''}<button class="btn" data-action="leave">🔁 再開一局</button></div>
    `, `<span class="status-tag">${state.room.totalRounds} 題挑戰完成</span>`);
  }
  function render(){
    // 房間主題由主持人建立時寫入 Firestore，玩家不需自行設定。
    document.documentElement.setAttribute('data-theme',activeTheme());
    document.documentElement.setAttribute('data-game-screen',state.room?.phase||state.page||'home');
    document.documentElement.style.setProperty('--m-hue',String(activeMinimalHue()));
    const metaThemeColor=document.querySelector('meta[name="theme-color"]');
    if(metaThemeColor)metaThemeColor.setAttribute('content',activeTheme()==='panel'?'#f76a12':'#121028');
    if(!state.mode || !state.room) {$app.innerHTML=state.page==='manager'?renderManager():state.page==='host'?renderHost():state.page==='join'?renderJoin():renderHome();return;}
    // 每次新題啟動時，先顯示題目，不沿用上一題或等候室留在頁面底部的位置。
    // 以「房間＋題號」辨識，只捲動一次；同一題收到其他玩家的票數時不干擾目前閱讀位置。
    const questionKey=state.room.phase==='voting'? `${state.mode}:${state.roomCode}:${state.room.roundIndex}` :null;
    const showQuestionTop=questionKey!==null && questionKey!==state.lastVisibleQuestionKey;
    if(showQuestionTop)state.lastVisibleQuestionKey=questionKey;
    if(state.room.phase==='lobby') $app.innerHTML=renderLobby();
    else if(state.room.phase==='voting') $app.innerHTML=renderVote();
    else if(state.room.phase==='reveal') $app.innerHTML=renderReveal();
    else if(state.room.phase==='finished') $app.innerHTML=renderFinished();
    else $app.innerHTML=surface('<div class="loading-page">正在同步遊戲房間…</div>');
    if(showQuestionTop){
      const resetToQuestion=()=>{
        if(state.room?.phase==='voting' && state.lastVisibleQuestionKey===questionKey){
          window.scrollTo(0,0);
        }
      };
      if(typeof window.requestAnimationFrame==='function')window.requestAnimationFrame(resetToQuestion);
      else resetToQuestion();
    }
  }
  // ------ 公平計分：主持人根據各回合票數統一結算 ------
  function evaluateRound(room, players, votes){
    const vots=votes.filter(v=>Number.isInteger(v.choice)&&v.choice>=0&&v.choice<4&&Number.isInteger(v.guess)&&v.guess>=0&&v.guess<4 && players.some(p=>p.uid===v.uid));
    const counts=[0,0,0,0]; for(const v of vots)counts[v.choice]++;
    const max=Math.max(...counts);const top=max>0?counts.map((x,i)=>x===max?i:null).filter(x=>x!==null):[];
    const scores={...room.scores},streaks={...room.streaks},usedDoubles={...room.usedDoubles},gains={};
    for(const v of vots){
      const correct=top.includes(v.guess), dbl=!!v.double&&!usedDoubles[v.uid];
      const lastStreak=streaks[v.uid]||0;
      const streak=correct?lastStreak+1:0;
      const bonus=correct?Math.min(streak-1,3)*20:0;
      const pred=correct?(dbl?200:100):0;
      const rare=counts[v.choice]===1?40:counts[v.choice]<max?20:0;
      if(dbl)usedDoubles[v.uid]=true;
      const total=pred+bonus+rare;
      scores[v.uid]=(scores[v.uid]||0)+total;streaks[v.uid]=streak;
      gains[v.uid]={total,guess:pred,rare,streakBonus:bonus,doubleUsed:dbl,correct};
    }
    return {scores,streaks,usedDoubles,lastResult:{counts,top,totalVotes:vots.length,gains},phase:'reveal'};
  }
  function simulateBots(roundIndex){
    const favored=(roundIndex+Math.floor(Math.random()*3))%4;
    const weights=[1,1,1,1];weights[favored]=4;
    const pick=()=>{let r=Math.random()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<4;i++){r-=weights[i];if(r<0)return i;}return 0;};
    state.votes=state.players.filter(p=>p.uid!==state.uid).map(p=>({uid:p.uid,roundIndex,choice:pick(),guess:Math.random()<.55?favored:Math.floor(Math.random()*4),double:roundIndex===4 && Math.random()<.4,at:Date.now()}));
  }
  function beginDemo(){
    const name=validateName();if(!name)return;
    const preparedQuestions=buildRoomQuestions();
    clearListeners();state.mode='demo';state.uid='demo-me';state.roomCode='DEMO88';
    state.players=[{uid:state.uid,name,emoji:'😎',joinedAt:0},...BOT_NAMES.map((name,i)=>({uid:'bot'+i,name,emoji:EMOJIS[i],joinedAt:i+1}))];
    state.room={hostUid:state.uid,phase:'lobby',roundIndex:-1,totalRounds:state.rounds,seconds:state.seconds,questions:preparedQuestions,scores:{},streaks:{},usedDoubles:{},lastResult:null,deadline:null,heroImage:state.heroImage,theme:state.themeChoice,minimalHue:state.minimalHue};
    state.votes=[];state.choice=null;state.guess=null;state.double=false;state.voteStep='choice';state.voteSubmitState='idle';history.replaceState(null,'',location.pathname);render();
  }
  function validateName(){const s=state.nickname.trim().slice(0,14);if(!s){state.error='先填入暱稱，這樣排行榜才知道誰是誰。';render();return null;}state.nickname=s;localStorage.setItem('mqs_name',s);state.error='';return s;}
  function clearListeners(){for(const f of state.unsubs){try{f();}catch{}}state.unsubs=[];if(state.voteUnsub){state.voteUnsub();state.voteUnsub=null;}state.watchedRound=null;}
  function goHomeFromBrand(){
    // 標誌只負責導覽，絕不直接刪除 Firebase 房間、重置其他玩家或清空既有分數。
    if(state.room && state.mode){
      if(state.room.phase!=='finished'){
        const warning=state.mode==='demo'
          ?'確定要回首頁嗎？這場示範局的進度將不會保留。'
          :isHost()
            ?'你是這場的主持人。離開後其他玩家仍會留在房間，但可能無人能繼續開獎或進入下一題。\n若需返回，請保留房號並使用原本瀏覽器重新加入。\n確定要回首頁嗎？'
            :'確定要離開本場遊戲嗎？目前分數仍保留在房間，請保留邀請連結，才能使用原本瀏覽器重新加入。';
        if(!window.confirm(warning))return;
      }
      leave();
    }else{
      if(state.page==='manager' && state.customDraft?.q?.trim() && !window.confirm('目前編輯中的題目尚未儲存，確定回首頁嗎？'))return;
      state.page='home';state.error='';state.customDraft=null;state.customEditId=null;render();
    }
    window.scrollTo(0,0);
  }
  function leave(){clearListeners();state.page='home';state.room=null;state.mode=null;state.roomCode='';state.votes=[];state.players=[];state.choice=null;state.guess=null;state.double=false;state.voteStep='choice';state.voteSubmitState='idle';state.voteSyncFromCache=false;state.lastVisibleQuestionKey=null;state.error='';history.replaceState(null,'',location.pathname);render();}
  // ------ Firebase Web SDK：延後載入，離線示範模式不必連任何服務 ------
  async function getFirebase(){
    if(state.firebase)return state.firebase;
    if(!CONFIGURED)throw new Error('尚未設定 Firebase。可先按「先玩示範局」，或依操作說明完成 Firebase 設定再使用多人連線。');
    const base='https://www.gstatic.com/firebasejs/11.10.0/';
    const [appLib,authLib,dbLib]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
    const app=appLib.getApps().length?appLib.getApp():appLib.initializeApp(window.GAME_FIREBASE_CONFIG);
    const auth=authLib.getAuth(app);
    await new Promise((res,rej)=>{const un=authLib.onAuthStateChanged(auth,()=>{un();res();},rej);});
    if(!auth.currentUser)await authLib.signInAnonymously(auth);
    const db=dbLib.getFirestore(app);
    state.firebase={auth,db,dbLib};state.uid=auth.currentUser.uid;
    return state.firebase;
  }
  const roomRef=code=>state.firebase.dbLib.doc(state.firebase.db,'rooms',code);
  const playerRef=(code,uid)=>state.firebase.dbLib.doc(state.firebase.db,'rooms',code,'players',uid);
  const votesCollection=code=>state.firebase.dbLib.collection(state.firebase.db,'rooms',code,'votes');
  async function createOnline(){
    const name=validateName();if(!name)return;
    const preparedQuestions=buildRoomQuestions();
    const f=await getFirebase(),L=f.dbLib;
    let code='';
    for(let i=0;i<6;i++){const candidate=randomCode();const snap=await L.getDoc(roomRef(candidate));if(!snap.exists()){code=candidate;break;}}
    if(!code)throw new Error('房間代碼產生失敗，請再試一次。');
    const data={hostUid:state.uid,phase:'lobby',roundIndex:-1,totalRounds:state.rounds,seconds:state.seconds,questions:preparedQuestions,scores:{},streaks:{},usedDoubles:{},lastResult:null,deadline:null,createdAt:Date.now(),heroImage:state.heroImage,theme:state.themeChoice,minimalHue:state.minimalHue};
    await L.setDoc(roomRef(code),data);
    await L.setDoc(playerRef(code,state.uid),{uid:state.uid,name,emoji:emojiFor(state.uid),joinedAt:Date.now()});
    state.mode='online';state.roomCode=code;state.room=data;state.player=state.uid;history.replaceState(null,'',`?room=${code}`);
    subscribeOnline(code);
  }
  async function joinOnline(){
    const name=validateName();if(!name)return;
    const code=state.codeInput.trim().toUpperCase();
    if(!/^[A-Z2-9]{6}$/.test(code))throw new Error('請輸入正確的 6 碼房間代碼。');
    const f=await getFirebase(),L=f.dbLib;
    const snap=await L.getDoc(roomRef(code));
    if(!snap.exists())throw new Error('找不到這個房間，請再確認代碼。');
    const current=await L.getDocs(L.collection(f.db,'rooms',code,'players'));
    const selfExists=current.docs.some(d=>d.id===state.uid);
    if(snap.data().phase!=='lobby'&&!selfExists)throw new Error('這場已經開始，請向主持人索取新房間代碼。');
    if(current.size>=20&&!selfExists)throw new Error('這個房間已滿 20 人，請主持人另開一局。');
    if(!selfExists){await L.setDoc(playerRef(code,state.uid),{uid:state.uid,name,emoji:emojiFor(state.uid),joinedAt:Date.now()});}
    state.mode='online';state.roomCode=code;state.room=snap.data();state.player=state.uid;history.replaceState(null,'',`?room=${code}`);
    subscribeOnline(code);
  }
  function subscribeOnline(code){
    clearListeners();const L=state.firebase.dbLib,db=state.firebase.db;
    const offRoom=L.onSnapshot(roomRef(code),snap=>{
      if(!snap.exists()){state.error='房間已不存在。';leave();return;}
      const prevRound=state.room?.roundIndex, prevPhase=state.room?.phase;
      state.room=snap.data();
      if(state.room.roundIndex!==prevRound){state.choice=null;state.guess=null;state.double=false;state.voteStep='choice';state.votes=[];state.voteSubmitState='idle';state.voteSyncFromCache=false;}
      if(state.room.roundIndex>=0 && state.watchedRound!==state.room.roundIndex){subscribeVotes(code,state.room.roundIndex);}
      if(state.room.phase==='voting' && prevPhase==='voting' && prevRound===state.room.roundIndex && document.getElementById('vote-count'))updateVoteStatusUI();
      else render();
    },err=>{state.error='同步房間失敗：'+friendlyError(err);render();});
    const offPlayers=L.onSnapshot(L.collection(db,'rooms',code,'players'),snap=>{
      state.players=snap.docs.map(d=>d.data()).sort((a,b)=>a.joinedAt-b.joinedAt);
      if(state.room?.phase==='voting' && document.getElementById('vote-count'))updateVoteStatusUI();
      else render();
    },err=>{state.error='載入玩家名單失敗：'+friendlyError(err);render();});
    state.unsubs.push(offRoom,offPlayers);
  }
  function subscribeVotes(code,ri){
    if(state.voteUnsub)state.voteUnsub();state.watchedRound=ri;
    const L=state.firebase.dbLib;
    state.voteUnsub=L.onSnapshot(L.query(votesCollection(code),L.where('roundIndex','==',ri)),{includeMetadataChanges:true},snap=>{
      if(state.room?.roundIndex!==ri)return;
      const wasSubmitted=Boolean(myVote());
      state.votes=snap.docs.filter(d=>!d.metadata?.hasPendingWrites).map(d=>d.data());
      state.voteSyncFromCache=Boolean(snap.metadata?.fromCache);
      if(Boolean(myVote())!==wasSubmitted || !document.getElementById('vote-count'))render();
      else updateVoteStatusUI();
    },err=>{state.error='讀取票數失敗：'+friendlyError(err);render();});
  }
  // 票數變化僅更新畫面上的計數，避免答題介面被多次整頁重畫。
  function updateVoteStatusUI(){
    const el=document.getElementById('vote-count');
    if(!el)return;
    const count=currentVoteCount(), total=state.players.length;
    el.textContent=`📬 已答 ${count} / ${total} 人 ${state.mode==='demo'?'（含虛擬玩家）':''}`;
    const host=document.getElementById('host-vote-count');
    if(host)host.textContent=`已作答 ${count}/${total}`;
    const reveal=document.querySelector('[data-action="reveal"]');
    if(reveal)reveal.disabled=count===0;
    const sync=document.getElementById('vote-sync-indicator');
    if(sync)sync.textContent=state.mode==='demo'?'🎭 示範模式':state.voteSyncFromCache?'📡 網路同步中，主持人數字可能稍有延遲':'☁️ 已連線，票數將自動更新';
  }
  async function beginRound(){
    if(!isHost())return;
    if(state.room.phase==='lobby'){
      if(state.players.length<2)throw new Error('最少需要 2 人才可開始（正式活動建議 10–20 人）。');
      const scores=Object.fromEntries(state.players.map(p=>[p.uid,0]));
      await updateRoom({phase:'voting',roundIndex:0,deadline:Date.now()+state.room.seconds*1000,scores,streaks:{},usedDoubles:{},lastResult:null});
    }else if(state.room.phase==='reveal'){
      if(state.room.roundIndex+1>=state.room.totalRounds)await updateRoom({phase:'finished',deadline:null});
      else await updateRoom({phase:'voting',roundIndex:state.room.roundIndex+1,deadline:Date.now()+state.room.seconds*1000,lastResult:null});
    }
  }
  async function updateRoom(patch){
    if(state.mode==='demo'){
      const previous=state.room.roundIndex;
      state.room={...state.room,...patch};
      if(state.room.roundIndex!==previous){state.choice=null;state.guess=null;state.double=false;state.voteStep='choice';state.voteSubmitState='idle';state.voteSyncFromCache=false;simulateBots(state.room.roundIndex);}
      state.error='';render();return;
    }
    const L=state.firebase.dbLib;
    await L.updateDoc(roomRef(state.roomCode),patch);
  }
  async function submitVote(){
    if(state.room.phase!=='voting'||myVote()||state.voteSubmitState==='sent')return;
    if(state.choice===null||state.guess===null)throw new Error('請完成自己的答案，以及猜全場最多人選的答案。');
    if(state.mode==='online'&&Date.now()>state.room.deadline+3000)throw new Error('作答時間已到，等主持人公布答案吧！');
    const payload={uid:state.uid,roundIndex:state.room.roundIndex,choice:state.choice,guess:state.guess,double:state.double&&hasDouble(),at:Date.now()};
    if(state.mode==='demo'){state.votes.push(payload);state.voteSubmitState='sent';state.error='';render();}
    else{
      const L=state.firebase.dbLib;
      state.voteSubmitState='sending';
      render();
      try{
        await L.setDoc(L.doc(state.firebase.db,'rooms',state.roomCode,'votes',`${state.uid}_${state.room.roundIndex}`),payload);
        state.voteSubmitState='sent';
      }catch(err){
        state.voteSubmitState='error';
        throw err;
      }
    }
  }
  async function revealRound(){
    if(!isHost()||state.room.phase!=='voting')return;
    state.autoRevealing=true;
    try{
      let votes=state.votes;
      if(state.mode==='online'){
        const L=state.firebase.dbLib;
        const snap=await L.getDocsFromServer(L.query(votesCollection(state.roomCode),L.where('roundIndex','==',state.room.roundIndex)));
        votes=snap.docs.map(d=>d.data());
      }
      const changes=evaluateRound(state.room,state.players,votes);
      await updateRoom(changes);
    }finally{state.autoRevealing=false;}
  }
  function currentTimeTick(){
    if(state.room?.phase!=='voting')return;
    const remaining=Math.max(0,Math.ceil(((state.room.deadline||Date.now())-Date.now())/1000));
    const t=document.getElementById('timer');if(t){const digits=t.querySelector('.timer-digits');if(digits)digits.textContent=`⏱ ${remaining} 秒`;else t.textContent=`⏱ ${remaining} 秒`;t.classList.toggle('urgent',remaining<=10);t.setAttribute('aria-label',`倒數計時，剩餘 ${remaining} 秒`);}
    if(remaining===0 && Date.now()>=Number(state.room.deadline||0)+3500 && isHost() && !state.busy && !state.autoRevealing){
      state.autoRevealing=true;
      revealRound().catch(err=>{state.error='自動結算失敗：'+friendlyError(err);render();}).finally(()=>{state.autoRevealing=false;});
    }
  }
  async function copyInvite(){
    const link=inviteUrl();
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(link);notify('邀請網址已複製，傳到群組就能加入！');}
    else {window.prompt('複製以下邀請網址：',link);}
  }
  // ------ UI 事件代理 ------
  document.addEventListener('input',e=>{
    if(e.target.name==='minimalHue'){
      const hue=normalizeMinimalHue(e.target.value);
      // 預覽只改 CSS，不重新繪製畫面或呼叫 Firebase。
      document.documentElement.style.setProperty('--m-hue',String(hue));
      return;
    }
    if(e.target.name==='nickname'){state.nickname=e.target.value;localStorage.setItem('mqs_name',state.nickname);}
    if(e.target.name==='codeInput'){state.codeInput=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);e.target.value=state.codeInput;}
    if(e.target.name==='aiJson'){state.aiText=e.target.value;state.aiPreview=[];}
    if(['customQ','customTalk','customA0','customA1','customA2','customA3'].includes(e.target.id)){state.customDraft={q:document.getElementById('customQ')?.value||'',a:[0,1,2,3].map(i=>document.getElementById(`customA${i}`)?.value||''),talk:document.getElementById('customTalk')?.value||''};}
  });
  document.addEventListener('change',e=>{
    if(e.target.name==='minimalHue'){
      if(state.busy)return;
      state.busy=true;
      chooseMinimalHue(e.target.value).then(()=>{state.error='';}).catch(err=>{state.error=friendlyError(err);})
        .finally(()=>{state.busy=false;render();});
      return;
    }
    if(e.target.name==='rounds'){state.rounds=Number(e.target.value);state.geminiCount=state.rounds;state.aiPreview=[];render();}
    if(e.target.name==='seconds')state.seconds=Number(e.target.value);
    if(e.target.id==='double')state.double=e.target.checked;
    if(e.target.name==='bankMode'){state.bankMode=e.target.value;localStorage.setItem('mqs_bank_mode',state.bankMode);render();}
    if(e.target.name==='geminiDirection'){state.geminiDirection=e.target.value;state.aiPreview=[];render();}
    if(e.target.name==='geminiCount'){state.geminiCount=Number(e.target.value);render();}
    if(e.target.id==='restoreBank'&&e.target.files?.length){restoreBank(e.target.files[0]).catch(err=>{state.managerError=err.message;}).finally(()=>render());}
    if(e.target.id==='heroPhotoUpload'&&e.target.files?.length)onHeroFile(e.target.files[0]);
  });
  document.addEventListener('click',async e=>{
    const c=e.target.closest('[data-choice]'),g=e.target.closest('[data-guess]');
    if(c && !state.busy && state.voteSubmitState!=='sending' && !myVote()){state.choice=Number(c.dataset.choice);state.voteStep='guess';render();window.scrollTo(0,0);return;}
    if(g && !state.busy && state.voteSubmitState!=='sending' && !myVote()){state.guess=Number(g.dataset.guess);render();return;}
    const b=e.target.closest('[data-action]');if(!b||state.busy)return;
    const action=b.dataset.action;
    if(action==='brand-home'){goHomeFromBrand();return;}
    if(action==='choose-theme'){
      if(!Object.hasOwn(THEME_NAMES,b.dataset.themeId))return;
      state.busy=true;
      try{await chooseTheme(b.dataset.themeId);state.error='';}
      catch(err){state.error=friendlyError(err);}
      finally{state.busy=false;render();}
      return;
    }
    if(action==='leave'){leave();return;}
    if(action==='open-home'){state.page='home';state.error='';render();window.scrollTo(0,0);return;}
    if(action==='open-host'){state.page='host';state.error='';render();window.scrollTo(0,0);return;}
    if(action==='open-join'){state.page='join';state.error='';render();window.scrollTo(0,0);return;}
    if(action==='edit-choice'&&!myVote()){state.voteStep='choice';render();window.scrollTo(0,0);return;}
    if(action==='reset-hero'){
      try{await setHero('');state.toast='已還原預設 🤪 吐舌表情。';state.error='';}
      catch(err){state.error=friendlyError(err);}render();return;
    }
    if(action==='manage'){state.page='manager';state.managerError='';state.managerNotice='';render();window.scrollTo(0,0);return;}
    if(action==='manager-back'){state.page='host';state.customEditId=null;state.customDraft=null;render();window.scrollTo(0,0);return;}
    if(action==='bank-tab'){state.managerTab=b.dataset.tab;state.managerError='';state.managerNotice='';state.customEditId=null;state.customDraft=null;render();return;}
    if(action==='cancel-edit'){state.customEditId=null;state.customDraft=null;render();return;}
    if(action==='edit-custom'){state.managerTab='custom';state.customEditId=bank.custom[Number(b.dataset.index)]?.id||null;state.customDraft=null;state.managerNotice='';render();window.scrollTo(0,0);return;}
    if(action==='remove-bank'){
      const kind=b.dataset.kind,index=Number(b.dataset.index);
      if(!['custom','ai'].includes(kind)||!bank[kind][index])return;
      if(!window.confirm('確定刪除這道題目嗎？建議先備份重要題庫。'))return;
      bank[kind].splice(index,1);state.customEditId=null;state.aiPreview=[];
      try{saveBank();state.managerError='';state.managerNotice='題目已刪除。';}catch(err){state.managerError=err.message;}
      render();return;
    }

    state.busy=true;state.error='';b.disabled=true;
    try{
      if(action==='demo')beginDemo();
      if(action==='host')await createOnline();
      if(action==='join')await joinOnline();
      if(action==='start'||action==='next')await beginRound();
      if(action==='submit')await submitVote();
      if(action==='reveal')await revealRound();
      if(action==='copy')await copyInvite();
      if(action==='save-custom')saveCustom();
      if(action==='copy-prompt')await copyGeminiPrompt();
      if(action==='preview-ai')previewAi();
      if(action==='confirm-ai')confirmAi();
      if(action==='export-bank')exportBank();
    }catch(err){if(state.page==='manager'){state.managerError=err.message||friendlyError(err);state.managerNotice='';}else state.error=friendlyError(err);}
    finally{state.busy=false;render();}
  });
  window.addEventListener('unhandledrejection',e=>{console.error('Unhandled game error:',e.reason);});
  window.setInterval(currentTimeTick,1000);
  window.__GAME_TEST__={QUESTIONS,evaluateRound,sampleQuestions,questionClean,parseAiQuestions,buildRoomQuestions,safeHero,compressHero,getBank:()=>bank,getRoom:()=>state.room,getHero:()=>state.heroImage};
  render();
})();
