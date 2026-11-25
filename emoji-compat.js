/* Unicode emoji presentation compatibility for Windows, macOS and mobile.
 * It changes only TEXT nodes: no HTML strings, event listeners, form values,
 * room data or player submissions are rewritten.
 */
(() => {
  'use strict';
  const segmented = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('zh-Hant', {granularity:'grapheme'})
    : null;
  // Keep ornamental arrows, pixel stars, numerals and Chinese typography in
  // their original theme font. Select only pictographic emoji clusters.
  const pictograph = /\p{Extended_Pictographic}/u;
  const emojiPresentation = /\p{Emoji_Presentation}/u;
  const forceColor = new Set(['⏱','⚙','☁','⚠','✏','➡','⬆','⬇','🗣']);
  function displayGlyph(cluster){
    // Characters such as U+23F1 default to text presentation on some PCs.
    // VS16 asks the OS emoji renderer to use its colored emoji font.
    if(forceColor.has(cluster) && !cluster.includes('\uFE0F'))return cluster + '\uFE0F';
    return cluster;
  }
  function decorate(root){
    if(!root || !segmented || typeof document.createTreeWalker !== 'function')return 0;
    const showText=typeof NodeFilter !== 'undefined' ? NodeFilter.SHOW_TEXT : 4;
    const walker=document.createTreeWalker(root,showText);
    const candidates=[];
    let node;
    while((node=walker.nextNode())){
      if(!pictograph.test(node.nodeValue))continue;
      const parent=node.parentElement;
      if(!parent || parent.closest('script,style,textarea,option,select,svg,canvas,template,[contenteditable],.emoji-glyph'))continue;
      candidates.push(node);
    }
    let wrapped=0;
    for(const textNode of candidates){
      if(!textNode.parentNode)continue;
      const graphemes=Array.from(segmented.segment(textNode.nodeValue),x=>x.segment);
      if(!graphemes.some(g=>pictograph.test(g)))continue;
      const frag=document.createDocumentFragment();
      let buffer='';
      const flush=()=>{if(buffer){frag.appendChild(document.createTextNode(buffer));buffer='';}};
      for(const cluster of graphemes){
        if(!pictograph.test(cluster)){buffer+=cluster;continue;}
        flush();
        const glyph=document.createElement('bdi');
        glyph.className='emoji-glyph';
        glyph.textContent=displayGlyph(cluster);
        // Do not make meaningful labels inaccessible to screen readers.
        frag.appendChild(glyph);
        wrapped++;
      }
      flush();
      textNode.parentNode.replaceChild(frag,textNode);
    }
    return wrapped;
  }
  window.MOQI_EMOJI_COMPAT={decorate};
})();
