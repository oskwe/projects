'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'lab12RegexHistory';
  const form = document.getElementById('regexForm');
  const currentResult = document.getElementById('currentResult');
  const historyNode = document.getElementById('history');

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveHistory(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char]));
  }

  function renderHistory() {
    const history = loadHistory();

    if (!history.length) {
      historyNode.innerHTML = '<p class="muted">История пока пустая.</p>';
      return;
    }

    historyNode.innerHTML = history.map((item) => `
      <article class="history-item ${item.matches.length ? 'success' : 'error'}">
        <h3>${item.matches.length ? 'Соответствует' : 'Не соответствует'}</h3>
        <p class="muted">${escapeHtml(item.createdAt)}</p>
        <p><strong>RegExp:</strong> <code>/${escapeHtml(item.pattern)}/${escapeHtml(item.flags)}</code></p>
        <p><strong>Строка:</strong> ${escapeHtml(item.text)}</p>
        <div class="matches"><strong>Совпадения:</strong> ${item.matches.length ? item.matches.map(escapeHtml).join(', ') : 'нет'}</div>
      </article>
    `).join('');
  }

  function getMatches(regexp, text) {
    const flags = regexp.flags.includes('g') ? regexp.flags : `${regexp.flags}g`;
    const globalRegexp = new RegExp(regexp.source, flags);
    return [...text.matchAll(globalRegexp)].map((match) => match[0]).filter(Boolean);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const pattern = data.pattern.trim();
    const flags = data.flags.trim();
    const text = data.text;

    try {
      const regexp = new RegExp(pattern, flags);
      const matches = getMatches(regexp, text);
      const item = {
        pattern,
        flags,
        text,
        matches,
        createdAt: new Date().toLocaleString('ru-RU'),
      };
      const history = loadHistory();
      history.unshift(item);
      saveHistory(history);

      currentResult.className = `message ${matches.length ? 'success' : 'error'}`;
      currentResult.textContent = matches.length
        ? `Соответствует. Найдено совпадений: ${matches.join(', ')}`
        : 'Не соответствует.';
      renderHistory();
    } catch (error) {
      currentResult.className = 'message error';
      currentResult.textContent = `Ошибка в регулярном выражении: ${error.message}`;
    }
  });

  document.getElementById('clearHistory').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    currentResult.className = 'message';
    currentResult.textContent = '';
    renderHistory();
  });

  renderHistory();
});
