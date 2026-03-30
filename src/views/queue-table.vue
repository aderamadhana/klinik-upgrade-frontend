<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-value="id"
    density="compact"
    class="queue-table"
  >
    <!-- DATANG -->
    <template v-slot:item.datang="{ item }">
      {{ item.tgl_antri }} - {{ item.waktu }}
    </template>

    <!-- NOMOR -->
    <template v-slot:item.nomor="{ item }">
      {{ item.kode }}{{ item.no }}
    </template>

    <!-- STATUS -->
    <template v-slot:item.status="{ item }">
      <v-chip
        size="small"
        :color="statusMeta(item.status).color"
        variant="tonal"
      >
        {{ statusMeta(item.status).text }}
      </v-chip>
    </template>

    <!-- ACTION -->
    <template v-slot:item.action="{ item }">
      <div v-if="item.status === 0" class="d-flex flex-wrap ga-2 align-center">
        <div style="min-width: 200px">
          <v-select
            v-model="selected[item.id]"
            :items="counterOptions"
            item-title="title"
            item-value="value"
            label="Panggil Nomor"
            density="compact"
            variant="outlined"
            hide-details
            @update:modelValue="(val) => onCounterChange(item.id, val)"
          />
        </div>

        <v-btn :href="inHref(item.id)" color="success" size="small"> IN </v-btn>

        <v-btn :href="outHref(item.id)" color="error" size="small"> OUT </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "QueueTable",
  props: {
    items: { type: Array, default: () => [] },
    type: { type: String, required: true }, // product | treatment | vip
    baseUrl: { type: String, required: true },
    counterOptions: { type: Array, required: true },
  },
  emits: ["call"],
  data() {
    return {
      headers: [
        { title: "DATANG", key: "datang" },
        { title: "NO", key: "nomor" },
        { title: "STATUS", key: "status" },
        { title: "", key: "action", sortable: false },
      ],

      selected: {},
    };
  },
  methods: {
    statusMeta(status) {
      if (status === 0) return { text: "Menunggu", color: "warning" };
      if (status === 1) return { text: "Masuk", color: "success" };
      return { text: "Keluar", color: "grey" };
    },
    inHref(id) {
      return `${this.baseUrl}Antrian/No_antrian/in_${this.type}/${id}`;
    },
    outHref(id) {
      return `${this.baseUrl}Antrian/No_antrian/out_${this.type}/${id}`;
    },
    onCounterChange(id, val) {
      if (!val || val === 0) return;
      this.$emit("call", { type: this.type, id, counter: val });
    },
  },
};
</script>
<style scoped>
.queue-table :deep(th),
.queue-table :deep(td) {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  padding-left: 12px;
  padding-right: 12px;
  vertical-align: middle;
}

.queue-table :deep(tr) {
  height: 44px; /* sesuaikan 40-48 */
}
</style>
