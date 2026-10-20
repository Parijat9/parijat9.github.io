'use strict';
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 851px) and (min-height: 700px)');
  const work = document.querySelector('.work-story');
  const caption = document.querySelector('.work-caption');
  const career = document.querySelector('#experience');
  const jobs = [...career.querySelectorAll('.job')];
  const navLinks = [...document.querySelectorAll('header nav a')];
  const navSections = navLinks.map(link => document.querySelector(link.hash));
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let previousPhase = -1;
  const chapterSurfaces = [...document.querySelectorAll('.section:not(#contact),.work-story')];

  const captions = ['Bring the records together.', 'Check the numbers that need attention.', 'Give the team a report they can use.'];
  const clamp = x => Math.max(0, Math.min(1, x));
  let pending = false;
  function update() {
    pending = false;
    const animated = desktop.matches && !reduced.matches;
    root.classList.toggle('story-ready', animated);
    root.style.setProperty('--network-opacity', String(.34 * (1 - clamp(scrollY / innerHeight))));
    const wr = work.getBoundingClientRect();
    const fraction = clamp(-wr.top / Math.max(1, wr.height - innerHeight));
    const phase = Math.min(2, Math.floor(fraction * 3));
    if (phase !== previousPhase) {work.dataset.phase = String(phase); caption.textContent = captions[phase]; previousPhase = phase;}
    chapterSurfaces.forEach(section => {
      const bottom = section.getBoundingClientRect().bottom;
      const curve = reduced.matches ? 36 : 12 + 70 * clamp(bottom / innerHeight);
      section.style.setProperty('--curve-depth', curve + 'px');
    });
    const scrollable = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? clamp(scrollY / scrollable) : 0})`;
    let current = -1;
    navSections.forEach((section, i) => {if (section.getBoundingClientRect().top < innerHeight * .45) current = i;});
    if (scrollY + innerHeight >= root.scrollHeight - 8) current = navSections.length - 1;
    navLinks.forEach((link, i) => {if (i === current) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');});
    const cr = career.getBoundingClientRect();
    career.style.setProperty('--career-progress', clamp((innerHeight * .7 - cr.top) / cr.height));
    jobs.forEach(job => job.classList.toggle('in-view', job.getBoundingClientRect().top < innerHeight * .7));
  }
  function schedule() {if (!pending) {pending = true; requestAnimationFrame(update);}}
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', update);
  desktop.addEventListener('change', update);
  update();
})();
// Original interaction layer: measured behavior, no reference assets or dependencies.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const track = document.querySelector('.name-track');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-menu');
  const motion = document.querySelector('.motion-toggle');
  const enabled = () => !reduce.matches && !root.classList.contains('motion-paused');
  root.classList.add('motion-enhanced');
  let frame = 0, lastTime = 0, heroVisible = true, offset = 0, direction = -1;
  let previousScroll = scrollY;
  let wheelTarget = scrollY, wheelActive = false, lastWritten = scrollY;
  let routeBusy = false, menuClosing = false;
  const magnets = [];
  const wake = () => {if (!frame && !document.hidden) frame = requestAnimationFrame(tick);};
  const stopWheel = () => {wheelActive = false; wheelTarget = scrollY;};
  const canPoint = () => enabled() && pointer.matches && !root.classList.contains('intro-running');
  const intro = document.querySelector('#intro-overlay');
  const greeting = intro.querySelector('.intro-greeting');
  const protectedElements = [...document.querySelectorAll('header,main,footer,body>.skip,.menu-toggle')];
  let introTimers = [], introDone = false;
  function finishIntro(animate = true) {
    if (introDone) return;
    introDone = true;
    introTimers.forEach(clearTimeout); clearTimeout(window.introSafety);
    const hadFocus = intro.contains(document.activeElement);
    protectedElements.forEach(el => {el.inert = false;});
    root.classList.remove('intro-running');
    if (animate && enabled()) {
      intro.classList.add('leaving');
      const distance = innerWidth > 540 ? '50vh' : '10vh';
      document.querySelectorAll('.hero-portrait,.hero>.eyebrow,.hero>h1,.hero>.role,.hero-actions,.name-marquee').forEach((el,i) => {
        el.animate([{transform:`translateY(${distance})`,opacity:0},{transform:'translateY(0)',opacity:1}],{duration:1500,delay:i*70,easing:'cubic-bezier(.16,1,.3,1)'});
      });
      setTimeout(() => {intro.hidden = true; intro.classList.remove('leaving');},1000);
    } else {intro.hidden = true;}
    if (hadFocus) {const title=hero.querySelector('h1'); title.tabIndex=-1; title.focus({preventScroll:true});}
    document.dispatchEvent(new Event('portfolio-motion-change')); wake();
  }
  if (root.classList.contains('intro-running') && enabled()) {
    protectedElements.forEach(el => {el.inert = true;});
    intro.setAttribute('aria-hidden','false');
    const words = [['Hello','en'],['Bonjour','fr'],['स्वागत हे','hi'],['Ciao','it'],['おい','ja'],['Hallå','sv'],['Guten tag','de'],['Hallo','nl']];
    words.forEach(([text,lang],i) => introTimers.push(setTimeout(() => {greeting.textContent=text;greeting.lang=lang;greeting.classList.add('visible');},i===0?500:900+i*150)));
    introTimers.push(setTimeout(() => finishIntro(),2350));
  } else finishIntro(false);
  intro.querySelector('button').addEventListener('click',()=>finishIntro(false));
  document.addEventListener('intro-timeout',()=>finishIntro(false));
  addEventListener('pageshow',event=>{if(event.persisted)finishIntro(false);});

  // Native dialog provides focus containment and Escape support.
  const menuNav = menu.querySelector('nav');
  document.querySelectorAll('header nav a').forEach((link,i)=>{const copy=link.cloneNode(true);copy.style.setProperty('--item',i);copy.removeAttribute('aria-current');menuNav.append(copy);});
  document.querySelectorAll('.hero-bottom .social a').forEach(link=>menu.querySelector('.menu-social').append(link.cloneNode(true)));
  function openMenu() {
    if (menu.open || menuClosing) return;
    stopWheel(); hidePreview(); menu.showModal(); root.classList.add('menu-open');
    toggle.setAttribute('aria-expanded','true');
    requestAnimationFrame(()=>menu.classList.add('is-open'));
  }
  function closeMenu() {
    if (!menu.open || menuClosing) return Promise.resolve();
    menuClosing=true;menu.classList.remove('is-open');
    return new Promise(resolve=>setTimeout(()=>{menu.close();root.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');menuClosing=false;resolve();},enabled()?650:0));
  }
  toggle.addEventListener('click',openMenu);
  menu.querySelector('.menu-close').addEventListener('click',()=>closeMenu());
  menu.addEventListener('cancel',event=>{event.preventDefault();closeMenu();});
  menu.addEventListener('click',event=>{const b=menu.getBoundingClientRect();if(event.clientX<b.left||event.clientY<b.top||event.clientY>b.bottom)closeMenu();});

  // Fixed hit areas; shape and text use separate damped springs.
  document.querySelectorAll('.about-circle,.contact-circle,.hero-cta,.resume-button,header nav a,.menu-toggle,.menu-social a,.contact-links a,.hero-bottom .social a').forEach(hit=>{
    const circle=hit.matches('.about-circle,.contact-circle,.menu-toggle');
    const surface=document.createElement('span');surface.className='magnetic-face';
    const label=document.createElement('span');label.className='magnetic-label';
    label.append(...hit.childNodes);surface.append(label);hit.append(surface);hit.classList.add('magnet');
    const state={hit,surface,label,x:0,y:0,vx:0,vy:0,tx:0,ty:0,hover:false,shape:circle?70:hit.closest('nav')?20:35,text:circle?30:10};magnets.push(state);
    hit.addEventListener('pointerenter',()=>{if(canPoint()){state.hover=true;surface.classList.remove('fill-leaving');}});
    hit.addEventListener('pointermove',event=>{if(!canPoint())return;const b=hit.getBoundingClientRect();state.tx=(event.clientX-b.left)/b.width-.5;state.ty=(event.clientY-b.top)/b.height-.5;wake();});
    const reset=()=>{state.hover=false;state.tx=state.ty=0;surface.classList.add('fill-leaving');wake();};
    hit.addEventListener('pointerleave',reset);hit.addEventListener('blur',reset);
  });

  // A screenshot trails behind the pointer; the round label follows faster.
  const preview=document.createElement('div');preview.className='pointer-preview';preview.setAttribute('aria-hidden','true');preview.inert=true;
  const reel=document.createElement('div');reel.className='preview-reel';preview.append(reel);
  const projectRows=[...document.querySelectorAll('.project-row')];
  projectRows.forEach(row=>{
    const cell=document.createElement('div');
    if(row.dataset.preview){const img=new Image();img.src=row.dataset.preview;img.alt='';cell.append(img);}
    else {cell.className='private-preview';const label=document.createElement('small');label.textContent='Private repo';const title=document.createElement('strong');title.textContent=row.querySelector('.project-name').textContent;const summary=document.createElement('p');summary.textContent=row.querySelector('h4').textContent;cell.append(label,title,summary);}
    reel.append(cell);
  });
  const cursor=document.createElement('div');cursor.className='project-cursor';cursor.setAttribute('aria-hidden','true');cursor.textContent='View';document.body.append(preview,cursor);
  let targetX=0,targetY=0,imageX=0,imageY=0,cursorX=0,cursorY=0,previewOn=false,cursorOn=false,currentHover=null;
  function hidePreview(){previewOn=cursorOn=false;currentHover=null;preview.classList.remove('visible');cursor.classList.remove('visible','pressed');root.classList.remove('project-pointer');}
  const projectSection=document.querySelector('#projects');
  function updatePreview(event){
    if(!canPoint()||menu.open)return;
    if(event){targetX=event.clientX;targetY=event.clientY;}
    const hit=document.elementFromPoint(targetX,targetY);
    if(!projectSection.contains(hit)){hidePreview();return;}
    const row=hit.closest('.project-row')||projectRows.reduce((nearest,item)=>Math.abs(item.getBoundingClientRect().top+item.offsetHeight/2-targetY)<Math.abs(nearest.getBoundingClientRect().top+nearest.offsetHeight/2-targetY)?item:nearest);
    if(!cursorOn){imageX=cursorX=targetX;imageY=cursorY=targetY;}
    currentHover=projectSection;previewOn=cursorOn=true;
    reel.style.transform=`translateY(-${projectRows.indexOf(row)*100}%)`;
    cursor.textContent=row.dataset.private?'Private':'View';
    preview.classList.add('visible');cursor.classList.add('visible');root.classList.add('project-pointer');wake();
  }
  projectSection.addEventListener('pointerenter',updatePreview);
  projectSection.addEventListener('pointermove',updatePreview);
  projectSection.addEventListener('pointerleave',hidePreview);
  projectSection.addEventListener('pointerdown',()=>cursor.classList.add('pressed'));
  projectSection.addEventListener('pointerup',()=>cursor.classList.remove('pressed'));
  addEventListener('blur',hidePreview);document.addEventListener('pointerleave',hidePreview);

  // Curved section transition; external and new-tab links keep native behavior.
  const veil=document.createElement('div');veil.className='route-veil';veil.setAttribute('aria-hidden','true');const veilTitle=document.createElement('span');veil.append(veilTitle);document.body.append(veil);
  function jump(link){
    const target=document.querySelector(link.hash);if(!target)return;
    stopWheel();history.pushState(null,'',link.hash);
    target.scrollIntoView({behavior:'instant',block:'start'});
    target.tabIndex=-1;target.focus({preventScroll:true});
  }
  document.querySelectorAll('header nav a,.monogram,.menu-content nav a').forEach(link=>link.addEventListener('click',async event=>{
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();if(routeBusy)return;routeBusy=true;stopWheel();hidePreview();
    if(menu.open)await closeMenu();
    if(enabled()){
      veilTitle.textContent=link.classList.contains('monogram')?'Home':link.textContent.trim();
      root.classList.add('route-running');veil.classList.add('cover');
      await new Promise(resolve=>setTimeout(resolve,500));jump(link);
      veil.classList.add('uncover');await new Promise(resolve=>setTimeout(resolve,800));
      veil.classList.remove('cover','uncover');root.classList.remove('route-running');
    }else jump(link);
    routeBusy=false;
  }));
  addEventListener('popstate',()=>{stopWheel();hidePreview();if(menu.open)closeMenu();});

  // Native document positions keep sticky scenes, anchors and keyboard scrolling intact.
  function nativeArea(event){
    for(let el=event.target;el&&el!==document.body;el=el.parentElement){
      if(el.matches?.('input,textarea,select,[contenteditable="true"]'))return true;
      if(el.scrollHeight>el.clientHeight+2&&/(auto|scroll)/.test(getComputedStyle(el).overflowY))return true;
    }return false;
  }
  addEventListener('wheel',event=>{
    if(!canPoint()||menu.open||routeBusy||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||nativeArea(event))return;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(!wheelActive)wheelTarget=scrollY;
    wheelTarget=Math.max(0,Math.min(root.scrollHeight-innerHeight,wheelTarget+delta));
    if(Math.abs(wheelTarget-scrollY)<.5)return;
    event.preventDefault();wheelActive=true;wake();
  },{passive:false});
  addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Tab'].includes(event.key))stopWheel();});
  addEventListener('pointerdown',stopWheel,{passive:true});
  document.addEventListener('focusin',stopWheel);
  addEventListener('scroll',()=>{
    const delta = scrollY - previousScroll;
    if (Math.abs(delta) > .5) direction = delta > 0 ? 1 : -1;
    previousScroll = scrollY;
    if(wheelActive&&Math.abs(scrollY-lastWritten)>3)stopWheel();
    toggle.classList.toggle('is-scrolled',scrollY>innerHeight*.3);
    if(currentHover)updatePreview();
    wake();
  },{passive:true});
  new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;wake();}).observe(hero);
  function resetMotion(){
    stopWheel();hidePreview();magnets.forEach(m=>{m.x=m.y=m.tx=m.ty=m.vx=m.vy=0;m.surface.style.transform='';m.label.style.transform='';});
    if(reduce.matches)finishIntro(false);
    document.dispatchEvent(new Event('portfolio-motion-change'));wake();
  }
  motion.addEventListener('click',()=>{const paused=root.classList.toggle('motion-paused');motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Resume motion':'Pause motion';resetMotion();});
  reduce.addEventListener('change',resetMotion);pointer.addEventListener('change',resetMotion);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0;stopWheel();hidePreview();}else wake();});
  addEventListener('resize',()=>{stopWheel();wake();});
  function tick(time){
    frame=0;const dt=Math.min((time-(lastTime||time-16.67))/16.67,2);lastTime=time;
    if(document.hidden)return;
    let busy=false;
    if(wheelActive&&enabled()){
      const next=scrollY+(wheelTarget-scrollY)*(1-Math.pow(.90,dt));
      lastWritten=Math.abs(wheelTarget-next)<.5?wheelTarget:next;
      window.scrollTo({top:lastWritten,behavior:'instant'});
      if(Math.abs(wheelTarget-scrollY)<1)wheelActive=false;else busy=true;
    }
    if(canPoint()){
      magnets.forEach(m=>{
        const stiffness=m.hover?.10:.075, damping=m.hover?.65:.78;
        m.vx=(m.vx+(m.tx-m.x)*stiffness*dt)*Math.pow(damping,dt);m.vy=(m.vy+(m.ty-m.y)*stiffness*dt)*Math.pow(damping,dt);
        m.x+=m.vx*dt;m.y+=m.vy*dt;
        if(Math.abs(m.tx-m.x)+Math.abs(m.ty-m.y)+Math.abs(m.vx)+Math.abs(m.vy)>.0003){
          m.surface.style.transform=`translate3d(${m.x*m.shape}px,${m.y*m.shape}px,0)`;m.label.style.transform=`translate3d(${m.x*m.text}px,${m.y*m.text}px,0)`;busy=true;
        }else if(!m.hover){m.surface.style.transform='';m.label.style.transform='';}
      });
      if(cursorOn){
        imageX+=(targetX-imageX)*(1-Math.pow(11/12,dt*2));imageY+=(targetY-imageY)*(1-Math.pow(11/12,dt*2));
        cursorX+=(targetX-cursorX)*(1-Math.pow(6/7,dt*2));cursorY+=(targetY-cursorY)*(1-Math.pow(6/7,dt*2));
        preview.style.translate=`${imageX}px ${imageY}px`;cursor.style.translate=`${cursorX}px ${cursorY}px`;
        if(Math.abs(targetX-imageX)+Math.abs(targetY-imageY)>.1)busy=true;
      }
    }
    if(enabled()&&heroVisible&&!root.classList.contains('intro-running')&&!menu.open){
      const period=track.scrollWidth/4;offset+=direction*period/9000*(dt*16.67);
      if(period){offset=((offset%period)-period)%period;track.style.transform=`translate3d(${offset}px,0,0)`;}busy=true;
    }
    if(busy)wake();else lastTime=0;
  }
  wake();
})();
