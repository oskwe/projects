<template>
  <div>
    <h2>Единицы измерения</h2>
    <button class="btn btn-primary mb-3" @click="showForm = true">Добавить единицу</button>
    <ItemForm :visible="showForm" :initial-data="editing" title="Единица измерения" @submit="submit" @cancel="reset" />
    <ItemTable :items="units" @edit="startEdit" @delete="remove" />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import ItemForm from '@/components/ItemForm.vue'
import ItemTable from '@/components/ItemTable.vue'
export default {
  components: { ItemForm, ItemTable },
  data() { return { showForm: false, editing: null } },
  computed: { ...mapGetters(['units']) },
  methods: {
    ...mapActions(['fetchUnits', 'addUnit', 'updateUnit', 'deleteUnit']),
    async submit(data) { this.editing ? await this.updateUnit(data) : await this.addUnit(data); this.reset() },
    startEdit(item) { this.editing = { ...item }; this.showForm = true },
    async remove(id) { if (confirm('Удалить запись?')) await this.deleteUnit(id) },
    reset() { this.showForm = false; this.editing = null }
  },
  created() { this.fetchUnits() }
}
</script>
