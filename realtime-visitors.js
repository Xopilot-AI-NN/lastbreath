/**
 * Живой счётчик "сейчас на сайте" — без своего сервера.
 *
 * Статический сайт не может сам знать, сколько браузеров держат его
 * открытым прямо сейчас — для этого нужен внешний сервис, который
 * держит соединение и умеет засекать отключение. Здесь для этого
 * используется Firebase Realtime Database (бесплатный план Spark,
 * карта не нужна) — только клиентский код, никакого бэкенда держать
 * не надо.
 *
 * НАСТРОЙКА (один раз, минут 5):
 *  1. console.firebase.google.com → Add project → любое имя, без карты.
 *  2. В проекте: Build → Realtime Database → Create Database →
 *     любой регион → "Start in locked mode" (правила ниже всё равно
 *     их переопределят).
 *  3. Project settings (шестерёнка) → General → внизу "Your apps" →
 *     значок Web ( </> ) → зарегистрировать приложение → скопировать
 *     объект firebaseConfig и вставить его сюда вместо значений ниже.
 *  4. Realtime Database → вкладка Rules → вставить содержимое файла
 *     realtime-rules.json (лежит рядом) → Publish.
 *
 * Пока firebaseConfig не заполнен — блок на сайте просто не появится,
 * ничего не сломается.
 */

const firebaseConfig = {
  apiKey: 'ВСТАВЬ_СЮДА',
  authDomain: 'ВСТАВЬ_СЮДА.firebaseapp.com',
  databaseURL: 'https://ВСТАВЬ_СЮДА-default-rtdb.firebaseio.com',
  projectId: 'ВСТАВЬ_СЮДА',
};

const stat = document.getElementById('visitorStat');
const countEl = document.getElementById('visitorCount');

function formatCount(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = 'человек';
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 >= 2 && mod10 <= 4) word = 'человека';
  }
  return `${n} ${word} на сайте`;
}

async function init() {
  if (!stat || !countEl) return;
  if (Object.values(firebaseConfig).some((v) => v.includes('ВСТАВЬ_СЮДА'))) {
    // Firebase ещё не подключён — блок остаётся скрытым (display:none
    // уже стоит в разметке), никакой ошибки в консоль не кидаем.
    return;
  }

  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js');
    const {
      getDatabase, ref, set, remove, onDisconnect, onValue,
    } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js');

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const sessionId = crypto.randomUUID();
    const myRef = ref(db, `presence/${sessionId}`);

    await set(myRef, true);
    onDisconnect(myRef).remove();
    window.addEventListener('pagehide', () => { remove(myRef); });

    onValue(ref(db, 'presence'), (snapshot) => {
      const count = snapshot.exists() ? snapshot.numChildren() : 0;
      countEl.textContent = formatCount(count);
      stat.style.display = 'flex';
    });
  } catch (err) {
    // Firebase недоступен / неверный конфиг — просто не показываем блок.
    stat.style.display = 'none';
  }
}

init();
