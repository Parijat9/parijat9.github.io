'use strict';
const themeButton=document.querySelector('#theme');
function setTheme(theme){document.documentElement.dataset.theme=theme;themeButton.setAttribute('aria-label',theme==='dark'?'Switch to light theme':'Switch to dark theme');}
try{setTheme(localStorage.getItem('portfolio-theme')==='dark'?'dark':'light');}catch{setTheme('light');}
themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(theme);try{localStorage.setItem('portfolio-theme',theme);}catch{}});
document.querySelectorAll('.project-toggle').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));document.getElementById(button.getAttribute('aria-controls')).hidden=open;button.querySelector('.expand').textContent=open?'+':'−';}));
const sections=[...document.querySelectorAll('main>.section')];
if('IntersectionObserver' in window){new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('nav a').forEach(link=>link.setAttribute('aria-current',String(link.hash==='#'+entry.target.id)));}}},{rootMargin:'-15% 0px -65% 0px'}).observe(sections[0]);const observer=new IntersectionObserver(entries=>{const current=entries.find(e=>e.isIntersecting);if(current)document.querySelectorAll('nav a').forEach(link=>link.setAttribute('aria-current',String(link.hash==='#'+current.target.id)));},{rootMargin:'-15% 0px -65% 0px'});sections.forEach(section=>observer.observe(section));}
