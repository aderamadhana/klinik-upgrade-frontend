<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-value="id"
    density="compact"
    class="queue-table"
  >
    <template #item.datang="{ item }">
      <div class="datang-cell">
        <div class="datang-date">
          {{ formatTanggalDatang(item) }}
        </div>
        <div class="datang-time">
          {{ formatJamDatang(item) }}
        </div>
      </div>
    </template>

    <template #item.nomor="{ item }">
      <div class="nomor-cell">
        {{ formatNomor(item) }}
      </div>

      <div v-if="item.source_type === 'booking'" class="source-badge">
        Booking
      </div>
    </template>

    <template #item.counter="{ item }">
      <span v-if="getCounterName(item)">
        {{ getCounterName(item) }}
      </span>
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
            color="primary"
            size="small"
            variant="tonal"
            :loading="item.isLoading"
            :disabled="item.isLoading"
            @click="emitRecall(item)"
          >
            Panggil Ulang
          </v-btn>

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
    items: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      required: true,
    },
    counterOptions: {
      type: Array,
      required: true,
    },
  },

  emits: ["call", "recall", "start", "finish", "skip"],

  data() {
    return {
      headers: [
        { title: "DATANG", key: "datang", sortable: false },
        { title: "NO", key: "nomor", sortable: false },
        { title: "COUNTER", key: "counter", sortable: false },
        { title: "STATUS", key: "status", sortable: false },
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
          map[item.id] =
            item.counter ||
            item.counter_id ||
            this.selectedCounter[item.id] ||
            null;
        });

        this.selectedCounter = map;
      },
    },
  },

  methods: {
    formatTanggalDatang(item) {
      const source =
        item.checkin_at ||
        item.created_at ||
        item.tgl_antri ||
        item.tanggal ||
        null;

      if (!source) {
        return "-";
      }

      const date = new Date(source);

      if (Number.isNaN(date.getTime())) {
        return this.formatDateString(source);
      }

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatJamDatang(item) {
      const source =
        item.checkin_at ||
        item.created_at ||
        item.waktu ||
        item.tgl_antri ||
        item.tanggal ||
        null;

      if (!source) {
        return "-";
      }

      if (typeof source === "string" && /^\d{2}:\d{2}/.test(source)) {
        return source.slice(0, 5);
      }

      const date = new Date(source);

      if (Number.isNaN(date.getTime())) {
        if (item.waktu) {
          return String(item.waktu).slice(0, 5);
        }

        return "-";
      }

      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatDateString(value) {
      const raw = String(value);

      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [year, month, day] = raw.split("-");

        const monthMap = {
          "01": "Jan",
          "02": "Feb",
          "03": "Mar",
          "04": "Apr",
          "05": "Mei",
          "06": "Jun",
          "07": "Jul",
          "08": "Agu",
          "09": "Sep",
          10: "Okt",
          11: "Nov",
          12: "Des",
        };

        return `${day} ${monthMap[month] || month} ${year}`;
      }

      return raw;
    },

    formatNomor(item) {
      if (item.kode_nomor) {
        return item.kode_nomor;
      }

      const kode = item.kode || "";
      const no = item.no || item.nomor || "";

      if (!kode && !no) {
        return "-";
      }

      if (String(no).startsWith("-")) {
        return `${kode}${no}`;
      }

      return `${kode}-${String(no).padStart(3, "0")}`;
    },

    getCounterName(item) {
      if (item.counter_name && item.counter_name !== "-") {
        return item.counter_name;
      }

      if (item.counter?.nama) {
        return item.counter.nama;
      }

      const selected = item.counter || item.counter_id;

      if (!selected) {
        return "";
      }

      const found = this.counterOptions.find((counter) => {
        return Number(counter.value) === Number(selected);
      });

      if (found?.title) {
        return found.title;
      }

      return `Counter ${selected}`;
    },

    statusMeta(status) {
      const meta = {
        waiting: { text: "Menunggu", color: "warning" },
        called: { text: "Dipanggil", color: "primary" },
        in_service: { text: "Dilayani", color: "success" },
        done: { text: "Selesai", color: "grey" },
        skipped: { text: "Skip", color: "deep-orange" },
        cancelled: { text: "Batal", color: "error" },
      };

      return meta[status] || meta.waiting;
    },

    emitCall(item) {
      const counter = this.selectedCounter[item.id];

      if (!counter) {
        return;
      }

      this.$emit("call", {
        type: this.type,
        id: item.id,
        counter,
      });
    },

    emitRecall(item) {
      const counter =
        item.counter || item.counter_id || this.selectedCounter[item.id];

      if (!counter) {
        return;
      }

      this.$emit("recall", {
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
  height: 54px;
}

.datang-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.datang-date {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
}

.datang-time {
  font-size: 12px;
  color: #6b7280;
}

.nomor-cell {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  white-space: nowrap;
}

.source-badge {
  display: inline-flex;
  margin-top: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  background: #fdf2f8;
  color: #b5477a;
  font-size: 11px;
  font-weight: 700;
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
