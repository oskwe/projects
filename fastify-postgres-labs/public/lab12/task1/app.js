'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studentForm');
  const clientResult = document.getElementById('clientResult');
  const serverResult = document.getElementById('serverResult');
  const requestPreview = document.getElementById('requestPreview');

  const rules = {
    fullName: /^[А-ЯЁа-яё]+(?:[ -][А-ЯЁа-яё]+)*$/u,
    recordBookNumber: /^(ПИ|ИТ|БИ|ЭС|МХ|ЮФ|ФК)-?2[0-5]0[1-4]\d{1,2}$/u,
    group: /^(ПИ|ИТ|БИ|ЭС|МХ|ЮФ|ФК)-?2[0-5]0[1-4]$/u,
  };

  function formData() {
    const data = Object.fromEntries(new FormData(form).entries());
    return {
      fullName: data.fullName.trim(),
      recordBookNumber: data.recordBookNumber.trim(),
      group: data.group.trim(),
      backendMethod: data.backendMethod,
    };
  }

  function validateClient(data) {
    const errors = [];

    if (!rules.fullName.test(data.fullName)) {
      errors.push('ФИО: только русские буквы, пробелы и дефисы.');
    }

    if (!rules.recordBookNumber.test(data.recordBookNumber)) {
      errors.push('Зачётка: укажите группу и вариант, например ПИ240215.');
    }

    if (!rules.group.test(data.group)) {
      errors.push('Группа: пример ПИ2402 или ПИ-2402, год 20-25, номер 01-04.');
    }

    return errors;
  }

  function renderMessage(node, text, type) {
    node.className = `message ${type}`;
    node.textContent = text;
  }

  function renderRequest(endpoint, body) {
    requestPreview.textContent = JSON.stringify({
      endpoint: `POST /api/lab12/${endpoint}`,
      body,
    }, null, 2);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = formData();
    const body = {
      fullName: data.fullName,
      recordBookNumber: data.recordBookNumber,
      group: data.group,
    };
    const clientErrors = validateClient(data);

    renderRequest(data.backendMethod, body);

    if (clientErrors.length) {
      renderMessage(clientResult, `Клиентская проверка: ${clientErrors.join(' ')}`, 'error');
      renderMessage(serverResult, '', '');
      return;
    }

    renderMessage(clientResult, 'Клиентская проверка пройдена.', 'success');

    try {
      const response = await fetch(`/api/lab12/${data.backendMethod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok) {
        renderMessage(serverResult, JSON.stringify(result, null, 2), 'error');
        return;
      }

      renderMessage(serverResult, JSON.stringify(result, null, 2), 'success');
    } catch (error) {
      renderMessage(serverResult, error.message, 'error');
    }
  });

  document.getElementById('fillInvalid').addEventListener('click', () => {
    form.elements.fullName.value = 'Мясников Никита Сергеевич';
    form.elements.recordBookNumber.value = 'ПИ260715';
    form.elements.group.value = 'ПИ2402';
    form.elements.backendMethod.value = 'manual-check';
    renderMessage(clientResult, '', '');
    renderMessage(serverResult, '', '');
    renderRequest('manual-check', {
      fullName: 'Мясников Никита Сергеевич',
      recordBookNumber: 'ПИ260715',
      group: 'ПИ2402',
    });
  });

  renderRequest('manual-check', {
    fullName: form.elements.fullName.value,
    recordBookNumber: form.elements.recordBookNumber.value,
    group: form.elements.group.value,
  });
});
