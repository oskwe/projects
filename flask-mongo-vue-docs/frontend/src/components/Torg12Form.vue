<template>
  <div class="modal-mask" v-if="visible" @click.self="$emit('cancel')">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ editing ? 'Редактирование' : 'Добавление' }} товарной накладной</h3>
          <button class="modal-close" @click="$emit('cancel')">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-grid">
              <div class="form-group">
                <label>Номер документа</label>
                <input type="text" class="form-control" v-model="form.number" required>
              </div>
              <div class="form-group">
                <label>Дата составления</label>
                <input type="date" class="form-control" v-model="form.date" required>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Грузоотправитель</label>
                <select class="form-select" v-model="form.shipper_organization" required>
                  <option v-for="org in organizations" :key="org._id" :value="org._id">{{ org.title }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Грузополучатель</label>
                <select class="form-select" v-model="form.consignee_organization" required>
                  <option v-for="org in organizations" :key="org._id" :value="org._id">{{ org.title }}</option>
                </select>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Поставщик</label>
                <select class="form-select" v-model="form.supplier_organization" required>
                  <option v-for="org in organizations" :key="org._id" :value="org._id">{{ org.title }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Плательщик</label>
                <select class="form-select" v-model="form.payer_organization" required>
                  <option v-for="org in organizations" :key="org._id" :value="org._id">{{ org.title }}</option>
                </select>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group full-width">
                <label>Вид операции</label>
                <input type="text" class="form-control" v-model="form.operation_type" required>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Транспортная накладная номер</label>
                <input type="text" class="form-control" v-model="form.transport_invoice.number">
              </div>
              <div class="form-group">
                <label>Транспортная накладная дата</label>
                <input type="date" class="form-control" v-model="form.transport_invoice.date">
              </div>
            </div>

            <h4>Табличная часть</h4>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
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
                <tbody>
                  <tr v-for="(row, index) in form.items" :key="index">
                    <td>
                      <select class="form-select" v-model="row.item" @change="onItemChange(row)" required>
                        <option :value="null" disabled>Выберите товар</option>
                        <option v-for="item in items" :key="item._id" :value="item._id">{{ item.title }}</option>
                      </select>
                    </td>
                    <td>
                      <select class="form-select" v-model="row.unit" required>
                        <option :value="null" disabled>Выберите единицу</option>
                        <option v-for="unit in units" :key="unit._id" :value="unit._id">{{ unit.title }}</option>
                      </select>
                    </td>
                    <td><input type="number" min="1" step="1" class="form-control" v-model.number="row.quantity" @input="syncServiceFields(row)" required></td>
                    <td><input type="number" min="1" step="1" class="form-control" v-model.number="row.price" required></td>
                    <td class="amount-cell">{{ money(amountWithoutVat(row)) }}</td>
                    <td><input type="number" min="0" step="1" class="form-control" v-model.number="row.vat_percent" required></td>
                    <td class="amount-cell">{{ money(vatAmount(row)) }}</td>
                    <td class="amount-cell">{{ money(amountWithVat(row)) }}</td>
                    <td><button type="button" class="btn btn-sm btn-danger" @click="removeRow(index)">x</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button type="button" class="btn btn-sm btn-primary" @click="addRow">Добавить строку</button>

            <div class="totals-panel">
              <div>Итого без НДС: <b>{{ money(totalWithoutVat) }}</b></div>
              <div>НДС: <b>{{ money(totalVat) }}</b></div>
              <div>Итого с НДС: <b>{{ money(totalWithVat) }}</b></div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Отмена</button>
              <button type="submit" class="btn btn-primary">{{ editing ? 'Обновить' : 'Сохранить' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['submit', 'cancel'],
  props: {
    visible: Boolean,
    initialData: Object,
    organizations: Array,
    items: Array,
    units: Array,
    packageTypes: Array
  },
  data() {
    return {
      form: this.getEmpty()
    }
  },
  computed: {
    editing() {
      return this.initialData !== null
    },
    totalWithoutVat() {
      return this.form.items.reduce((sum, row) => sum + this.amountWithoutVat(row), 0)
    },
    totalVat() {
      return this.form.items.reduce((sum, row) => sum + this.vatAmount(row), 0)
    },
    totalWithVat() {
      return this.form.items.reduce((sum, row) => sum + this.amountWithVat(row), 0)
    }
  },
  watch: {
    initialData: {
      immediate: true,
      handler(v) {
        if (!v) {
          this.form = this.getEmpty()
          this.ensureAtLeastOneRow()
          return
        }
        this.form = {
          _id: v._id,
          number: v.number,
          date: v.date,
          shipper_organization: v.shipper_organization?._id || v.shipper_organization,
          consignee_organization: v.consignee_organization?._id || v.consignee_organization,
          supplier_organization: v.supplier_organization?._id || v.supplier_organization,
          payer_organization: v.payer_organization?._id || v.payer_organization,
          operation_type: v.operation_type,
          transport_invoice: {
            number: v.transport_invoice?.number || '',
            date: v.transport_invoice?.date || ''
          },
          items: (v.items || []).map((row) => ({
            item: row.item?._id || row.item,
            unit: row.unit?._id || row.unit,
            package_type: row.package_type?._id || row.package_type,
            quantity: row.quantity,
            places: row.places,
            gross_weight: row.gross_weight,
            net_weight: row.net_weight,
            price: row.price,
            vat_percent: row.vat_percent
          })).map((row) => this.normalizeRow(row))
        }
        this.ensureAtLeastOneRow()
      }
    },
    visible(newValue) {
      if (newValue) {
        this.ensureAtLeastOneRow()
      }
    }
  },
  methods: {
    getEmpty() {
      return {
        number: '',
        date: '',
        shipper_organization: null,
        consignee_organization: null,
        supplier_organization: null,
        payer_organization: null,
        operation_type: 'Продажа',
        transport_invoice: { number: '', date: '' },
        items: []
      }
    },
    toNumber(value, fallback = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : fallback
    },
    money(value) {
      return this.toNumber(value).toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    defaultPackageTypeId() {
      return this.packageTypes?.[0]?._id || null
    },
    defaultUnitId() {
      return this.units?.[0]?._id || null
    },
    defaultItemId() {
      return this.items?.[0]?._id || null
    },
    itemTitle(itemId) {
      return this.items.find((item) => item._id === itemId)?.title || ''
    },
    defaultPriceForItem(itemId) {
      return /ноутбук|notebook|laptop/i.test(this.itemTitle(itemId)) ? 85000 : 1000
    },
    normalizeRow(row = {}) {
      const item = row.item || this.defaultItemId()
      let quantity = Math.max(1, Math.round(this.toNumber(row.quantity, 1)))
      let price = Math.max(1, Math.round(this.toNumber(row.price, this.defaultPriceForItem(item))))

      if (quantity > 50 && price <= 1) {
        quantity = 1
        price = this.defaultPriceForItem(item)
      } else if (price <= 1) {
        price = this.defaultPriceForItem(item)
      }

      return {
        item,
        unit: row.unit || this.defaultUnitId(),
        package_type: row.package_type || this.defaultPackageTypeId(),
        quantity,
        places: 1,
        gross_weight: quantity,
        net_weight: quantity,
        price,
        vat_percent: Math.max(0, Math.round(this.toNumber(row.vat_percent, 20)))
      }
    },
    syncServiceFields(row) {
      const quantity = Math.max(1, Math.round(this.toNumber(row.quantity, 1)))
      row.quantity = quantity
      row.places = 1
      row.gross_weight = quantity
      row.net_weight = quantity
      row.package_type = row.package_type || this.defaultPackageTypeId()
    },
    onItemChange(row) {
      if (this.toNumber(row.price) <= 1) {
        row.price = this.defaultPriceForItem(row.item)
      }
      this.syncServiceFields(row)
    },
    amountWithoutVat(row) {
      return this.toNumber(row.quantity) * this.toNumber(row.price)
    },
    vatAmount(row) {
      return Math.round(this.amountWithoutVat(row) * this.toNumber(row.vat_percent) / 100)
    },
    amountWithVat(row) {
      return this.amountWithoutVat(row) + this.vatAmount(row)
    },
    addRow() {
      this.form.items.push(this.normalizeRow({
        item: this.defaultItemId(),
        unit: this.defaultUnitId(),
        package_type: this.defaultPackageTypeId(),
        quantity: 1,
        price: this.defaultPriceForItem(this.defaultItemId()),
        vat_percent: 20
      }))
    },
    ensureAtLeastOneRow() {
      if (!Array.isArray(this.form.items)) {
        this.form.items = []
      }
      if (this.form.items.length === 0) {
        this.addRow()
      }
    },
    removeRow(index) {
      this.form.items.splice(index, 1)
      this.ensureAtLeastOneRow()
    },
    handleSubmit() {
      const payload = {
        ...this.form,
        items: this.form.items.map((row) => {
          const normalized = this.normalizeRow(row)
          return {
            ...normalized,
            amount_without_vat: this.amountWithoutVat(normalized),
            vat_amount: this.vatAmount(normalized),
            amount_with_vat: this.amountWithVat(normalized)
          }
        })
      }
      this.$emit('submit', payload)
    }
  }
}
</script>

<style scoped>
.modal-mask { position: fixed; z-index: 9998; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; }
.modal-wrapper { width: 95%; max-width: 1300px; }
.modal-container { background: #fff; border-radius: 8px; max-height: 90vh; overflow-y: auto; }
.modal-header, .modal-footer { padding: 15px 20px; border-bottom: 1px solid #eee; }
.modal-footer { border-bottom: 0; border-top: 1px solid #eee; display: flex; justify-content: end; gap: 10px; }
.modal-body { padding: 20px; }
.modal-close { border: 0; background: transparent; font-size: 24px; float: right; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 16px; }
.full-width { grid-column: 1 / -1; }
.amount-cell { text-align: right; white-space: nowrap; font-weight: 600; }
.totals-panel { display: flex; justify-content: flex-end; gap: 24px; padding: 12px 0; border-top: 1px solid #eee; flex-wrap: wrap; }
</style>
