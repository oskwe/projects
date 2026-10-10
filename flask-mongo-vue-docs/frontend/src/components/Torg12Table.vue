<template>
  <table class="table table-striped table-bordered">
    <thead>
      <tr>
        <th>Номер</th>
        <th>Дата</th>
        <th>Грузоотправитель</th>
        <th class="actions-col">Действия</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="doc in torg12"
        :key="doc._id"
        @dblclick="openDoc(doc)"
        style="cursor: pointer;"
      >
        <td>{{ doc.number }}</td>
        <td>{{ doc.date }}</td>
        <td>{{ doc.shipper_organization?.title || '-' }}</td>
        <td class="actions-col">
          <button class="btn btn-sm btn-warning me-2" @click.stop="$emit('edit', doc)">Редактировать</button>
          <button class="btn btn-sm btn-danger" @click.stop="$emit('delete', doc._id)">Удалить</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    torg12: { type: Array, required: true }
  },
  emits: ['edit', 'delete', 'print'],
  methods: {
    openDoc(doc) {
      if (!doc?._id) {
        return
      }
      this.$router.push(`/torg12/${doc._id}`)
    }
  }
}
</script>

<style scoped>
.actions-col {
  text-align: right;
  white-space: nowrap;
  width: 1%;
}
</style>
