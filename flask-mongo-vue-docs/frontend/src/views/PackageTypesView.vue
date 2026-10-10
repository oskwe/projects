<template>
  <div>
    <h2>Виды упаковки</h2>
    <button class="btn btn-primary mb-3" @click="showForm = true">Добавить вид упаковки</button>
    <ItemForm :visible="showForm" :initial-data="editing" title="Вид упаковки" @submit="submit" @cancel="reset" />
    <ItemTable :items="packageTypes" @edit="startEdit" @delete="remove" />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import ItemForm from '@/components/ItemForm.vue'
import ItemTable from '@/components/ItemTable.vue'
export default {
  components: { ItemForm, ItemTable },
  data() { return { showForm: false, editing: null } },
  computed: { ...mapGetters(['packageTypes']) },
  methods: {
    ...mapActions(['fetchPackageTypes', 'addPackageType', 'updatePackageType', 'deletePackageType']),
    async submit(data) { this.editing ? await this.updatePackageType(data) : await this.addPackageType(data); this.reset() },
    startEdit(item) { this.editing = { ...item }; this.showForm = true },
    async remove(id) { if (confirm('Удалить запись?')) await this.deletePackageType(id) },
    reset() { this.showForm = false; this.editing = null }
  },
  created() { this.fetchPackageTypes() }
}
</script>
