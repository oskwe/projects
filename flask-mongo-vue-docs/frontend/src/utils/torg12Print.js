const n = (value) => Number.isFinite(Number(value)) ? Number(value) : 0
const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

export const formatTorg12Number = (value, digits = 2) => n(value).toLocaleString('ru-RU', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
})

export const getTorg12LineAmounts = (row = {}) => {
  const amountWithoutVat = row.amount_without_vat ?? n(row.quantity) * n(row.price)
  const vatAmount = row.vat_amount ?? Math.round(n(amountWithoutVat) * n(row.vat_percent) / 100)
  const amountWithVat = row.amount_with_vat ?? n(amountWithoutVat) + n(vatAmount)
  return { amountWithoutVat, vatAmount, amountWithVat }
}

const orgText = (org) => esc([org?.title, org?.address].filter(Boolean).join(', ') || org?.title || '')
const okpo = (org) => esc(org?.OKPO || org?.okpo || '')

const getTotals = (items) => items.reduce((sum, row) => {
  const amounts = getTorg12LineAmounts(row)
  const quantity = n(row.quantity)
  return {
    quantity: sum.quantity + quantity,
    withoutVat: sum.withoutVat + n(amounts.amountWithoutVat),
    vat: sum.vat + n(amounts.vatAmount),
    withVat: sum.withVat + n(amounts.amountWithVat)
  }
}, { quantity: 0, withoutVat: 0, vat: 0, withVat: 0 })

const itemRows = (items) => {
  if (!items.length) {
    return '<tr><td colspan="9" class="empty">Нет товаров</td></tr>'
  }

  return items.map((row, index) => {
    const amounts = getTorg12LineAmounts(row)
    return `<tr>
      <td class="c">${index + 1}</td>
      <td>${esc(row.item?.title || '')}</td>
      <td class="c">${esc(row.unit?.title || '')}</td>
      <td class="r">${formatTorg12Number(row.quantity, 0)}</td>
      <td class="r">${formatTorg12Number(row.price, 2)}</td>
      <td class="r">${formatTorg12Number(amounts.amountWithoutVat, 2)}</td>
      <td class="r">${formatTorg12Number(row.vat_percent, 0)}</td>
      <td class="r">${formatTorg12Number(amounts.vatAmount, 2)}</td>
      <td class="r">${formatTorg12Number(amounts.amountWithVat, 2)}</td>
    </tr>`
  }).join('')
}

