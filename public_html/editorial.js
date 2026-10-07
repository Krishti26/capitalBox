/* Shared presentation and motion layer. No business content is replaced. */
(() => {
  const init = () => {
    const body = document.body;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hero = document.querySelector('.hero-section, .subpage-hero');
    const homeHero = document.querySelector('.hero-section');
    const serviceLinks = homeHero?.querySelector('.service-box-container');
    if (serviceLinks) homeHero.after(serviceLinks);
    if (!hero) body.classList.add('editorial-document');
    document.querySelectorAll('main > div, main > section').forEach(el => {
      if (!el.matches('.hero-section,.subpage-hero,.service-box-container') && !el.classList.contains('hidden')) el.classList.add('editorial-section');
    });
    // Assign consistent surfaces to legacy inline backgrounds and card styles.
    document.querySelectorAll('main *').forEach(el => {
      if (el.closest('.hero-section,.subpage-hero,.popup') || el.matches('img,svg,path,script,style,button,a,input,textarea,select')) return;
      const style = getComputedStyle(el);
      const rgb = style.backgroundColor.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
      if (rgb) {
        const [r,g,b] = rgb.slice(1).map(Number);
        if (r > 240 && g > 235 && b > 210) el.classList.add('cb-paper-surface');
        else if (r > 150 && g > 130 && b < 140) el.classList.add('cb-soft-surface');
        else if (r < 85 && g < 85 && b < 85 && el.clientWidth > 60) el.classList.add('cb-dark-surface');
      }
      if (style.boxShadow !== 'none') el.classList.add('cb-no-shadow');
      if (style.borderTopWidth !== '0px' && el.clientWidth > 80) el.classList.add('cb-border');
    });
    const nav = document.getElementById('navbar');
    const menuButton = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    if (menuButton && menu) {
      menuButton.setAttribute('aria-controls','mobile-menu');
      const sync = () => {
        const open = !menu.classList.contains('hidden');
        menuButton.setAttribute('aria-expanded',String(open));
        menuButton.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation');
        body.classList.toggle('cb-menu-open',open);
      };
      new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['class']});
      sync();
      document.addEventListener('keydown',e => { if(e.key==='Escape' && !menu.classList.contains('hidden')) menuButton.click(); });
    }
    // Wrap existing heading words without changing text or inline emphasis (excluding hero-section).
    if (!reduced) document.querySelectorAll('main h1, main h2, main .tcb-title').forEach(heading => {
      if (heading.closest('.hero-section')) return;
      heading.classList.add('cb-split-heading');
      const walker = document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
      const nodes = []; while(walker.nextNode()) nodes.push(walker.currentNode);
      let i = 0;
      nodes.forEach(node => {
        if (!node.textContent.trim()) return;
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(word => {
          if (!word.trim()) { fragment.append(document.createTextNode(word)); return; }
          const mask = document.createElement('span'); mask.className='cb-word-mask';
          const inner = document.createElement('span'); inner.className='cb-word'; inner.textContent=word;
          inner.style.setProperty('--word-delay',`${Math.min(i++ * 35,300)}ms`);
          mask.append(inner); fragment.append(mask);
        });
        node.replaceWith(fragment);
      });
    });
    const progress = document.createElement('div');
    progress.className='editorial-progress'; progress.setAttribute('aria-hidden','true'); body.append(progress);
    const heroImage = hero?.querySelector('.subpage-hero-img');
    let scheduled=false;
    const update = () => {
      nav?.classList.toggle('editorial-scrolled',scrollY>60);
      const total=document.documentElement.scrollHeight-innerHeight;
      progress.style.transform=`scaleX(${total>0?scrollY/total:0})`;
      if (!reduced && innerWidth>=768 && hero && scrollY<innerHeight*1.3) {
        if(homeHero) homeHero.style.backgroundPosition=`center calc(50% + ${scrollY*.16}px)`;
        if(heroImage) heroImage.style.translate=`0 ${scrollY*.12}px`;
      }
      scheduled=false;
    };
    addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}}, {passive:true}); update();
    if (!reduced && 'IntersectionObserver' in window) {
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('editorial-visible','cb-in-view');observer.unobserve(entry.target);}});
      },{threshold:.07,rootMargin:'0px 0px -20px 0px'});
      document.querySelectorAll('main h2,main h3,main h4,main .tcb-title,main [class*="article-card"],main .service-card,main .faq-item,main .consultation-item,main .tcb-text,main .swiper').forEach((el,i)=>{
        if(el.closest('.hero-section,.subpage-hero,.popup,#form-container')) return;
        el.classList.add('editorial-reveal');
        if(el.matches('.swiper')) el.classList.add('cb-image-reveal');
        el.style.setProperty('--reveal-delay',`${(i%3)*50}ms`); observer.observe(el);
      });
      body.classList.add('editorial-motion');
    }
    // Image hover follows the reference's restrained zoom and VIEW affordance.
    if(!reduced && matchMedia('(pointer:fine)').matches){
      const cursor=document.createElement('div');cursor.className='cb-view-cursor';cursor.textContent='VIEW';cursor.setAttribute('aria-hidden','true');body.append(cursor);
      document.querySelectorAll('main a:has(img),main .swiper').forEach(el=>{
        el.addEventListener('pointerenter',()=>cursor.classList.add('is-visible'));
        el.addEventListener('pointerleave',()=>cursor.classList.remove('is-visible'));
        el.addEventListener('pointermove',e=>{cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`;});
      });
    }
    // Resolve each icon against its actual surface, including changing tabs and menus.
    const icons = [...document.querySelectorAll('i[class*="fa"], svg')].filter(el => {
      if(el.closest('#cb-loader')) return false;
      if(el.tagName.toLowerCase()==='svg') {
        const box=el.getBoundingClientRect();
        return box.width<=90 && box.height<=90;
      }
      return true;
    });
    const syncIcons=()=>icons.forEach(icon=>{
      let light=false;
      if(icon.closest('#navbar')) light=!nav?.classList.contains('editorial-scrolled') && !body.classList.contains('editorial-document') && !body.classList.contains('cb-menu-open') && !icon.closest('#mobile-dropdown');
      else if(icon.closest('.hero-section,.subpage-hero')) light=true;
      else {
        let parent=icon.parentElement;
        while(parent){
          const bg=getComputedStyle(parent).backgroundColor;
          const rgb=bg.match(/(?:rgba?|color)\(([^)]+)\)/);
          if(rgb && bg!=='rgba(0, 0, 0, 0)'){
            const parts=rgb[1].split(/[,\s]+/).map(Number);
            if(parts.length>=3 && (parts.length===3 || parts[3]>.6)){
              light=(parts[0]*.2126+parts[1]*.7152+parts[2]*.0722)<145;break;
            }
          }
          parent=parent.parentElement;
        }
      }
      if(!icon.classList.contains('cb-contrast-icon')) icon.classList.add('cb-contrast-icon');
      icon.style.setProperty('--cb-icon-color',light?'#f4f3eb':'#1e1e1e');
    });
    syncIcons();
    let iconFrame=false;
    const scheduleIcons=()=>{if(!iconFrame){iconFrame=true;requestAnimationFrame(()=>{syncIcons();iconFrame=false;});}};
    new MutationObserver(scheduleIcons).observe(document.querySelector('main')||body,{subtree:true,attributes:true,attributeFilter:['class']});
    if(nav)new MutationObserver(scheduleIcons).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
    document.addEventListener('click',scheduleIcons);
    const loader=document.getElementById('cb-loader');
    let complete=false;
    const enter=()=>{
      if(complete)return;complete=true;
      loader?.classList.add('cb-loader-exit');
      body.classList.add('cb-site-ready');body.classList.remove('cb-loading');
      hero?.querySelectorAll('.cb-split-heading').forEach(el=>el.classList.add('cb-in-view'));
      setTimeout(()=>loader?.remove(),reduced?0:1100);
    };
    if(loader){
      body.classList.add('cb-loading');
      const start=performance.now();const duration=reduced?0:1900;
      const count=document.getElementById('cb-loader-count');
      const tick=now=>{if(complete)return;const n=Math.min(100,Math.round((now-start)/duration*100));if(count)count.textContent=String(n).padStart(2,'0');if(n<100)requestAnimationFrame(tick);};
      if(!reduced)requestAnimationFrame(tick);
      const fonts=document.fonts?.ready||Promise.resolve();
      Promise.all([new Promise(resolve=>setTimeout(resolve,duration)),Promise.race([fonts,new Promise(resolve=>setTimeout(resolve,2800))])]).then(enter);
      setTimeout(enter,3500); // Recovery when assets or third-party scripts never finish.
    }else enter();
    addEventListener('pageshow',e=>{if(e.persisted)enter();});
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();

