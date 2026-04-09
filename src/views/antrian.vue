<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Antrian</h1>
        <p class="page-subtitle">
          Kelola dan monitor antrian pasien (panggil, proses, selesai, skip)
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card>
      <v-card-text>
        <div class="d-flex flex-wrap ga-3">
          <v-btn
            :to="'/antrian/input'"
            variant="tonal"
            target="_blank"
            prepend-icon="mdi-link-variant"
          >
            LINK INPUT
          </v-btn>

          <v-btn
            :to="'/antrian/display'"
            target="_blank"
            variant="tonal"
            prepend-icon="mdi-monitor"
          >
            LINK DISPLAY
          </v-btn>
        </div>

        <v-alert
          v-if="errorMessage"
          class="mt-4"
          type="error"
          variant="tonal"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-tabs v-model="tab" class="mt-4" color="primary">
          <v-tab value="product">Antrian Product</v-tab>
          <v-tab value="treatment">Antrian Treatment</v-tab>
          <v-tab v-if="showVip" value="vip">Antrian VIP</v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-3">
          <v-window-item value="product">
            <QueueTable
              type="product"
              :items="queueMap.product"
              :counter-options="counterOptions"
              @call="handleCall"
              @start="handleStart"
              @finish="handleFinish"
              @skip="handleSkip"
            />
          </v-window-item>

          <v-window-item value="treatment">
            <QueueTable
              type="treatment"
              :items="queueMap.treatment"
              :counter-options="counterOptions"
              @call="handleCall"
              @start="handleStart"
              @finish="handleFinish"
              @skip="handleSkip"
            />
          </v-window-item>

          <v-window-item v-if="showVip" value="vip">
            <QueueTable
              type="vip"
              :items="queueMap.vip"
              :counter-options="counterOptions"
              @call="handleCall"
              @start="handleStart"
              @finish="handleFinish"
              @skip="handleSkip"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import QueueTable from "./queue-table.vue";

