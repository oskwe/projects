// Форма акта оприходования: добавление и удаление позиций, подсказка цены из
// справочника, кладовщик склада и предварительный расчёт сумм.
// Окончательный расчёт всегда выполняет сервер (десятичная арифметика).
(() => {
  const rows = document.querySelector('#work-rows');
  const total = document.querySelector('#id_items-TOTAL_FORMS');
  const catalog = JSON.parse(document.querySelector('#catalog-data').textContent);
  const money = new Intl.NumberFormat('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const qty = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 3});
  const num = value => {
    const parsed = parseFloat(String(value || '').replace(',', '.').replace(/\s/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const field = (row, name) => row.querySelector(`[name$="-${name}"]`);

  function renumber() {
    rows.querySelectorAll('.row-number').forEach((el, i) => { el.textContent = i + 1; });
  }

  function recalc() {
    let sum = 0, count = 0;
    rows.querySelectorAll('.receipt-row').forEach(row => {
      const product = catalog.products[field(row, 'product').value];
      const priceInput = field(row, 'price');
      const price = priceInput.value !== '' ? num(priceInput.value) : num(product && product.price);
      const accepted = Math.round(num(field(row, 'quantity').value) * num(field(row, 'fitness').value) / 100 * 1000) / 1000;
      const rowTotal = Math.round(accepted * price * 100) / 100;
      row.querySelector('.calc-accepted').textContent = qty.format(accepted);
      row.querySelector('.calc-unit').textContent = product ? product.unit : '';
      row.querySelector('.calc-total').textContent = money.format(rowTotal);
      priceInput.placeholder = product ? `из справочника: ${product.price}` : '';
      if (!field(row, 'DELETE').checked) { sum += rowTotal; count += 1; }
    });
    document.querySelector('#grand-total').textContent = money.format(sum);
    document.querySelector('#grand-count').textContent = count;
  }

  document.querySelector('#add-row').addEventListener('click', () => {
    if (+total.value >= 100) { alert('В одном акте допускается до 100 позиций.'); return; }
    rows.insertAdjacentHTML('beforeend', document.querySelector('#empty-row').innerHTML.replaceAll('__prefix__', total.value));
    total.value = +total.value + 1;
    const row = rows.lastElementChild;
    if (window.M) { M.FormSelect.init(row.querySelectorAll('select')); M.updateTextFields(); }
    renumber();
    recalc();
    row.scrollIntoView({behavior: 'smooth', block: 'start'});
  });

  rows.addEventListener('change', event => {
    if (event.target.name && event.target.name.endsWith('-DELETE')) {
      const row = event.target.closest('.receipt-row');
      row.classList.toggle('marked-delete', event.target.checked);
    }
    recalc();
  });
  rows.addEventListener('input', recalc);

  // Кладовщик по умолчанию — материально ответственное лицо выбранного склада.
  const warehouse = document.querySelector('#id_warehouse');
  const storekeeper = document.querySelector('#id_storekeeper');
  warehouse?.addEventListener('change', () => {
    const person = catalog.warehouses[warehouse.value];
    if (person && storekeeper && !storekeeper.value) {
      storekeeper.value = String(person);
      if (window.M) M.FormSelect.init(storekeeper);
    }
  });

  renumber();
  recalc();
})();
