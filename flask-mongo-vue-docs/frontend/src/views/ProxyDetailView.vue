<template>
  <div class="proxy-detail">
    <div class="header">
      <h2>Документ № {{ proxy.number }}</h2>
      <div class="header-buttons">
        <button class="btn btn-primary me-2" @click="toggleEditMode">
          {{ editMode ? 'Отменить' : 'Редактировать' }}
        </button>
        <button v-if="editMode" class="btn btn-success me-2" @click="saveProxy" :disabled="isSaving">
          <span v-if="isSaving" class="spinner-border spinner-border-sm"></span>
          Сохранить
        </button>
        <button class="btn btn-warning me-2" @click="printProxy">
          Печать
        </button>
        <router-link to="/proxies" class="btn btn-secondary">
          Назад к списку
        </router-link>
      </div>
    </div>

    <iframe ref="printFrame" style="display: none;"></iframe>

    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="proxy" class="proxy-content">
      <div class="proxy-info">
        <div class="info-row">
          <span class="info-label">Номер:</span>
          <span v-if="!editMode" class="info-value">{{ proxy.number }}</span>
          <input v-else v-model="editableProxy.number" type="text" class="form-control">
        </div>
        <div class="info-row">
          <span class="info-label">Дата составления:</span>
          <span v-if="!editMode" class="info-value">{{ formatDate(proxy.date) }}</span>
          <input v-else type="date" class="form-control" v-model="editableProxy.date">
        </div>
        <div class="info-row">
          <span class="info-label">Организация:</span>
          <span v-if="!editMode" class="info-value">{{ organizationName }}</span>
          <select v-else v-model="editableProxy.organization" class="form-select">
            <option v-for="org in organizations" :key="org._id" :value="org._id">
              {{ org.title }}
            </option>
          </select>
        </div>
        <div class="info-row">
          <span class="info-label">Организация-поставщик:</span>
          <span v-if="!editMode" class="info-value">{{ payingOrganizationName }}</span>
          <select v-else v-model="editableProxy.supplier_organization" class="form-select">
            <option v-for="org in organizations" :key="org._id" :value="org._id">
              {{ org.title }}
            </option>
          </select>
        </div>
        <div class="info-row">
          <span class="info-label">Физическое лицо:</span>
          <span v-if="!editMode" class="info-value">{{ individualName }}</span>
          <select v-else v-model="editableProxy.individual" class="form-select">
            <option v-for="individual in individuals" :key="individual._id" :value="individual._id">
              {{ individual.lastname }} {{ individual.firstname }} {{ individual.patronymic }}
            </option>
          </select>
        </div>
        <div class="info-row">
          <span class="info-label">Дата начала действия:</span>
          <span v-if="!editMode" class="info-value">{{ formatDate(proxy.period.from) }}</span>
          <input v-else type="date" class="form-control" v-model="periodFrom">
        </div>
        <div class="info-row">
          <span class="info-label">Дата окончания действия:</span>
          <span v-if="!editMode" class="info-value">{{ formatDate(proxy.period.until) }}</span>
          <input v-else type="date" class="form-control" v-model="periodUntil">
        </div>
      </div>

      <div class="proxy-items">
        <h3>Табличная часть</h3>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>№</th>
              <th>Товар</th>
              <th>Количество</th>
              <th v-if="editMode">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in currentItems" :key="index">
              <td>{{ index + 1 }}</td>
              <td>
                <span v-if="!editMode">{{ getItemName(item.item) }}</span>
                <select v-else v-model="editableProxy.items[index].item" class="form-select">
                  <option v-for="itemOption in items" :key="itemOption._id" :value="itemOption._id">
                    {{ itemOption.title }}
                  </option>
                </select>
              </td>
              <td>
                <span v-if="!editMode">{{ item.count }}</span>
                <input v-else v-model.number="editableProxy.items[index].count" type="number" min="0" step="1" class="form-control">
              </td>
              <td v-if="editMode">
                <button class="btn btn-sm btn-danger" @click="removeItem(index)">Удалить</button>
              </td>
            </tr>
            <tr v-if="editMode">
              <td :colspan="editMode ? 4 : 3">
                <button class="btn btn-sm btn-primary" @click="addItem">Добавить строку</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ProxyDetailView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      isSaving: false,
      error: null,
      editMode: false,
      originalProxy: null,
      editableProxy: {
        number: '',
        date: '',
        organization: null,
        supplier_organization: null,
        individual: null,
        period: { from: '', until: '' },
        items: []
      },
      periodFrom: '',
      periodUntil: ''
    }
  },
  computed: {
    ...mapGetters([
      'currentProxy',
      'organizations',
      'items',
      'individuals',
      'getOrganizationById',
      'getItemById',
      'getIndividualById'
    ]),
    proxy() {
      return this.currentProxy || {}
    },
    individualName() {
      if (!this.proxy.individual) return 'Не указана'
      const individual = this.getIndividualById(this.proxy.individual)
      return individual ? `${individual.lastname} ${individual.firstname} ${individual.patronymic}` : 'Неизвестное физ.лицо'
    },
    organizationName() {
      if (!this.proxy.organization) return 'Не указана'
      const org = this.getOrganizationById(this.proxy.organization)
      return org ? org.title : 'Неизвестная организация'
    },
    payingOrganizationName() {
      if (!this.proxy.supplier_organization) return 'Не указана'
      const org = this.getOrganizationById(this.proxy.supplier_organization)
      return org ? org.title : 'Неизвестная организация'
    },
    currentItems() {
      if (!this.proxy.items) return []
      return this.proxy.items.map(item => ({
        item: item.item?._id || item.item,
        count: item.count
      }))
    }
  },
  methods: {
    ...mapActions([
      'fetchProxyById',
      'fetchOrganizations',
      'fetchItems',
      'updateProxy',
      'fetchIndividuals'
    ]),

    printProxy() {
      const getItemName = (itemId) => {
        if (!itemId) return 'Неизвестный товар'
        const item = this.items.find(i => i._id === itemId) || (typeof itemId === 'object' ? itemId : null)
        return item ? item.title : 'Неизвестный товар'
      }

      const formatDatePrint = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('ru-RU')
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Доверенность № ${this.proxy.number}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              font-size: 14pt; 
              line-height: 1.5; 
              margin: 0; 
              padding: 20px; 
              color: #000;
            }
            h1 { 
              text-align: center; 
              font-size: 18pt; 
              margin: 0 0 30px 0; 
              font-weight: bold;
            }
            .info-table { 
              width: 100%; 
              margin-bottom: 25px; 
              border-collapse: collapse; 
            }
            .info-table td { 
              padding: 6px 8px; 
              border: 1px solid #000; 
              vertical-align: top;
            }
            .info-table td.label { 
              font-weight: bold; 
              width: 35%; 
              background-color: #f9f9f9;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              font-size: 12pt;
            }
            .items-table th, 
            .items-table td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left; 
            }
            .items-table th { 
              background-color: #f0f0f0; 
              font-weight: bold;
              text-align: center;
            }
            .items-table td.num {
              text-align: center;
              width: 50px;
            }
            .items-table td.count {
              text-align: center;
              width: 80px;
            }
            .signature-block {
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 300px;
              margin-top: 5px;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <h1>ДОВЕРЕННОСТЬ № ${this.proxy.number}</h1>
          
          <div style="text-align: right; margin-bottom: 30px; font-size: 12pt;">
            Дата составления: ${formatDatePrint(this.proxy.date)}<br>
          </div>

          <table class="info-table">
            <tr>
              <td class="label">Организация:</td>
              <td>${this.organizationName}</td>
            </tr>
            <tr>
              <td class="label">Организация-поставщик:</td>
              <td>${this.payingOrganizationName}</td>
            </tr>
            <tr>
              <td class="label">Физическое лицо:</td>
              <td>${this.individualName}</td>
            </tr>
            <tr>
              <td class="label">Период действия:</td>
              <td>с ${formatDatePrint(this.proxy.period.from)} по ${formatDatePrint(this.proxy.period.until)}</td>
            </tr>
          </table>

          <h3 style="text-align: center; margin: 30px 0 15px 0;">Табличная часть</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th class="num">№</th>
                <th>Наименование товара</th>
                <th class="count">Количество</th>
              </tr>
            </thead>
            <tbody>
              ${(this.proxy.items || []).map((item, index) => `
                <tr>
                  <td class="num">${index + 1}</td>
                  <td>${getItemName(item.item)}</td>
                  <td class="count">${item.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signature-block">
            <p><strong>Подпись ответственного лица:</strong></p>
            <div class="signature-line"></div>
            <p style="margin-top: 5px; font-size: 12pt;">
              _________________ / ${this.individualName} /
            </p>
          </div>
        </body>
        </html>
      `

      const printFrame = this.$refs.printFrame
      if (printFrame) {
        const doc = printFrame.contentDocument || printFrame.contentWindow.document
        doc.open()
        doc.write(printContent)
        doc.close()
        
        printFrame.onload = () => {
          setTimeout(() => {
            printFrame.contentWindow.focus()
            printFrame.contentWindow.print()
          }, 500)
        }
      }
    },

    initEditData() {
      this.originalProxy = JSON.parse(JSON.stringify(this.proxy))
      this.editableProxy = {
        _id: this.proxy._id,
        number: this.proxy.number,
        date: this.formatDateForInput(this.proxy.date),
        organization: this.proxy.organization?._id || this.proxy.organization,
        supplier_organization: this.proxy.supplier_organization?._id || this.proxy.supplier_organization,
        individual: this.proxy.individual?._id || this.proxy.individual,
        period: {
          from: this.formatDateForInput(this.proxy.period?.from),
          until: this.formatDateForInput(this.proxy.period?.until)
        },
        items: this.proxy.items?.map(item => ({
          item: item.item?._id || item.item,
          count: item.count
        })) || []
      }
      this.periodFrom = this.editableProxy.period.from
      this.periodUntil = this.editableProxy.period.until
    },

    formatDateForInput(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toISOString().split('T')[0]
    },

    toggleEditMode() {
      if (this.editMode) {
        this.editableProxy = JSON.parse(JSON.stringify(this.originalProxy))
      } else {
        this.initEditData()
      }
      this.editMode = !this.editMode
    },

    addItem() {
      this.editableProxy.items.push({
        item: this.items[0]?._id || null,
        count: 0
      })
    },

    removeItem(index) {
      this.editableProxy.items.splice(index, 1)
    },

    async saveProxy() {
      this.isSaving = true
      this.error = null
      try {
        const dataToSave = {
          _id: this.id,
          number: this.editableProxy.number,
          date: this.editableProxy.date,
          organization: this.editableProxy.organization,
          supplier_organization: this.editableProxy.supplier_organization,
          individual: this.editableProxy.individual,
          period: {
            from: this.periodFrom,
            until: this.periodUntil
          },
          items: this.editableProxy.items.map(item => ({
            item: item.item,
            count: parseInt(item.count)
          }))
        }
        await this.updateProxy(dataToSave)
        await this.fetchProxyById(this.id)
        this.editMode = false
      } catch (error) {
        console.error('Ошибка сохранения:', error)
        this.error = 'Не удалось сохранить документ'
      } finally {
        this.isSaving = false
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('ru-RU')
    },

    getItemName(itemId) {
      const item = this.getItemById(itemId)
      return item ? item.title : 'Неизвестный товар'
    },

    async loadData() {
      this.isLoading = true
      this.error = null
      try {
        await Promise.all([
          this.$store.dispatch('fetchProxyById', this.id),
          this.$store.dispatch('fetchOrganizations'),
          this.$store.dispatch('fetchIndividuals'),
          this.$store.dispatch('fetchItems')
        ])
        this.initEditData()
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        this.error = 'Не удалось загрузить данные документа'
      } finally {
        this.isLoading = false
      }
    }
  },
  created() {
    this.loadData()
  }
}
</script>

<style scoped>
.proxy-detail {
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

.proxy-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 25px;
}

.proxy-info {
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
  width: 180px;
  color: #333;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #555;
}

.form-control,
.form-select {
  max-width: 400px;
}

.table {
  margin-top: 20px;
}

.alert {
  margin-top: 20px;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.spinner-border-sm {
  margin-right: 5px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-buttons {
    width: 100%;
    justify-content: flex-end;
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