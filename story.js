'use strict';
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 851px) and (min-height: 700px)');
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
  const jobs = [...career.querySelectorAll('.job')];
  const navLinks = [...document.querySelectorAll('header nav a')];
  const navSections = navLinks.map(link => document.querySelector(link.hash));
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let previousPhase = -1, previousActive = -1, previousAnimated;

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
    let active = 0;
    steps.forEach((step, i) => {if (step.getBoundingClientRect().top < innerHeight * .5) active = i;});
    if (active !== previousActive || animated !== previousAnimated) {
    panels.forEach((panel, i) => {
      const visible = animated && i === active;
      panel.classList.toggle('active', visible);
      panel.inert = !visible;
      panel.setAttribute('aria-hidden', String(!visible));
    });
    jumps.forEach((a, i) => {if (i === active) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');});
    previousActive = active; previousAnimated = animated;
    }
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
  // Transform the visual inside a fixed hit area so pointer bounds stay stable.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const resetButtons = [];
  document.querySelectorAll('.about-circle, .contact-circle').forEach(button => {
    const face = document.createElement('span');
    face.className = 'magnetic-face';
    face.append(...button.childNodes);
    button.append(face);
    const reset = () => {face.style.transform = '';};
    resetButtons.push(reset);
    button.addEventListener('pointermove', event => {
      if (reduced.matches || !finePointer.matches || root.classList.contains('motion-paused')) return;
      const box = button.getBoundingClientRect();
      const x = (event.clientX - box.left - box.width / 2) * .15;
      const y = (event.clientY - box.top - box.height / 2) * .15;
      face.style.transform = `translate(${x}px,${y}px)`;
    });
    button.addEventListener('pointerleave', reset);
    button.addEventListener('blur', reset);
    reduced.addEventListener('change', reset);
    finePointer.addEventListener('change', reset);
  });
  const motionButton = document.querySelector('.motion-toggle');
  motionButton.addEventListener('click', () => {
    const paused = root.classList.toggle('motion-paused');
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    resetButtons.forEach(reset => reset());
    document.dispatchEvent(new Event('portfolio-motion-change'));
  });
})();
