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
    rounds:8, seconds:45, busy:false, error:'', toast:'',
    unsubs:[], voteUnsub:null, watchedRound:null, firebase:null, autoRevealing:false
  };
  const CONFIGURED = Boolean(window.GAME_FIREBASE_CONFIG?.apiKey && window.GAME_FIREBASE_CONFIG?.projectId);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
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
  function randomCode(){const s='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:6},()=>s[Math.floor(Math.random()*s.length)]).join('');}
  function emojiFor(uid){let v=0;for(const ch of uid)v+=ch.charCodeAt(0);return EMOJIS[v % EMOJIS.length];}
  function inviteUrl(){let u = new URL(location.href);u.searchParams.set('room',state.roomCode);u.hash='';return u.toString();}
  const me=()=>state.players.find(p=>p.uid===state.uid);
  const isHost=()=>!!state.room && state.room.hostUid===state.uid;
  const question=()=>state.room && state.room.roundIndex>=0 ? QUESTIONS[state.room.questionIds[state.room.roundIndex]]:null;
  const myVote=()=>state.votes.find(v=>v.uid===state.uid && v.roundIndex===state.room?.roundIndex);
  function scoresSorted(){let scores=state.room?.scores||{};return [...state.players].sort((a,b)=>(scores[b.uid]||0)-(scores[a.uid]||0) || a.joinedAt-b.joinedAt);}
  function myRank(){const sorted=scoresSorted();return sorted.findIndex(p=>p.uid===state.uid)+1;}
  function myScore(){return state.room?.scores?.[state.uid]||0;}
  function hasDouble(){return !state.room?.usedDoubles?.[state.uid];}
  function surface(content, right=''){return `<main class="container"><div class="topbar"><div class="brand"><div class="brand-mark"><span>✦</span></div>默契失控局</div>${right || `<span class="status-tag">🎉 派對破冰遊戲</span>`}</div>${state.error?`<div class="notice" role="alert">${esc(state.error)}</div>`:''}${state.toast?`<div class="chip mint" style="margin-bottom:12px">✓ ${esc(state.toast)}</div>`:''}${content}<div class="footer">適合 10–20 人 ✦ 有笑點的社交，不是尷尬的面試<br>先笑出來，再慢慢認識彼此 ✨</div></main>`;}
  function renderHome(){
    return surface(`
      <section class="grid-hero"><div><div class="eyebrow">最鬧默契大挑戰</div><h1 class="hero-title">默契<span>失控局！</span></h1><p class="subhead">你以為大家跟你一樣？<br><b>選荒謬答案、猜全場多數、搶排行榜！</b><br>比的不是知識，是你有多懂這群人。</p></div><div class="hero-graphic"><div class="splat"></div><div class="hero-face shine">🤪</div><i class="star a">✳</i><i class="star b">✦</i></div></section>
      <section class="card section-gap"><h2 class="mini-heading">🎮 立即開一局</h2><label class="field"><span>你的遊戲暱稱</span><input id="nick" name="nickname" maxlength="14" autocomplete="nickname" placeholder="例如：火鍋教主" value="${esc(state.nickname)}"></label>
        <div class="form-grid space-top"><label class="field"><span>遊戲回合</span><select id="rounds" name="rounds"><option value="6" ${state.rounds===6?'selected':''}>6 回合｜快速暖場</option><option value="8" ${state.rounds===8?'selected':''}>8 回合｜推薦</option><option value="10" ${state.rounds===10?'selected':''}>10 回合｜歡樂加倍</option><option value="12" ${state.rounds===12?'selected':''}>12 回合｜完整挑戰</option></select></label><label class="field"><span>每回合作答時間</span><select id="seconds" name="seconds"><option value="30" ${state.seconds===30?'selected':''}>30 秒</option><option value="45" ${state.seconds===45?'selected':''}>45 秒（推薦）</option><option value="60" ${state.seconds===60?'selected':''}>60 秒</option></select></label></div>
        <div class="btn-row space-top"><button class="btn full" data-action="host">🚀 建立多人房間</button><button class="btn tertiary full" data-action="demo">🎭 先玩示範局</button></div>
        <div class="divider"></div><h2 class="mini-heading">📲 已有房間？輸入代碼加入</h2><div class="form-grid"><label class="field"><span>6 碼房間代碼</span><input id="codeInput" name="codeInput" maxlength="6" inputmode="text" autocapitalize="characters" placeholder="例如：AB3P8K" value="${esc(state.codeInput)}"></label><div style="align-self:end"><button class="btn secondary full" data-action="join">加入朋友的局 →</button></div></div>
        ${!CONFIGURED?`<p class="fineprint">⚙️ 目前未設定 Firebase：<b>示範局可以直接玩</b>；跨手機即時連線請先依操作說明設定 Firebase 專案，再放上 GitHub Pages。</p>`:`<p class="fineprint">🟢 多人連線已啟用！主持人建立房間後，分享房間代碼或網址即可加入。</p>`}
      </section>
      <section class="section-gap"><h2 class="mini-heading">🏆 不靠腦袋，靠默契（還有一點運氣）</h2><div class="rules"><div class="rule"><span class="rule-icon">🤷</span><b>① 選你自己的</b>四個荒謬答案，挑一個最像你。</div><div class="rule"><span class="rule-icon">🔮</span><b>② 猜大家的</b>預測現場最多人會選哪個。</div><div class="rule"><span class="rule-icon">🏅</span><b>③ 即時上榜</b>猜中 +100；冷門答案也可能加分！</div></div></section>
      <section class="card soft section-gap"><h2 class="mini-heading">✨ 得分機制</h2><p class="fineprint">猜中最多人選的選項 <b>+100 分</b>，連勝再加分；你的答案全場只有你選 <b>+40 分</b>，其他少數派 <b>+20 分</b>；每人還有一張 <b>「猜中分數 ×2」王牌</b>。每輪揭曉都能看到全場票數和個人排名。若第一名票數並列，猜中任何並列選項都算命中。</p></section>
    `);
  }
  function playerPills(){return state.players.map(p=>`<div class="avatar-pill"><span class="avatar-circle">${esc(p.emoji||emojiFor(p.uid))}</span>${esc(p.name)}${p.uid===state.room?.hostUid?'<span class="host-badge">房主</span>':''}${p.uid===state.uid?'<span class="host-badge">你</span>':''}</div>`).join('');}
  function renderLobby(){
    const n=state.players.length, host=isHost();
    return surface(`${title(state.mode==='demo'?'歡迎來到示範局！':'人都到齊了嗎？',state.mode==='demo'?'12 位虛擬玩家已到場。先試試荒謬投票和排行榜，正式活動再開多人房間。':'分享房間網址，讓大家用手機填入暱稱一起加入。')}<div class="card section-gap">${state.mode==='demo'?`<div class="info-box">🎭 <strong>這是單人示範模式</strong>，不能邀請朋友加入；正式版請先設定 Firebase，再建立可共用的房間。</div>`:`<div class="lobby-code"><div><div class="eyebrow">房間代碼</div><div class="code-digits">${esc(state.roomCode)}</div></div><button class="btn dark small-btn" data-action="copy">🔗 複製邀請</button></div><p class="share-link space-top">${esc(inviteUrl())}</p>`}<div class="split space-top"><h2 class="mini-heading tight">👋 已到場 ${n} 人</h2><span class="chip ${n>=10?'mint':'yellow'}">建議 10–20 人</span></div><div class="avatars space-top">${playerPills()||'<p class="empty">正在等待大家加入…</p>'}</div><div class="divider"></div><div class="split"><span class="muted">${state.room.totalRounds} 回合 × ${state.room.seconds} 秒</span><span class="chip">${state.mode==='demo'?'🎭 示範模式':'🌐 即時連線'}</span></div><div class="space-top">${host?`<button class="btn full" data-action="start" ${n<2?'disabled':''}>🔥 開始荒謬挑戰（${n} 人）</button><p class="fineprint">主持人也能參賽。開始後不接受新玩家加入；玩家中途離開會保留原有分數。</p>`:`<div class="info-box">⏳ 房主正在準備中！先看看今天會與誰展開默契大戰。</div>`}</div></div><div class="space-top"><button class="btn tertiary full" data-action="leave">← 回首頁</button></div>`, `<span class="status-tag">${esc(state.roomCode)}</span>`);
  }
  function choiceButtons(field,selected,q){return `<div class="option-grid">${q.a.map((a,i)=>`<button type="button" class="option ${selected===i?(field==='choice'?'selected':'guess-selected'):''}" data-${field}="${i}" aria-pressed="${selected===i}"><span class="option-letter">${'ABCD'[i]}</span><span>${esc(a)}</span></button>`).join('')}</div>`;}
  function roundHeader(){return `<div class="round-header"><span class="chip yellow">第 ${state.room.roundIndex+1}／${state.room.totalRounds} 回合</span><span class="rank-pill">🏅 第 ${myRank()||'–'} 名 · ${myScore()} 分</span></div><div class="progress" aria-label="回合進度"><div style="width:${Math.round(100*(state.room.roundIndex+1)/state.room.totalRounds)}%"></div></div>`;}
  function renderVote(){
    const q=question(), v=myVote(), n=state.players.length, count=state.votes.length, remaining=Math.max(0,Math.ceil(((state.room.deadline||Date.now())-Date.now())/1000));
    return surface(`${roundHeader()}<section class="space-top question-card"><div class="q-label">😈 靈魂拷問 • 第 ${state.room.roundIndex+1} 題</div><div class="question-text">${esc(q.q)}</div></section>
      <div class="poll-status"><span>📬 已作答 ${count} / ${n} 人 ${state.mode==='demo'?'（含虛擬玩家）':''}</span><span class="timer ${remaining<=10?'urgent':''}" id="timer">⏱ ${remaining} 秒</span></div><div class="progress"><div style="width:${n?count/n*100:0}%"></div></div>
      ${v?`<section class="card section-gap submitted"><div class="icon">📨</div><strong>交卷成功！等大家一起翻牌</strong><p class="muted">你選了「${esc(q.a[v.choice])}」<br>猜你們最多人選「${esc(q.a[v.guess])}」</p><span class="chip mint">✓ 答案已鎖定，無法更改</span></section>`:
      `<section class="vote-area"><h2 class="vote-label"><span>① 你自己會選？</span><span class="step">認真選也可以很荒謬</span></h2>${choiceButtons('choice',state.choice,q)}</section><section class="vote-area"><h2 class="vote-label"><span>② 猜全場最多人選？</span><span class="step">當個讀心大師</span></h2>${choiceButtons('guess',state.guess,q)}</section><label class="powerup"><input type="checkbox" id="double" ${state.double?'checked':''} ${!hasDouble()?'disabled':''}><div><strong>🃏 ${hasDouble()?'使用王牌：這題猜中 ×2':'你的王牌已用完'}</strong><br><span>${hasDouble()?'只能使用一次；猜錯也會消耗':'下次再用，這局已經沒有了'}</span></div></label><button class="btn full" data-action="submit" ${state.choice===null||state.guess===null?'disabled':''}>🚀 鎖定答案，等待翻牌！</button>`}
      ${isHost()?`<div class="card soft section-gap"><div class="split"><div><b>🎤 主持人控制台</b><div class="fineprint">作答結束，或所有人完成，就可以揭曉。倒數結束會自動揭曉（主持人需保持網頁開啟）。</div></div></div><button class="btn secondary full space-top" data-action="reveal" ${count===0?'disabled':''}>🎊 揭曉這題結果</button></div>`:`<div class="info-box space-top">💬 等待主持人揭曉。先猜猜看，哪一個答案會是全場最爆笑的選擇？</div>`}
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
  function renderReveal(){
    const q=question(),last=state.room.lastResult||{},g=last.gains?.[state.uid],v=myVote();
    const scoreText=g?`${g.total}`:'0';
    return surface(`${roundHeader()}<section class="space-top question-card"><div class="q-label">🎉 答案開獎啦！</div><div class="question-text">${esc(q.q)}</div></section>${renderPoll()}
      <div class="score-highlight section-gap"><span class="eyebrow">本回合得分</span><div class="split"><div><div class="score-big">+${scoreText}</div><div class="score-detail">${v?`猜多數 ${g?.guess||0} 分${g?.doubleUsed?'（王牌生效）':''} · 冷門 ${g?.rare||0} 分 · 連勝 ${g?.streakBonus||0} 分`:'本回合未作答'}</div></div><span style="font-size:50px">${g?.total>=100?'😎':'🤪'}</span></div></div>
      <div class="info-box section-gap"><strong>🎤 這題的爆笑交流時間</strong><div>${esc(q.talk)}</div><div class="fineprint">自願分享就好，不用強迫任何人表演。</div></div>
      ${renderLeaderboard(true)}
      <div class="section-gap">${isHost()?`<button class="btn full" data-action="next">${state.room.roundIndex+1>=state.room.totalRounds?'🏆 公布最終冠軍！':'➡️ 下一題，繼續失控！'}</button><p class="fineprint">建議每題留 30–60 秒聊天，讓大家不只看排名，也能認識彼此。</p>`:`<div class="info-box">🎙 等主持人帶大家聊天完，就一起進下一題！</div>`}</div>
    `, `<span class="status-tag">${esc(state.roomCode)}</span>`);
  }
  function renderFinished(){
    const sorted=scoresSorted(), winner=sorted[0],myPosition=myRank();
    return surface(`<div class="eyebrow">遊戲結束・全場封神</div><section class="question-card section-gap" style="text-align:center"><div style="font-size:73px">🏆</div><h1 class="page-title" style="margin-top:0;color:#27213a">恭喜默契之王！</h1><div style="font-weight:900;font-size:28px;color:#292039">${esc(winner?.emoji||'🎉')} ${esc(winner?.name||'所有參加者')}</div><p style="font-weight:800;color:#2c253d">以 ${state.room.scores?.[winner?.uid]||0} 分勇奪第一！</p></section>
      <div class="card section-gap"><h2 class="mini-heading">🙌 你的最後成績</h2><div class="split"><div><div class="score-big">#${myPosition||'–'}</div><div class="fineprint">個人名次／${state.players.length} 人</div></div><div style="text-align:right"><div class="score-big">${myScore()}</div><div class="fineprint">總分</div></div></div></div>${renderLeaderboard(false)}
      <section class="info-box section-gap"><strong>🗣 遊戲結束，再留 3 分鐘：</strong><div>找一位你今天最意外「原來你也這樣！」的朋友，分享一件剛才還沒說完的趣事。<br>或是全場選出「最荒謬但最有道理的答案」。</div></section>
      <div class="btn-row section-gap">${state.mode==='online'?`<button class="btn secondary" data-action="copy">🔗 複製活動網址</button>`:''}<button class="btn" data-action="leave">🔁 再開一局</button></div>
    `, `<span class="status-tag">${state.room.totalRounds} 回合已完成</span>`);
  }
  function render(){
    if(!state.mode || !state.room) {$app.innerHTML=renderHome();return;}
    if(state.room.phase==='lobby') $app.innerHTML=renderLobby();
    else if(state.room.phase==='voting') $app.innerHTML=renderVote();
    else if(state.room.phase==='reveal') $app.innerHTML=renderReveal();
    else if(state.room.phase==='finished') $app.innerHTML=renderFinished();
    else $app.innerHTML=surface('<div class="loading-page">正在同步遊戲房間…</div>');
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
    clearListeners();state.mode='demo';state.uid='demo-me';state.roomCode='DEMO88';
    state.players=[{uid:state.uid,name,emoji:'😎',joinedAt:0},...BOT_NAMES.map((name,i)=>({uid:'bot'+i,name,emoji:EMOJIS[i],joinedAt:i+1}))];
    state.room={hostUid:state.uid,phase:'lobby',roundIndex:-1,totalRounds:state.rounds,seconds:state.seconds,questionIds:sampleQuestions(state.rounds),scores:{},streaks:{},usedDoubles:{},lastResult:null,deadline:null};
    state.votes=[];state.choice=null;state.guess=null;state.double=false;history.replaceState(null,'',location.pathname);render();
  }
  function validateName(){const s=state.nickname.trim().slice(0,14);if(!s){state.error='先填入暱稱，這樣排行榜才知道誰是誰。';render();return null;}state.nickname=s;localStorage.setItem('mqs_name',s);state.error='';return s;}
  function clearListeners(){for(const f of state.unsubs){try{f();}catch{}}state.unsubs=[];if(state.voteUnsub){state.voteUnsub();state.voteUnsub=null;}state.watchedRound=null;}
  function leave(){clearListeners();state.room=null;state.mode=null;state.roomCode='';state.votes=[];state.players=[];state.choice=null;state.guess=null;state.double=false;state.error='';history.replaceState(null,'',location.pathname);render();}
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
    const f=await getFirebase(),L=f.dbLib;
    let code='';
    for(let i=0;i<6;i++){const candidate=randomCode();const snap=await L.getDoc(roomRef(candidate));if(!snap.exists()){code=candidate;break;}}
    if(!code)throw new Error('房間代碼產生失敗，請再試一次。');
    const data={hostUid:state.uid,phase:'lobby',roundIndex:-1,totalRounds:state.rounds,seconds:state.seconds,questionIds:sampleQuestions(state.rounds),scores:{},streaks:{},usedDoubles:{},lastResult:null,deadline:null,createdAt:Date.now()};
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
      const prevRound=state.room?.roundIndex;
      state.room=snap.data();
      if(state.room.roundIndex!==prevRound){state.choice=null;state.guess=null;state.double=false;state.votes=[];}
      if(state.room.roundIndex>=0 && state.watchedRound!==state.room.roundIndex){subscribeVotes(code,state.room.roundIndex);}
      render();
    },err=>{state.error='同步房間失敗：'+friendlyError(err);render();});
    const offPlayers=L.onSnapshot(L.collection(db,'rooms',code,'players'),snap=>{
      state.players=snap.docs.map(d=>d.data()).sort((a,b)=>a.joinedAt-b.joinedAt);
      render();
    },err=>{state.error='載入玩家名單失敗：'+friendlyError(err);render();});
    state.unsubs.push(offRoom,offPlayers);
  }
  function subscribeVotes(code,ri){
    if(state.voteUnsub)state.voteUnsub();state.watchedRound=ri;
    const L=state.firebase.dbLib;
    state.voteUnsub=L.onSnapshot(L.query(votesCollection(code),L.where('roundIndex','==',ri)),snap=>{
      if(state.room?.roundIndex!==ri)return;
      state.votes=snap.docs.map(d=>d.data());render();
    },err=>{state.error='讀取票數失敗：'+friendlyError(err);render();});
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
      if(state.room.roundIndex!==previous){state.choice=null;state.guess=null;state.double=false;simulateBots(state.room.roundIndex);}
      state.error='';render();return;
    }
    const L=state.firebase.dbLib;
    await L.updateDoc(roomRef(state.roomCode),patch);
  }
  async function submitVote(){
    if(state.room.phase!=='voting'||myVote())return;
    if(state.choice===null||state.guess===null)throw new Error('請完成自己的答案，以及猜全場最多人選的答案。');
    if(state.mode==='online'&&Date.now()>state.room.deadline+3000)throw new Error('作答時間已到，等主持人公布答案吧！');
    const payload={uid:state.uid,roundIndex:state.room.roundIndex,choice:state.choice,guess:state.guess,double:state.double&&hasDouble(),at:Date.now()};
    if(state.mode==='demo'){state.votes.push(payload);state.error='';render();}
    else{
      const L=state.firebase.dbLib;
      await L.setDoc(L.doc(state.firebase.db,'rooms',state.roomCode,'votes',`${state.uid}_${state.room.roundIndex}`),payload);
    }
  }
  async function revealRound(){
    if(!isHost()||state.room.phase!=='voting')return;
    state.autoRevealing=true;
    try{
      let votes=state.votes;
      if(state.mode==='online'){
        const L=state.firebase.dbLib;
        const snap=await L.getDocs(L.query(votesCollection(state.roomCode),L.where('roundIndex','==',state.room.roundIndex)));
        votes=snap.docs.map(d=>d.data());
      }
      const changes=evaluateRound(state.room,state.players,votes);
      await updateRoom(changes);
    }finally{state.autoRevealing=false;}
  }
  function currentTimeTick(){
    if(state.room?.phase!=='voting')return;
    const remaining=Math.max(0,Math.ceil(((state.room.deadline||Date.now())-Date.now())/1000));
    const t=document.getElementById('timer');if(t){t.textContent=`⏱ ${remaining} 秒`;t.classList.toggle('urgent',remaining<=10);}
    if(remaining===0 && isHost() && !state.busy && !state.autoRevealing){
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
    if(e.target.name==='nickname'){state.nickname=e.target.value;localStorage.setItem('mqs_name',state.nickname);}
    if(e.target.name==='codeInput')state.codeInput=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
  });
  document.addEventListener('change',e=>{
    if(e.target.name==='rounds')state.rounds=Number(e.target.value);
    if(e.target.name==='seconds')state.seconds=Number(e.target.value);
    if(e.target.id==='double')state.double=e.target.checked;
  });
  document.addEventListener('click',async e=>{
    const c=e.target.closest('[data-choice]'),g=e.target.closest('[data-guess]');
    if(c && !myVote()){state.choice=Number(c.dataset.choice);render();return;}
    if(g && !myVote()){state.guess=Number(g.dataset.guess);render();return;}
    const b=e.target.closest('[data-action]');if(!b||state.busy)return;
    const action=b.dataset.action;
    if(action==='leave'){leave();return;}
    state.busy=true;state.error='';b.disabled=true;
    try{
      if(action==='demo')beginDemo();
      if(action==='host')await createOnline();
      if(action==='join')await joinOnline();
      if(action==='start'||action==='next')await beginRound();
      if(action==='submit')await submitVote();
      if(action==='reveal')await revealRound();
      if(action==='copy')await copyInvite();
    }catch(err){state.error=friendlyError(err);}
    finally{state.busy=false;render();}
  });
  window.addEventListener('unhandledrejection',e=>{console.error('Unhandled game error:',e.reason);});
  window.setInterval(currentTimeTick,1000);
  window.__GAME_TEST__={QUESTIONS,evaluateRound,sampleQuestions};
  render();
})();
