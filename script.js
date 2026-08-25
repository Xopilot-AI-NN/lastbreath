const nav = document.getElementById('nav');
const menuButton = document.getElementById('menuButton');
const toast = document.getElementById('toast');

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