export const buildTorg12PrintHtml = (doc = {}) => {
  const items = Array.isArray(doc.items) ? doc.items : []
  const totals = getTotals(items)

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Товарная накладная ${esc(doc.number || '')}</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; color: #000; font-size: 11px; line-height: 1.2; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border: 1px solid #000; padding: 4px 5px; vertical-align: middle; }
    th { font-weight: 700; text-align: center; }
    .sheet { width: 281mm; min-height: 194mm; overflow: hidden; }
    .top-caption { text-align: right; font-size: 10px; line-height: 1.25; margin-bottom: 4px; }
    .code-box { width: 265px; margin-left: auto; margin-bottom: 8px; font-size: 10px; }
    .code-box td { height: 18px; padding: 2px 5px; }
    .org-table { margin-bottom: 7px; }
    .org-table td { height: 22px; }
    .org-label { width: 150px; font-weight: 700; border-right: 0; }
    .org-value { border-left: 0; }
    .okpo-label { width: 75px; text-align: center; font-size: 9px; }
    .okpo-value { width: 95px; }
    .title-row { display: grid; grid-template-columns: 1fr 230px; gap: 12px; align-items: end; margin: 8px 0 10px; }
    .title { text-align: center; font-size: 24px; font-weight: 700; letter-spacing: 0; }
    .doc-table td { text-align: center; height: 24px; }
    .meta-row { display: grid; grid-template-columns: 1fr 320px; gap: 12px; margin-bottom: 8px; }
    .transport td { height: 22px; }
    .items { table-layout: fixed; }
    .items th:nth-child(1), .items td:nth-child(1) { width: 38px; }
    .items th:nth-child(3), .items td:nth-child(3) { width: 70px; }
    .items th:nth-child(4), .items td:nth-child(4) { width: 80px; }
    .items th:nth-child(5), .items td:nth-child(5) { width: 95px; }
    .items th:nth-child(6), .items td:nth-child(6),
    .items th:nth-child(8), .items td:nth-child(8),
    .items th:nth-child(9), .items td:nth-child(9) { width: 115px; }
    .items th:nth-child(7), .items td:nth-child(7) { width: 85px; }
    .items tbody td { height: 28px; }
    .items tfoot td { font-weight: 700; }
    .r { text-align: right; }
    .c { text-align: center; }
    .empty { text-align: center; height: 42px; }
    .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 10px; }
    .line { display: inline-block; border-bottom: 1px solid #000; min-width: 180px; height: 14px; vertical-align: bottom; padding: 0 4px; }
    .line.short { min-width: 90px; }
    .line.long { min-width: 320px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 16px; }
    .sign-table td { border: 0; padding: 2px 4px; vertical-align: bottom; }
    .sign-label { width: 150px; white-space: nowrap; }
    .sign-post { width: 170px; }
    .sign-short { width: 90px; }
    .sign-name { width: 210px; }
    .sign-line { border-bottom: 1px solid #000 !important; height: 18px; }
    .hint-row td { font-size: 9px; text-align: center; padding-top: 0; }
    .stamp-row { display: flex; justify-content: space-between; margin-top: 16px; white-space: nowrap; }
    .stamp-row .line { min-width: 95px; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top-caption">
      Унифицированная форма № ТОРГ-12<br>
      Утверждена постановлением Госкомстата России от 25.12.98 № 132
    </div>

    <table class="code-box">
      <tr><td class="c"><b>Код</b></td></tr>
      <tr><td><span style="display:inline-block;width:150px;">Форма по ОКУД</span><b>0330212</b></td></tr>
      <tr><td><span style="display:inline-block;width:150px;">по ОКПО</span>${okpo(doc.shipper_organization)}</td></tr>
    </table>

    <table class="org-table">
      <tr><td class="org-label">Грузоотправитель</td><td class="org-value">${orgText(doc.shipper_organization)}</td><td class="okpo-label">по ОКПО</td><td class="okpo-value">${okpo(doc.shipper_organization)}</td></tr>
      <tr><td class="org-label">Грузополучатель</td><td class="org-value">${orgText(doc.consignee_organization)}</td><td class="okpo-label">по ОКПО</td><td class="okpo-value">${okpo(doc.consignee_organization)}</td></tr>
      <tr><td class="org-label">Поставщик</td><td class="org-value">${orgText(doc.supplier_organization)}</td><td class="okpo-label">по ОКПО</td><td class="okpo-value">${okpo(doc.supplier_organization)}</td></tr>
      <tr><td class="org-label">Плательщик</td><td class="org-value">${orgText(doc.payer_organization)}</td><td class="okpo-label">по ОКПО</td><td class="okpo-value">${okpo(doc.payer_organization)}</td></tr>
      <tr><td class="org-label">Основание</td><td class="org-value"></td><td class="okpo-label">номер / дата</td><td class="okpo-value"></td></tr>
    </table>

    <div class="title-row">
      <div class="title">ТОВАРНАЯ НАКЛАДНАЯ</div>
      <table class="doc-table">
        <tr><td>Номер документа</td><td>Дата составления</td></tr>
        <tr><td><b>${esc(doc.number || '')}</b></td><td><b>${esc(doc.date || '')}</b></td></tr>
      </table>
    </div>

    <div class="meta-row">
      <div></div>
      <table class="transport">
        <tr><td>Транспортная накладная</td><td class="c">номер</td><td class="c">${esc(doc.transport_invoice?.number || '')}</td></tr>
        <tr><td></td><td class="c">дата</td><td class="c">${esc(doc.transport_invoice?.date || '')}</td></tr>
        <tr><td>Вид операции</td><td colspan="2" class="c">${esc(doc.operation_type || '')}</td></tr>
      </table>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>№</th>
          <th>Товар</th>
          <th>Ед. изм.</th>
          <th>Кол-во</th>
          <th>Цена</th>
          <th>Сумма</th>
          <th>Ставка НДС</th>
          <th>Сумма НДС</th>
          <th>Сумма с НДС</th>
        </tr>
      </thead>
      <tbody>${itemRows(items)}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="r">Итого</td>
          <td class="r">${formatTorg12Number(totals.quantity, 0)}</td>
          <td></td>
          <td class="r">${formatTorg12Number(totals.withoutVat, 2)}</td>
          <td></td>
          <td class="r">${formatTorg12Number(totals.vat, 2)}</td>
          <td class="r">${formatTorg12Number(totals.withVat, 2)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="summary">
      <div>Товарная накладная содержит <span class="line short">${items.length}</span> записей</div>
      <div>Всего количество <span class="line short">${formatTorg12Number(totals.quantity, 0)}</span></div>
      <div>Всего отпущено на сумму <span class="line">${formatTorg12Number(totals.withVat, 2)}</span></div>
    </div>

    <div class="signatures">
      <table class="sign-table">
        <tr>
          <td class="sign-label">Отпуск груза разрешил</td>
          <td class="sign-post sign-line"></td>
          <td class="sign-short sign-line"></td>
          <td class="sign-name sign-line"></td>
        </tr>
        <tr class="hint-row"><td></td><td>(должность)</td><td>(подпись)</td><td>(расшифровка подписи)</td></tr>
        <tr>
          <td class="sign-label">Главный бухгалтер</td>
          <td></td>
          <td class="sign-short sign-line"></td>
          <td class="sign-name sign-line"></td>
        </tr>
        <tr class="hint-row"><td></td><td></td><td>(подпись)</td><td>(расшифровка подписи)</td></tr>
        <tr>
          <td class="sign-label">Отпуск груза произвел</td>
          <td class="sign-post sign-line"></td>
          <td class="sign-short sign-line"></td>
          <td class="sign-name sign-line"></td>
        </tr>
        <tr class="hint-row"><td></td><td>(должность)</td><td>(подпись)</td><td>(расшифровка подписи)</td></tr>
      </table>
      <table class="sign-table">
        <tr>
          <td class="sign-label">Груз принял</td>
          <td class="sign-post sign-line"></td>
          <td class="sign-short sign-line"></td>
          <td class="sign-name sign-line"></td>
        </tr>
        <tr class="hint-row"><td></td><td>(должность)</td><td>(подпись)</td><td>(расшифровка подписи)</td></tr>
        <tr>
          <td class="sign-label">Груз получил</td>
          <td class="sign-post sign-line"></td>
          <td class="sign-short sign-line"></td>
          <td class="sign-name sign-line"></td>
        </tr>
        <tr class="hint-row"><td></td><td>(должность)</td><td>(подпись)</td><td>(расшифровка подписи)</td></tr>
      </table>
    </div>

    <div class="stamp-row">
      <div>М.П. &nbsp; « <span class="line short"></span> » <span class="line short"></span> года</div>
      <div>М.П. &nbsp; « <span class="line short"></span> » <span class="line short"></span> года</div>
    </div>
  </div>
</body>
</html>`
}

export const printTorg12Document = (frame, doc) => {
  if (!frame?.contentDocument || !frame?.contentWindow) return
  frame.contentDocument.open()
  frame.contentDocument.write(buildTorg12PrintHtml(doc))
  frame.contentDocument.close()
  setTimeout(() => frame.contentWindow.print(), 200)
}
