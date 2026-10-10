<template>
  <div v-if="doc" class="torg12-detail">
    <div class="header">
      <h2>Документ № {{ doc.number }}</h2>
      <div class="header-buttons">
        <button class="btn btn-primary me-2" @click="openEdit">Редактировать</button>
        <button class="btn btn-warning me-2" @click="printDoc">Печать</button>
        <button class="btn btn-danger me-2" @click="handleDelete">Удалить</button>
        <router-link class="btn btn-secondary" to="/torg12">Назад к списку</router-link>
      </div>
    </div>

    <div class="torg12-content">
      <div class="torg12-info">
        <div class="info-row">
          <span class="info-label">Номер:</span>
          <span class="info-value">{{ doc.number }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Дата составления:</span>
          <span class="info-value">{{ doc.date }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Грузоотправитель:</span>
          <span class="info-value">{{ doc.shipper_organization?.title || 'Не указано' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Грузополучатель:</span>
          <span class="info-value">{{ doc.consignee_organization?.title || 'Не указано' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Поставщик:</span>
          <span class="info-value">{{ doc.supplier_organization?.title || 'Не указано' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Плательщик:</span>
          <span class="info-value">{{ doc.payer_organization?.title || 'Не указано' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Транспортная накладная:</span>
          <span class="info-value">
            № {{ doc.transport_invoice?.number || '—' }}
            <template v-if="doc.transport_invoice?.date">
              от {{ doc.transport_invoice.date }}
            </template>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Вид операции:</span>
          <span class="info-value">{{ doc.operation_type || 'Не указано' }}</span>
        </div>
      </div>

      <div class="torg12-items">
        <h3>Табличная часть</h3>
        <table class="table table-bordered">
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
          <tbody>
            <tr v-for="(row, i) in doc.items" :key="i">
              <td>{{ i + 1 }}</td>
              <td>{{ row.item?.title }}</td>
              <td>{{ row.unit?.title }}</td>
              <td>{{ formatNumber(row.quantity, 0) }}</td>
              <td>{{ formatNumber(row.price, 2) }}</td>
              <td>{{ formatNumber(lineAmounts(row).amountWithoutVat, 2) }}</td>
              <td>{{ formatNumber(row.vat_percent, 0) }}</td>
              <td>{{ formatNumber(lineAmounts(row).vatAmount, 2) }}</td>
              <td>{{ formatNumber(lineAmounts(row).amountWithVat, 2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <iframe ref="printFrame" style="display:none;"></iframe>

    <Torg12Form
      :visible="showEditForm"
      :initial-data="doc"
      :organizations="organizations"
      :items="items"
      :units="units"
      :package-types="packageTypes"
      @submit="handleSubmit"
      @cancel="showEditForm = false"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Torg12Form from '@/components/Torg12Form.vue'
import { formatTorg12Number, getTorg12LineAmounts, printTorg12Document } from '@/utils/torg12Print'

export default {
  components: { Torg12Form },
  props: { id: { type: String, required: true } },
  data() {
    return { doc: null, showEditForm: false }
  },
  computed: {
    ...mapGetters(['currentTorg12', 'organizations', 'items', 'units', 'packageTypes'])
  },
  methods: {
    ...mapActions([
      'fetchTorg12ById',
      'updateTorg12',
      'deleteTorg12',
      'fetchOrganizations',
      'fetchItems',
      'fetchUnits',
      'fetchPackageTypes'
    ]),
    async load() {
      this.doc = await this.fetchTorg12ById(this.id)
    },
    async loadReferences() {
      await Promise.all([
        this.fetchOrganizations(),
        this.fetchItems(),
        this.fetchUnits(),
        this.fetchPackageTypes()
      ])
    },
    openEdit() {
      if (Array.isArray(this.doc.items) && this.doc.items.length === 0) {
        this.doc = {
          ...this.doc,
          items: [
            {
              item: this.items[0] || null,
              unit: this.units[0] || null,
              package_type: this.packageTypes[0] || null,
              quantity: 1,
              places: 1,
              gross_weight: 1,
              net_weight: 1,
              price: 1000,
              vat_percent: 20
            }
          ]
        }
      }
      this.showEditForm = true
    },
    async handleSubmit(payload) {
      await this.updateTorg12(payload)
      this.showEditForm = false
      await this.load()
    },
    async handleDelete() {
      if (!confirm('Удалить документ?')) {
        return
      }
      await this.deleteTorg12(this.id)
      this.$router.push('/torg12')
    },
    formatNumber(value, digits = 2) {
      return formatTorg12Number(value, digits)
    },
    lineAmounts(row) {
      return getTorg12LineAmounts(row)
    },
    printDoc() {
      printTorg12Document(this.$refs.printFrame, this.doc)
    }
  },
  async created() {
    await this.loadReferences()
    await this.load()
  }
}
</script>

<style scoped>
.torg12-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: auto;
}

.torg12-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 25px;
}

.torg12-info {
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.info-label {
  font-weight: 600;
  width: 220px;
  color: #333;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #555;
}

.table {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-buttons {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .info-row {
    flex-direction: column;
  }

  .info-label {
    width: 100%;
    margin-bottom: 4px;
  }
}
</style>
