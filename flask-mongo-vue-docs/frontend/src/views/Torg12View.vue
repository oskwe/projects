<template>
    <div>
      <div class="header">
      <h2>Товарные накладные</h2>
      <button class="btn btn-primary" @click="openForm">Добавить документ</button>
    </div>

    <Torg12Form
      :visible="showForm"
      :initial-data="editingDoc"
      :organizations="organizations"
      :items="items"
      :units="units"
      :package-types="packageTypes"
      @submit="handleSubmit"
      @cancel="closeForm"
    />

    <Torg12Table :torg12="torg12Documents" @edit="startEdit" @delete="handleDelete" @print="printDoc" />
    <iframe ref="printFrame" style="display:none;"></iframe>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Torg12Form from '@/components/Torg12Form.vue'
import Torg12Table from '@/components/Torg12Table.vue'
import { printTorg12Document } from '@/utils/torg12Print'

export default {
  components: { Torg12Form, Torg12Table },
  data() {
    return { showForm: false, editingDoc: null }
  },
  computed: {
    ...mapGetters(['torg12Documents', 'organizations', 'items', 'units', 'packageTypes'])
  },
  methods: {
    ...mapActions([
      'fetchTorg12',
      'fetchTorg12ById',
      'addTorg12',
      'updateTorg12',
      'deleteTorg12',
      'fetchOrganizations',
      'fetchItems',
      'fetchUnits',
      'fetchPackageTypes'
    ]),
    async loadData() {
      await this.fetchTorg12()
      await Promise.all([
        this.fetchOrganizations(),
        this.fetchItems(),
        this.fetchUnits(),
        this.fetchPackageTypes()
      ])
    },
    openForm() {
      this.editingDoc = null
      this.showForm = true
    },
    closeForm() {
      this.showForm = false
      this.editingDoc = null
    },
    getToday() {
      return new Date().toISOString().slice(0, 10)
    },
    defaultPriceForItem(item) {
      return /ноутбук|notebook|laptop/i.test(item?.title || '') ? 85000 : 1000
    },
    buildLegacyEditPayload(doc) {
      const orgId = doc.shipper_organization?._id || this.organizations[0]?._id || null
      const item = this.items[0] || null
      return {
        _id: doc._id,
        number: doc.number || '',
        date: doc.date || this.getToday(),
        shipper_organization: orgId,
        consignee_organization: orgId,
        supplier_organization: orgId,
        payer_organization: orgId,
        operation_type: 'Продажа',
        transport_invoice: { number: '', date: this.getToday() },
        items: [
          {
            item: item?._id || null,
            unit: this.units[0]?._id || null,
            package_type: this.packageTypes[0]?._id || null,
            quantity: 1,
            places: 1,
            gross_weight: 1,
            net_weight: 1,
            price: this.defaultPriceForItem(item),
            vat_percent: 20
          }
        ]
      }
    },
    async startEdit(doc) {
      if (doc.type === 'torg12') {
        this.editingDoc = await this.fetchTorg12ById(doc._id)
      } else {
        this.editingDoc = this.buildLegacyEditPayload(doc)
      }
      this.showForm = true
    },
    async handleSubmit(payload) {
      if (payload._id) {
        await this.updateTorg12(payload)
      } else {
        await this.addTorg12(payload)
      }
      this.closeForm()
    },
    async handleDelete(id) {
      if (confirm('Удалить документ?')) {
        await this.deleteTorg12(id)
      }
    },
    async printDoc(doc) {
      const printable = doc.type === 'torg12' ? await this.fetchTorg12ById(doc._id) : doc
      printTorg12Document(this.$refs.printFrame, printable)
    }
  },
  created() {
    this.loadData()
  }
}
</script>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
</style>
