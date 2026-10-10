'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const testsNode = document.getElementById('tests');
  const summary = document.getElementById('summary');

  const validA = { fullName: 'Мясников Никита Сергеевич', recordBookNumber: 'ПИ240215', group: 'ПИ2402' };
  const validB = { fullName: 'Мясников Никита Сергеевич', recordBookNumber: 'ПИ240215', group: 'ПИ2402' };
  const invalidA = { fullName: 'Мясников Никита Сергеевич', recordBookNumber: 'ошибка', group: 'ПИ2402' };
  const invalidB = { fullName: 'Мясников Никита Сергеевич', recordBookNumber: 'ПИ260515', group: 'ПИ2402' };

  const testCases = [
    ['manual-check', 'Успешный ручной тест 1', validA, 200],
    ['manual-check', 'Успешный ручной тест 2', validB, 200],
    ['manual-check', 'Ошибка ручной проверки 1', invalidA, 400],
    ['manual-check', 'Ошибка ручной проверки 2', invalidB, 400],
    ['schema-check', 'Успешный schema-тест 1', validA, 200],
    ['schema-check', 'Успешный schema-тест 2', validB, 200],
    ['schema-check', 'Ошибка schema-проверки 1', invalidA, 400],
    ['schema-check', 'Ошибка schema-проверки 2', invalidB, 400],
    ['no-check', 'Обход проверки no-check 1', invalidA, 200],
    ['no-check', 'Обход проверки no-check 2', invalidB, 200],
    ['no-check', 'Обход проверки no-check 3', invalidA, 200],
  ];

  function statusClass(status, expected) {
    return status === expected ? 'ok' : 'fail';
  }

  function renderCard(test, result = null) {
    const [endpoint, title, body, expected] = test;
    const status = result ? result.status : '...';
    const badge = result ? statusClass(result.status, expected) : 'neutral';
    return `
      <article class="card">
        <h3>${title}</h3>
        <p><span class="badge ${badge}">HTTP ${status}</span> <span class="badge neutral">ожидается ${expected}</span></p>
        <p><strong>POST</strong> /api/lab12/${endpoint}</p>
        <h4>Body</h4>
        <pre>${JSON.stringify(body, null, 2)}</pre>
        <h4>Response</h4>
        <pre>${result ? JSON.stringify(result.data, null, 2) : 'Тест ещё не запускался'}</pre>
      </article>
    `;
  }

  function renderEmpty() {
    testsNode.innerHTML = testCases.map((test) => renderCard(test)).join('');
  }

  async function runTests() {
    const results = [];

    for (const test of testCases) {
      const [endpoint,, body, expected] = test;
      const response = await fetch(`/api/lab12/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      results.push({ test, result: { status: response.status, data }, expected });
    }

    testsNode.innerHTML = results.map(({ test, result }) => renderCard(test, result)).join('');
    const passed = results.filter(({ result, expected }) => result.status === expected).length;
    summary.className = `message ${passed === results.length ? 'success' : 'error'}`;
    summary.textContent = `Выполнено ${passed} из ${results.length} проверок.`;
  }

  document.getElementById('runTests').addEventListener('click', () => {
    runTests().catch((error) => {
      summary.className = 'message error';
      summary.textContent = error.message;
    });
  });

  renderEmpty();
});
