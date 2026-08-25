const nav = document.getElementById('nav');
const menuButton = document.getElementById('menuButton');
const toast = document.getElementById('toast');

const DAY = 24 * 60 * 60 * 1000;
const J2000 = Date.UTC(2000, 0, 1, 12);
const PLANETS = [
  { name: 'Меркурий', period: 87.969, longitude: 252.25, radius: 7, size: 18 },
  { name: 'Венера', period: 224.701, longitude: 181.98, radius: 11, size: 24 },
  { name: 'Земля', period: 365.256, longitude: 100.46, radius: 15, size: 27 },
  { name: 'Марс', period: 686.98, longitude: 355.45, radius: 19, size: 22 },
  { name: 'Юпитер', period: 4332.59, longitude: 34.40, radius: 25, size: 48 },
  { name: 'Сатурн', period: 10759.22, longitude: 49.94, radius: 32, size: 42 },
  { name: 'Уран', period: 30688.5, longitude: 313.23, radius: 39, size: 34 },
  { name: 'Нептун', period: 60182, longitude: 304.88, radius: 46, size: 33 }
];
const PLANET_PALETTES = [
  ['#ead7ff', '#9d68e8', '#3b1b73'], ['#f4c6f0', '#c05bb8', '#54145d'],
  ['#d4c8ff', '#7666d7', '#2b2166'], ['#ffd0e4', '#c66a9f', '#521744'],
  ['#d8c7ff', '#8463c3', '#302052'], ['#f3d8ff', '#a66fdd', '#452275'],
  ['#c8d0ff', '#665bb8', '#25204f'], ['#f1c4df', '#aa518a', '#48153d']
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createSpaceScene(scene) {
  scene.replaceChildren();
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 72; index += 1) {
    const star = document.createElement('i');
    star.className = 'star';
    star.style.setProperty('--star-x', `${randomBetween(1, 99)}%`);
    star.style.setProperty('--star-y', `${randomBetween(2, 98)}%`);
    star.style.setProperty('--star-size', `${randomBetween(.7, 2.1).toFixed(1)}px`);
    star.style.setProperty('--star-opacity', randomBetween(.3, .95).toFixed(2));
    star.style.setProperty('--star-speed', `${randomBetween(2.5, 7).toFixed(1)}s`);
    star.style.animationDelay = `-${randomBetween(0, 7).toFixed(1)}s`;
    fragment.append(star);
  }

  const daysSinceJ2000 = (Date.now() - J2000) / DAY;
  PLANETS.forEach((planetData, index) => {
    const planet = document.createElement('i');
    const [light, main, dark] = PLANET_PALETTES[index % PLANET_PALETTES.length];
    const angle = (planetData.longitude + (360 * daysSinceJ2000) / planetData.period) * Math.PI / 180;
    const x = planetData.radius * Math.cos(angle);
    const y = planetData.radius * Math.sin(angle) * .38;
    const texture = [
      `radial-gradient(circle at ${randomBetween(16, 82).toFixed(0)}% ${randomBetween(18, 82).toFixed(0)}%, rgba(34, 9, 72, .55) 0 3%, transparent 4%)`,
      `radial-gradient(circle at ${randomBetween(16, 82).toFixed(0)}% ${randomBetween(18, 82).toFixed(0)}%, rgba(34, 9, 72, .45) 0 5%, transparent 6%)`,
      `radial-gradient(ellipse at ${randomBetween(20, 75).toFixed(0)}% ${randomBetween(25, 75).toFixed(0)}%, transparent 0 13%, rgba(34, 9, 72, .4) 14% 17%, transparent 18%)`,
      `repeating-linear-gradient(${randomBetween(0, 180).toFixed(0)}deg, transparent 0 12%, rgba(255,255,255,.18) 13% 16%, transparent 17% 28%)`
    ].join(',');
    planet.className = 'planet';
    planet.setAttribute('title', planetData.name);
    planet.dataset.period = String(planetData.period);
    planet.dataset.longitude = String(planetData.longitude);
    planet.dataset.radius = String(planetData.radius);
    planet.style.left = `calc(50% + ${x.toFixed(3)}vw)`;
    planet.style.top = `calc(50% + ${y.toFixed(3)}vw)`;
    planet.style.setProperty('--planet-size', `${planetData.size}px`);
    planet.style.setProperty('--planet-light', light);
    planet.style.setProperty('--planet-main', main);
    planet.style.setProperty('--planet-dark', dark);
    planet.style.setProperty('--planet-texture', texture);
    planet.style.setProperty('--planet-glow', `${main}66`);
    planet.style.setProperty('--planet-opacity', randomBetween(.55, .82).toFixed(2));
    planet.style.setProperty('--ring-angle', `${randomBetween(-35, 35).toFixed(0)}deg`);
    planet.style.setProperty('--ring-opacity', planetData.name === 'Сатурн' ? '.8' : '0');
    fragment.append(planet);
  });

  scene.append(fragment);
}

