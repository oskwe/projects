<template>
  <div>
    <h2>Основания (договоры)</h2>
    <button class="btn btn-primary mb-3" @click="showForm = true">Добавить основание</button>
    <ItemForm :visible="showForm" :initial-data="editing" title="Основание" @submit="submit" @cancel="reset" />
    <ItemTable :items="basisDocuments" @edit="startEdit" @delete="remove" />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import ItemForm from '@/components/ItemForm.vue'
import ItemTable from '@/components/ItemTable.vue'
export default {
  components: { ItemForm, ItemTable },
  data() { return { showForm: false, editing: null } },
  computed: { ...mapGetters(['basisDocuments']) },
  methods: {
    ...mapActions(['fetchBasisDocuments', 'addBasisDocument', 'updateBasisDocument', 'deleteBasisDocument']),
    async submit(data) { this.editing ? await this.updateBasisDocument(data) : await this.addBasisDocument(data); this.reset() },
    startEdit(item) { this.editing = { ...item }; this.showForm = true },
    async remove(id) { if (confirm('Удалить запись?')) await this.deleteBasisDocument(id) },
    reset() { this.showForm = false; this.editing = null }
  },
  created() { this.fetchBasisDocuments() }
}
</script>
