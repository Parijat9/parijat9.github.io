'use strict';
// Decorative network: no requests, tracking, or changes to page content.
(() => {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-background';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const context = canvas.getContext('2d');
  if (!context) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, particles = [], frame = 0, previous = 0;
  const pointer = {x: -1000, y: -1000};
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(100, Math.max(24, Math.round(width * height / 18000)));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      radius: Math.random() * 1.3 + 1.1
    }));
    draw(0);
  }
  function draw(delta) {
    context.clearRect(0, 0, width, height);
    const rgb = document.documentElement.dataset.theme === 'dark' ? '215,215,215' : '30,30,30';
    const reach = width < 600 ? 135 : 190;
    for (const p of particles) {
      if (delta) {
        p.x += p.vx * delta; p.y += p.vy * delta;
        const dx = p.x - pointer.x, dy = p.y - pointer.y, distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 105) {
          const force = (1 - distance / 105) * .55 * delta;
          p.x += dx / distance * force; p.y += dy / distance * force;
        }
        if (p.x < 0 || p.x > width) {p.vx *= -1; p.x = Math.max(0, Math.min(width, p.x));}
        if (p.y < 0 || p.y > height) {p.vy *= -1; p.y = Math.max(0, Math.min(height, p.y));}
      }
      context.beginPath(); context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${rgb},.68)`; context.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < reach) {
          context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(${rgb},${.52 * (1 - distance / reach)})`;
          context.lineWidth = 1; context.stroke();
        }
      }
      const a = particles[i], distance = Math.hypot(a.x - pointer.x, a.y - pointer.y);
      if (distance < reach && !reducedMotion.matches) {
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(pointer.x, pointer.y);
        context.strokeStyle = `rgba(${rgb},${.62 * (1 - distance / reach)})`;
        context.lineWidth = 1.15; context.stroke();
      }
    }
  }
  function animate(time) {
    if (scrollY > innerHeight * 1.4) {previous = 0; frame = requestAnimationFrame(animate); return;}
    draw(previous ? Math.min((time - previous) / 16.67, 2) : 1);
    previous = time;
    frame = requestAnimationFrame(animate);
  }
  function start() {
    cancelAnimationFrame(frame); previous = 0;
    if (!reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(animate);
    else draw(0);
  }
  window.addEventListener('resize', resize, {passive: true});
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch') {pointer.x = event.clientX; pointer.y = event.clientY;}
  }, {passive: true});
  document.addEventListener('pointerleave', () => {pointer.x = pointer.y = -1000;});
  window.addEventListener('blur', () => {pointer.x = pointer.y = -1000;});
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', start);
  new MutationObserver(() => {if (reducedMotion.matches) draw(0);}).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
  resize(); start();
})();
const themeButton=document.querySelector('#theme');
function setTheme(theme){document.documentElement.dataset.theme=theme;themeButton.setAttribute('aria-label',theme==='dark'?'Switch to light theme':'Switch to dark theme');}
try{setTheme(localStorage.getItem('portfolio-theme')==='dark'?'dark':'light');}catch{setTheme('light');}
themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(theme);try{localStorage.setItem('portfolio-theme',theme);}catch{}});
document.querySelectorAll('.project-toggle').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));document.getElementById(button.getAttribute('aria-controls')).hidden=open;button.querySelector('.expand').textContent=open?'+':'−';}));
const sections=[...document.querySelectorAll('main>.section')];
// Scroll chapters progressively reveal the existing sections without hiding
// content from keyboard navigation or browsers without animation support.
(() => {
  if (!('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const rail = document.createElement('nav');
  rail.className = 'chapter-rail';
  rail.setAttribute('aria-label', 'Portfolio chapters');
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress, rail);
  const chapters = [document.querySelector('.hero'), ...sections];
  const names = ['Introduction', ...sections.map(s => s.querySelector('h2').textContent.trim())];
  chapters.forEach((section, index) => {
    const link = document.createElement('a');
    link.href = index === 0 ? '#top' : '#' + section.id;
    link.setAttribute('aria-label', names[index]);
    link.innerHTML = `<span class="chapter-dot"></span><span class="chapter-name">${names[index]}</span>`;
    rail.append(link);
    section.classList.add('scroll-chapter');
    section.dataset.chapter = String(index);
    if (index > 0) {
      const items = section.querySelectorAll('.section-label, .section-body > p, .skills, .job, .education, .project, .resume-row, .contact-links, .email');
      items.forEach((item, order) => {
        item.classList.add('chapter-reveal');
        item.style.setProperty('--reveal-delay', Math.min(order * 65, 260) + 'ms');
      });
    }
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('chapter-arrived');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: .06, rootMargin: '0px 0px -5% 0px'});
  sections.forEach(section => observer.observe(section));
  const revealFocused = event => event.target.closest('.scroll-chapter')?.classList.add('chapter-arrived');
  document.addEventListener('focusin', revealFocused);
  let pending = false;
  function update() {
    pending = false;
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? scrollY / scrollable : 0})`;
    let active = 0;
    chapters.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < innerHeight * .45) active = index;
      if (!reduced.matches && index > 0) {
        const offset = Math.max(-12, Math.min(12, (rect.top - innerHeight * .25) * .025));
        section.style.setProperty('--chapter-shift', offset + 'px');
      }
    });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 8) active = chapters.length - 1;
    [...rail.children].forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    chapters.forEach((section, index) => section.classList.toggle('chapter-active', index === active));
  }
  window.addEventListener('scroll', () => {if (!pending) {pending = true; requestAnimationFrame(update);}}, {passive:true});
  window.addEventListener('resize', update, {passive:true});
  reduced.addEventListener('change', update);
  document.documentElement.classList.add('scroll-experience');
  update();
})();
if('IntersectionObserver' in window){new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('header nav a').forEach(link=>link.setAttribute('aria-current',String(link.hash==='#'+entry.target.id)));}}},{rootMargin:'-15% 0px -65% 0px'}).observe(sections[0]);const observer=new IntersectionObserver(entries=>{const current=entries.find(e=>e.isIntersecting);if(current)document.querySelectorAll('header nav a').forEach(link=>link.setAttribute('aria-current',String(link.hash==='#'+current.target.id)));},{rootMargin:'-15% 0px -65% 0px'});sections.forEach(section=>observer.observe(section));}