function updatePlanetPositions(scene) {
  const daysSinceJ2000 = (Date.now() - J2000) / DAY;
  scene.querySelectorAll('.planet').forEach((planet) => {
    const angle = (Number(planet.dataset.longitude) + (360 * daysSinceJ2000) / Number(planet.dataset.period)) * Math.PI / 180;
    const radius = Number(planet.dataset.radius);
    planet.style.left = `calc(50% + ${(radius * Math.cos(angle)).toFixed(3)}vw)`;
    planet.style.top = `calc(50% + ${(radius * Math.sin(angle) * .38).toFixed(3)}vw)`;
  });
}

document.querySelectorAll('.space-scene').forEach((scene) => {
  createSpaceScene(scene);
  setInterval(() => updatePlanetPositions(scene), 60 * 1000);
});

menuButton?.addEventListener('click', () => {
  nav.classList.toggle('open');
});

nav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => nav.classList.remove('open'));
});

document.querySelectorAll('.copy-btn').forEach(button => {
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement('input');
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }

    toast.textContent = `Скопировано: ${value}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  });
});

/* ---------- server status widget ---------- */
/* источник: публичный API mcsrvstat.us, без ключа, кэш ~5 минут на их стороне */
const STATUS_HOST = 'mc.lastbreathfun.ru';
const STATUS_API = `https://api.mcsrvstat.us/3/${STATUS_HOST}`;

function renderFullStatus(data) {
  const dot = document.getElementById('statusDot');
  if (!dot) return;

  const title = document.getElementById('statusTitle');
  const sub = document.getElementById('statusSub');
  const players = document.getElementById('statPlayers');
  const version = document.getElementById('statVersion');
  const motd = document.getElementById('statusMotd');

  if (data && data.online) {
    dot.className = 'status-dot on';
    title.textContent = 'Сервер онлайн';
    if (players) players.textContent = `${data.players?.online ?? 0} / ${data.players?.max ?? '—'}`;
    if (version) version.textContent = data.version || '—';
    if (motd) {
      const line = data.motd?.clean?.[0];
      motd.textContent = line || '';
      motd.style.display = line ? 'block' : 'none';
    }
  } else {
    dot.className = 'status-dot off';
    title.textContent = 'Сервер оффлайн';
    if (players) players.textContent = '—';
    if (version) version.textContent = '—';
    if (motd) motd.style.display = 'none';
  }
  if (sub) sub.textContent = STATUS_HOST;
}

function renderMiniStatus(data) {
  const dot = document.getElementById('miniDot');
  const label = document.getElementById('miniLabel');
  if (!dot) return;

  if (data && data.online) {
    dot.className = 'status-dot on';
    if (label) label.textContent = `онлайн • ${data.players?.online ?? 0}/${data.players?.max ?? '—'} игроков`;
  } else {
    dot.className = 'status-dot off';
    if (label) label.textContent = 'оффлайн';
  }
}

async function loadStatus() {
  const full = document.getElementById('statusDot');
  const mini = document.getElementById('miniDot');
  if (!full && !mini) return;

  const refreshBtn = document.getElementById('statusRefresh');
  if (refreshBtn) refreshBtn.textContent = 'Обновление…';

  try {
    const res = await fetch(STATUS_API, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('request failed');
    const data = await res.json();
    renderFullStatus(data);
    renderMiniStatus(data);
  } catch {
    renderFullStatus(null);
    renderMiniStatus(null);
  } finally {
    if (refreshBtn) refreshBtn.textContent = 'Обновить';
  }
}

loadStatus();
setInterval(loadStatus, 60000);
document.getElementById('statusRefresh')?.addEventListener('click', loadStatus);

/* Живой счётчик "сейчас на сайте" вынесен в отдельный модуль —
   realtime-visitors.js (использует Firebase Realtime Database, без
   своего сервера). Настройка описана в README.md. */

/* ---------- scroll reveal ---------- */
/* .reveal элементы (карточки режимов, feature-card, крупные текстовые блоки)
   плавно проявляются при попадании во вьюпорт. threshold:0 — срабатывает от
   первого пикселя пересечения, это важно для очень высоких блоков (например
   весь текст правил): при высоком threshold соотношение "видимая часть /
   общая высота" элемента может никогда не набрать нужный процент, и блок
   остаётся невидимым навсегда — так и было раньше. Плюс страховочный таймаут:
   если по любой причине observer не сработал, через 2.5s всё равно показываем
   контент, чтобы страница не могла "потерять" текст. */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const showAll = () => targets.forEach(el => el.classList.add('in-view'));

  if (!('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10px 0px' });

  targets.forEach(el => io.observe(el));
  setTimeout(showAll, 2500);
})();
