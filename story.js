'use strict';
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 851px)');
  const steps = [...document.querySelectorAll('.story-step')];
  const screen = document.querySelector('.story-screen');
  const panels = steps.map(step => {
    const panel = step.querySelector('.story-visual').cloneNode(true);
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    screen.append(panel);
    return panel;
  });
  const jumps = [...document.querySelectorAll('.project-jumps a')];
  const work = document.querySelector('.work-story');
  const caption = document.querySelector('.work-caption');
  const career = document.querySelector('#experience');
  const captions = ['Bring the records together.', 'Check the numbers that need attention.', 'Give the team a report they can use.'];
  const clamp = x => Math.max(0, Math.min(1, x));
  let pending = false;
  function update() {
    pending = false;
    const animated = desktop.matches && !reduced.matches;
    root.classList.toggle('story-ready', animated);
    root.style.setProperty('--network-opacity', String(.72 * (1 - clamp(scrollY / innerHeight))));
    const wr = work.getBoundingClientRect();
    const fraction = clamp(-wr.top / Math.max(1, wr.height - innerHeight));
    const phase = Math.min(2, Math.floor(fraction * 3));
    work.dataset.phase = String(phase);
    caption.textContent = captions[phase];
    let active = 0;
    steps.forEach((step, i) => {if (step.getBoundingClientRect().top < innerHeight * .5) active = i;});
    panels.forEach((panel, i) => {
      const visible = animated && i === active;
      panel.classList.toggle('active', visible);
      panel.inert = !visible;
      panel.setAttribute('aria-hidden', String(!visible));
    });
    jumps.forEach((a, i) => {if (i === active) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');});
    const cr = career.getBoundingClientRect();
    career.style.setProperty('--career-progress', clamp((innerHeight * .7 - cr.top) / cr.height));
    career.querySelectorAll('.job').forEach(job => job.classList.toggle('in-view', job.getBoundingClientRect().top < innerHeight * .7));
  }
  function schedule() {if (!pending) {pending = true; requestAnimationFrame(update);}}
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', update);
  desktop.addEventListener('change', update);
  update();
  // A small pointer response on circular controls; native scrolling stays intact.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.about-circle, .contact-circle').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (reduced.matches || !finePointer.matches) return;
      const box = button.getBoundingClientRect();
      const x = (event.clientX - box.left - box.width / 2) * .12;
      const y = (event.clientY - box.top - box.height / 2) * .12;
      button.style.transform = `translate(${x}px,${y}px)`;
    });
    const reset = () => {button.style.transform = '';};
    button.addEventListener('pointerleave', reset);
    button.addEventListener('blur', reset);
    reduced.addEventListener('change', reset);
  });
})();
