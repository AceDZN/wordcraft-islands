import './campaign.css';

export type CampaignMapLevel = {
  id: string;
  number: number;
  title: string;
  chapter: string | number;
};
export type CampaignMapOptions = {
  levels: readonly CampaignMapLevel[];
  completed: Set<string>;
  currentId: string;
  unlockedThrough: number;
  /** Explicit lesson entry/earned continuation; never unlocks the preceding prefix. */
  availableIds?: ReadonlySet<string>;
  onChoose: (id: string) => void;
  onClose: () => void;
};

/** Optional scene colors only; the content engine still owns each puzzle's semantics. */
export const CAMPAIGN_WORLD_PALETTES = [
  {water: 0x31acb6, grass: 0x90ad55, stone: 0xccaa77, accent: 0xcb614a},
  {water: 0x3aabb5, grass: 0x83a660, stone: 0xc4ab86, accent: 0xcb614a},
  {water: 0x429fba, grass: 0x7da373, stone: 0xc3ad91, accent: 0xcb614a},
  {water: 0x469caa, grass: 0x8b9b60, stone: 0xc7a67b, accent: 0xcb614a},
  {water: 0x46a8b1, grass: 0x86a56b, stone: 0xcbb38d, accent: 0xcb614a},
] as const;

let mapSequence = 0;
function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const node = document.createElement(tag); node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function stateIcon(kind: 'check' | 'lock') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', kind === 'check' ? 'M4 10.5 8 14.5 16 5.5' : 'M6 9V6a4 4 0 0 1 8 0v3M4.5 9.5h11v8h-11zM10 12.5v2');
  path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.8'); path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round');
  svg.append(path); return svg;
}

