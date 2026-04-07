<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-value="id"
    density="compact"
    class="queue-table"
  >
    <template #item.datang="{ item }">
      {{ item.tgl_antri }} - {{ item.waktu }}
    </template>

    <template #item.nomor="{ item }">
      <div class="font-weight-medium">{{ item.kode }}{{ item.no }}</div>
    </template>

    <template #item.counter="{ item }">
      <span v-if="item.counter">Counter {{ item.counter }}</span>
      <span v-else class="text-medium-emphasis">-</span>
    </template>

    <template #item.status="{ item }">
      <v-chip
        size="small"
        :color="statusMeta(item.status).color"
        variant="tonal"
      >
        {{ statusMeta(item.status).text }}
      </v-chip>
    </template>

    <template #item.action="{ item }">
      <div class="action-wrap">
        <template v-if="item.status === 'waiting'">
          <div class="counter-select">
            <v-select
              v-model="selectedCounter[item.id]"
              :items="counterOptions"
              item-title="title"
              item-value="value"
              label="Pilih Counter"
              density="compact"
              variant="outlined"
              hide-details
              :disabled="item.isLoading"
            />
          </div>

          <v-btn
            color="primary"
            size="small"
            :loading="item.isLoading"
            :disabled="item.isLoading || !selectedCounter[item.id]"
            @click="emitCall(item)"
          >
            Panggil
          </v-btn>

          <v-btn
            color="grey-darken-1"
            size="small"
            variant="tonal"
            :loading="item.isLoading"
            :disabled="item.isLoading"
            @click="emitSkip(item)"
          >
            Skip
          </v-btn>
        </template>

        <template v-else-if="item.status === 'called'">
          <v-btn
            color="success"
            size="small"
            :loading="item.isLoading"
            :disabled="item.isLoading"
            @click="emitStart(item)"
          >
            Mulai
          </v-btn>

          <v-btn
            color="grey-darken-1"
            size="small"
            variant="tonal"
            :loading="item.isLoading"
            :disabled="item.isLoading"
            @click="emitSkip(item)"
          >
            Skip
          </v-btn>
        </template>

        <template v-else-if="item.status === 'in_service'">
          <v-btn
            color="success"
            size="small"
            :loading="item.isLoading"
            :disabled="item.isLoading"
            @click="emitFinish(item)"
          >
            Selesai
          </v-btn>
        </template>

        <template v-else>
          <span class="text-medium-emphasis">-</span>
        </template>
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "QueueTable",

  props: {
    items: { type: Array, default: () => [] },
    type: { type: String, required: true },
    counterOptions: { type: Array, required: true },
  },

  emits: ["call", "start", "finish", "skip"],

  data() {
    return {
      headers: [
        { title: "DATANG", key: "datang" },
        { title: "NO", key: "nomor" },
        { title: "COUNTER", key: "counter", sortable: false },
        { title: "STATUS", key: "status" },
        { title: "AKSI", key: "action", sortable: false },
      ],

      selectedCounter: {},
    };
  },

  watch: {
    items: {
      immediate: true,
      deep: true,
      handler(val) {
        const map = {};

        (val || []).forEach((item) => {
          map[item.id] = item.counter || this.selectedCounter[item.id] || null;
        });

        this.selectedCounter = map;
      },
    },
  },

  methods: {
    statusMeta(status) {
      const meta = {
        waiting: { text: "Menunggu", color: "warning" },
        called: { text: "Dipanggil", color: "primary" },
        in_service: { text: "Dilayani", color: "success" },
        done: { text: "Selesai", color: "grey" },
        skipped: { text: "Skip", color: "deep-orange" },
      };

      return meta[status] || meta.waiting;
    },

    emitCall(item) {
      const counter = this.selectedCounter[item.id];
      if (!counter) return;

      this.$emit("call", {
        type: this.type,
        id: item.id,
        counter,
      });
    },

    emitStart(item) {
      this.$emit("start", {
        type: this.type,
        id: item.id,
      });
    },

    emitFinish(item) {
      this.$emit("finish", {
        type: this.type,
        id: item.id,
      });
    },

    emitSkip(item) {
      this.$emit("skip", {
        type: this.type,
        id: item.id,
      });
    },
  },
};
</script>

<style scoped>
.queue-table :deep(th),
.queue-table :deep(td) {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  padding-left: 12px;
  padding-right: 12px;
  vertical-align: middle;
}

.queue-table :deep(tr) {
  height: 52px;
}

.action-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.counter-select {
  min-width: 180px;
  max-width: 220px;
}
</style>