export default {
  name: "Antrian",
  components: { QueueTable },

  props: {
    baseUrl: { type: String, default: "/" },
    tokoId: { type: Number, default: 2 },
    antrianProduct: { type: Array, default: () => [] },
    antrianTreatment: { type: Array, default: () => [] },
    antrianVip: { type: Array, default: () => [] },
  },

  data() {
    return {
      tab: "product",
      errorMessage: "",
      breadcrumbs: [{ title: "Antrian", disabled: true }],

      counterOptions: [
        { title: "Counter 1", value: 1 },
        { title: "Counter 2", value: 2 },
        { title: "Counter 3", value: 3 },
        { title: "Counter 4", value: 4 },
        { title: "Counter 5", value: 5 },
        { title: "Counter 6", value: 6 },
      ],

      queueMap: {
        product: [],
        treatment: [],
        vip: [],
      },

      dummyProduct: [
        {
          id: 101,
          tgl_antri: "2026-03-05",
          waktu: "09:10",
          kode: "P",
          no: "001",
          status: 0,
        },
        {
          id: 102,
          tgl_antri: "2026-03-05",
          waktu: "09:18",
          kode: "P",
          no: "002",
          status: 0,
        },
        {
          id: 103,
          tgl_antri: "2026-03-05",
          waktu: "09:25",
          kode: "P",
          no: "003",
          status: 1,
          counter: 2,
        },
        {
          id: 104,
          tgl_antri: "2026-03-05",
          waktu: "09:40",
          kode: "P",
          no: "004",
          status: 2,
          counter: 2,
        },
      ],

      dummyTreatment: [
        {
          id: 201,
          tgl_antri: "2026-03-05",
          waktu: "10:05",
          kode: "T",
          no: "011",
          status: 0,
        },
        {
          id: 202,
          tgl_antri: "2026-03-05",
          waktu: "10:12",
          kode: "T",
          no: "012",
          status: 1,
          counter: 1,
        },
        {
          id: 203,
          tgl_antri: "2026-03-05",
          waktu: "10:20",
          kode: "T",
          no: "013",
          status: 0,
        },
      ],

      dummyVip: [
        {
          id: 301,
          tgl_antri: "2026-03-05",
          waktu: "11:00",
          kode: "V",
          no: "001",
          status: 0,
        },
        {
          id: 302,
          tgl_antri: "2026-03-05",
          waktu: "11:08",
          kode: "V",
          no: "002",
          status: 1,
          counter: 3,
        },
      ],
    };
  },

  computed: {
    showVip() {
      return this.tokoId === 2 || this.tokoId === 8;
    },

    sourceProduct() {
      return this.antrianProduct?.length
        ? this.antrianProduct
        : this.dummyProduct;
    },

    sourceTreatment() {
      return this.antrianTreatment?.length
        ? this.antrianTreatment
        : this.dummyTreatment;
    },

    sourceVip() {
      return this.antrianVip?.length ? this.antrianVip : this.dummyVip;
    },
  },

  watch: {
    sourceProduct: {
      immediate: true,
      deep: true,
      handler(val) {
        this.queueMap.product = this.normalizeList(val);
      },
    },

    sourceTreatment: {
      immediate: true,
      deep: true,
      handler(val) {
        this.queueMap.treatment = this.normalizeList(val);
      },
    },

    sourceVip: {
      immediate: true,
      deep: true,
      handler(val) {
        this.queueMap.vip = this.normalizeList(val);
      },
    },
  },

  methods: {
    normalizeList(list = []) {
      return list.map((item) => ({
        ...item,
        status: this.normalizeStatus(item.status),
        counter: item.counter || null,
        isLoading: false,
      }));
    },

    normalizeStatus(status) {
      if (status === "waiting" || status === 0) return "waiting";
      if (status === "called") return "called";
      if (status === "in_service" || status === 1) return "in_service";
      if (status === "done" || status === 2) return "done";
      if (status === "skipped") return "skipped";
      return "waiting";
    },

    buildUrl(path) {
      const cleanBase = this.baseUrl.endsWith("/")
        ? this.baseUrl
        : `${this.baseUrl}/`;
      return `${cleanBase}${path}`;
    },

    setItemLoading(type, id, value) {
      const index = this.queueMap[type].findIndex((x) => x.id === id);
      if (index === -1) return;

      this.queueMap[type][index] = {
        ...this.queueMap[type][index],
        isLoading: value,
      };
    },

    patchItem(type, id, patch) {
      const index = this.queueMap[type].findIndex((x) => x.id === id);
      if (index === -1) return;

      this.queueMap[type][index] = {
        ...this.queueMap[type][index],
        ...patch,
      };
    },

    async request(url, options = {}) {
      const response = await fetch(url, {
        method: options.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        let message = `Request gagal (${response.status})`;
        try {
          const result = await response.json();
          if (result?.message) message = result.message;
        } catch (_) {}
        throw new Error(message);
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    },

    async runAction({ type, id, action, counter = null }) {
      this.errorMessage = "";
      this.setItemLoading(type, id, true);

      const current = this.queueMap[type].find((x) => x.id === id);
      if (!current) {
        this.setItemLoading(type, id, false);
        return;
      }

      const previous = { ...current };

      try {
        if (action === "call") {
          this.patchItem(type, id, {
            status: "called",
            counter,
          });

          await this.request(
            this.buildUrl(`Antrian/No_antrian/panggil_${type}/${id}`),
            {
              method: "POST",
              body: { counter },
            },
          );
        }

        if (action === "start") {
          this.patchItem(type, id, {
            status: "in_service",
          });

          await this.request(
            this.buildUrl(`Antrian/No_antrian/in_${type}/${id}`),
            {
              method: "POST",
            },
          );
        }

        if (action === "finish") {
          this.patchItem(type, id, {
            status: "done",
          });

          await this.request(
            this.buildUrl(`Antrian/No_antrian/out_${type}/${id}`),
            {
              method: "POST",
            },
          );
        }

        if (action === "skip") {
          this.patchItem(type, id, {
            status: "skipped",
          });

          await this.request(
            this.buildUrl(`Antrian/No_antrian/skip_${type}/${id}`),
            {
              method: "POST",
            },
          );
        }
      } catch (error) {
        this.patchItem(type, id, previous);
        this.errorMessage =
          error?.message || "Terjadi kesalahan saat memproses antrian.";
      } finally {
        this.setItemLoading(type, id, false);
      }
    },

    async handleCall(payload) {
      await this.runAction({
        type: payload.type,
        id: payload.id,
        counter: payload.counter,
        action: "call",
      });
    },

    async handleStart(payload) {
      await this.runAction({
        type: payload.type,
        id: payload.id,
        action: "start",
      });
    },

    async handleFinish(payload) {
      await this.runAction({
        type: payload.type,
        id: payload.id,
        action: "finish",
      });
    },

    async handleSkip(payload) {
      await this.runAction({
        type: payload.type,
        id: payload.id,
        action: "skip",
      });
    },
  },
};
</script>