export function mountCampaignMap(container: HTMLElement, options: CampaignMapOptions): void {
  const levels = [...options.levels].sort((a, b) => a.number - b.number);
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
  const token = `campaign-map-${++mapSequence}`;
  const canChoose = (level: CampaignMapLevel) => level.number <= options.unlockedThrough || options.completed.has(level.id) || !!options.availableIds?.has(level.id);
  const current = levels.find(level => level.id === options.currentId && canChoose(level));
  const available = levels.filter(canChoose);
  const resume = current ?? available.at(-1);
  const completedCount = levels.filter(level => options.completed.has(level.id)).length;
  const root = element('div', 'campaign-map'); root.dir = 'rtl'; root.tabIndex = -1;
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', `${token}-title`); root.setAttribute('aria-describedby', `${token}-help ${token}-keys`);
  const sheet = element('div', 'campaign-map__sheet');
  const heading = element('div', 'campaign-map__heading');
  const brand = element('div', 'campaign-map__brand', 'WORDCRAFT ISLANDS'); brand.dir = 'ltr';
  const title = element('h2', 'campaign-map__title', 'מסע האיים'); title.id = `${token}-title`;
  const help = element('p', 'campaign-map__help', `${levels.length} איים. כל פתרון פותח את הבא.`); help.id = `${token}-help`;
  const close = element('button', 'campaign-map__close', '×'); close.type = 'button'; close.setAttribute('aria-label', 'סגירת מפת האיים');
  let closing = false;
  function requestClose() {
    if (closing) return; closing = true; options.onClose();
    queueMicrotask(() => { if (previousFocus?.isConnected && (document.activeElement === document.body || root.contains(document.activeElement))) previousFocus.focus(); });
  }
  close.addEventListener('click', requestClose);
  const status = element('div', 'campaign-map__progress-line');
  const statusText = element('span', 'campaign-map__progress-text', `${completedCount} מתוך ${levels.length} איים הושלמו`);
  const progress = element('progress', 'campaign-map__progress'); progress.max = Math.max(1, levels.length); progress.value = completedCount;
  progress.setAttribute('aria-label', 'התקדמות במסע האיים');
  status.append(statusText, progress); heading.append(brand, title, help, close, status);
  const chart = element('div', 'campaign-map__chart'); chart.setAttribute('aria-label', 'איים לפי פרקים');
  const enabledNodes: HTMLButtonElement[] = [];
  let currentNode: HTMLButtonElement | undefined;
  for (let chapterIndex = 0; chapterIndex < 5; chapterIndex++) {
    const chapterLevels = levels.filter(level => Math.floor((level.number - 1) / 10) === chapterIndex);
    if (!chapterLevels.length) continue;
    const section = element('section', 'campaign-map__chapter'); section.dataset.chapter = String(chapterIndex + 1);
    const chapterHeading = element('div', 'campaign-map__chapter-heading');
    const chapterNumber = element('span', 'campaign-map__chapter-number', `פרק ${chapterIndex + 1}`);
    const suppliedName = chapterLevels[0].chapter;
    const chapterName = element('h3', 'campaign-map__chapter-name', typeof suppliedName === 'string' && !/^\d+$/.test(suppliedName) ? suppliedName : '');
    chapterName.dir = 'auto'; chapterName.id = `${token}-chapter-${chapterIndex + 1}`;
    if (!chapterName.textContent) chapterName.textContent = `איים ${chapterLevels[0].number}–${chapterLevels.at(-1)!.number}`;
    const chapterDone = chapterLevels.filter(level => options.completed.has(level.id)).length;
    const chapterProgress = element('span', 'campaign-map__chapter-progress', `${chapterDone}/${chapterLevels.length}`); chapterProgress.dir = 'ltr';
    chapterProgress.setAttribute('aria-label', `${chapterDone} מתוך ${chapterLevels.length} איים הושלמו בפרק`);
    chapterHeading.append(chapterNumber, chapterName, chapterProgress);
    const grid = element('div', 'campaign-map__grid'); grid.setAttribute('role', 'group'); grid.setAttribute('aria-labelledby', chapterName.id);
    for (const level of chapterLevels) {
      const complete = options.completed.has(level.id), locked = !canChoose(level), isCurrent = level.id === options.currentId;
      const state = locked ? 'locked' : isCurrent ? 'current' : complete ? 'completed' : 'available';
      const node = element('button', 'campaign-map__node'); node.type = 'button'; node.disabled = locked; node.tabIndex = -1;
      node.dataset.state = state; node.dataset.number = String(level.number); node.dataset.levelId = level.id;
      const description = locked ? 'נעול' : isCurrent ? `האי הנוכחי${complete ? ', הושלם' : ', פתוח'}` : complete ? 'הושלם, אפשר לשחק שוב' : 'פתוח';
      node.setAttribute('aria-label', `אי ${level.number}: ${level.title}. ${description}`); node.title = `${level.number} · ${level.title} — ${description}`;
      if (isCurrent && !locked) node.setAttribute('aria-current', 'step');
      const seal = element('span', 'campaign-map__seal');
      const number = element('span', 'campaign-map__number', String(level.number)); number.dir = 'ltr'; seal.append(number);
      if (locked || complete) { const icon = element('span', 'campaign-map__state-icon'); icon.append(stateIcon(locked ? 'lock' : 'check')); seal.append(icon); }
      if (isCurrent && !locked) seal.append(element('span', 'campaign-map__here', 'כאן'));
      const name = element('span', 'campaign-map__level-title', level.title); name.dir = 'ltr';
      node.append(seal, name); grid.append(node);
      if (!locked) {
        enabledNodes.push(node); if (level.id === resume?.id) currentNode = node;
        node.addEventListener('click', () => options.onChoose(level.id));
        node.addEventListener('focus', () => { for (const button of enabledNodes) button.tabIndex = button === node ? 0 : -1; });
      }
    }
    section.append(chapterHeading, grid); chart.append(section);
  }
  const footer = element('div', 'campaign-map__footer');
  const resumeButton = element('button', 'campaign-map__resume'); resumeButton.type = 'button'; resumeButton.disabled = !resume;
  resumeButton.append(element('span', 'campaign-map__resume-label', resume ? `${options.completed.has(resume.id) ? 'לחזור' : 'להמשיך'} לאי ${resume.number} ←` : 'עדיין אין אי פתוח'));
  if (resume) { const name = element('span', 'campaign-map__resume-title', resume.title); name.dir = 'ltr'; resumeButton.append(name); resumeButton.addEventListener('click', () => options.onChoose(resume.id)); }
  const legend = element('div', 'campaign-map__legend'); legend.setAttribute('aria-label', 'מקרא מצבי האיים');
  for (const [state, label] of [['current', 'כאן'], ['completed', 'הושלם'], ['available', 'פתוח'], ['locked', 'נעול']]) {
    const entry = element('span', 'campaign-map__legend-entry'); entry.dataset.state = state;
    const marker = element('i', 'campaign-map__legend-marker'); marker.setAttribute('aria-hidden', 'true');
    if (state === 'completed' || state === 'locked') marker.append(stateIcon(state === 'completed' ? 'check' : 'lock'));
    entry.append(marker, document.createTextNode(label)); legend.append(entry);
  }
  const keyboardHelp = element('span', 'campaign-map__sr-only', 'חצים למעבר בין איים פתוחים. Enter לבחירה. Escape לסגירה.'); keyboardHelp.id = `${token}-keys`;
  footer.append(resumeButton, legend, keyboardHelp); sheet.append(heading, chart, footer); root.append(sheet); container.replaceChildren(root);
  const initialNode = currentNode ?? enabledNodes[0]; if (initialNode) initialNode.tabIndex = 0;
  root.addEventListener('click', event => { if (event.target === root) requestClose(); });
  root.addEventListener('keydown', event => {
    event.stopPropagation(); // A map keystroke must never move the world behind it.
    if (event.key === 'Escape') { event.preventDefault(); requestClose(); return; }
    if (event.key === 'Tab') {
      const focusable = [...root.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')].filter(button => button.tabIndex >= 0);
      const first = focusable[0], last = focusable.at(-1);
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === root)) { event.preventDefault(); first.focus(); }
      return;
    }
    const index = enabledNodes.indexOf(document.activeElement as HTMLButtonElement); if (index < 0) return;
    const grid = enabledNodes[index].closest<HTMLElement>('.campaign-map__grid');
    const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 5;
    const offset = ({ArrowRight: 1, ArrowLeft: -1} as Record<string, number>)[event.key];
    let next = event.key === 'Home' ? 0 : event.key === 'End' ? enabledNodes.length - 1 : offset === undefined ? index : Math.max(0, Math.min(enabledNodes.length - 1, index + offset));
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const number = Number(enabledNodes[index].dataset.number), direction = event.key === 'ArrowDown' ? 1 : -1;
      const candidates = enabledNodes.map((button, position) => ({number: Number(button.dataset.number), position})).filter(candidate => (candidate.number - number) * direction > 0 && (candidate.number - number) % columns === 0).sort((a, b) => Math.abs(a.number - number) - Math.abs(b.number - number));
      next = candidates[0]?.position ?? index;
    }
    if (offset !== undefined || ['Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); enabledNodes[next]?.focus(); }
  });
  requestAnimationFrame(() => {
    if (!root.isConnected) return;
    if (initialNode) { initialNode.scrollIntoView({block: 'nearest'}); initialNode.focus({preventScroll: true}); }
    else close.focus();
  });
}
