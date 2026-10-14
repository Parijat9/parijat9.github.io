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
      radius: Math.random() * 1.2 + .6
    }));
    draw(0);
  }
  function draw(delta) {
    context.clearRect(0, 0, width, height);
    const rgb = document.documentElement.dataset.theme === 'dark' ? '215,215,215' : '30,30,30';
    const reach = width < 600 ? 115 : 165;
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
      context.fillStyle = `rgba(${rgb},.32)`; context.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < reach) {
          context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(${rgb},${.23 * (1 - distance / reach)})`;
          context.lineWidth = .7; context.stroke();
        }
      }
      const a = particles[i], distance = Math.hypot(a.x - pointer.x, a.y - pointer.y);
      if (distance < reach && !reducedMotion.matches) {
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(pointer.x, pointer.y);
        context.strokeStyle = `rgba(${rgb},${.24 * (1 - distance / reach)})`; context.stroke();
      }
    }
  }
  function animate(time) {
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
if('IntersectionObserver' in window){new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('nav a').forEach(link=>link.setAttribute('aria-current',String(link.hash==='#'+entry.target.id)));}}},{rootMargin:'-15% 0px -65% 0px'}).observe(sections[0]);const observer=new IntersectionObserver(entries=>{const current=entries.find(e=>e.isIntersecting);if(current)document.querySelectorAll('nav a').forEach(link=>link.setAttribute('aria-current',String(link.hash==='#'+current.target.id)));},{rootMargin:'-15% 0px -65% 0px'});sections.forEach(section=>observer.observe(section));}
