<template>
  <div>
    <!-- PAGE HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Antrian</h1>
        <p class="page-subtitle">
          Kelola dan monitor antrian pasien (panggil, IN/OUT, counter)
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

        <v-tabs v-model="tab" class="mt-4" color="primary">
          <v-tab value="product">Antrian Product</v-tab>
          <v-tab value="treatment">Antrian Treatment</v-tab>
          <v-tab v-if="showVip" value="vip">Antrian VIP</v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-3">
          <v-window-item value="product">
            <QueueTable
              type="product"
              :items="dummyProduct"
              :base-url="baseUrl"
              :counter-options="counterOptions"
              @call="handleCall"
            />
          </v-window-item>

          <v-window-item value="treatment">
            <QueueTable
              type="treatment"
              :items="dummyTreatment"
              :base-url="baseUrl"
              :counter-options="counterOptions"
              @call="handleCall"
            />
          </v-window-item>

          <v-window-item v-if="showVip" value="vip">
            <QueueTable
              type="vip"
              :items="dummyVip"
              :base-url="baseUrl"
              :counter-options="counterOptions"
              @call="handleCall"
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
    tokoId: { type: Number, default: 2 }, // default 2 biar VIP bisa muncul saat testing
    antrianProduct: { type: Array, default: () => [] },
    antrianTreatment: { type: Array, default: () => [] },
    antrianVip: { type: Array, default: () => [] },
  },
  data() {
    return {
      tab: "product",
      breadcrumbs: [{ title: "Antrian", disabled: true }],
      counterOptions: [
        { title: "Panggil Nomor", value: 0 },
        { title: "Counter 1", value: 1 },
        { title: "Counter 2", value: 2 },
        { title: "Counter 3", value: 3 },
        { title: "Counter 4", value: 4 },
        { title: "Counter 5", value: 5 },
        { title: "Counter 6", value: 6 },
      ],

      // ===== Dummy data =====
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
        },
        {
          id: 104,
          tgl_antri: "2026-03-05",
          waktu: "09:40",
          kode: "P",
          no: "004",
          status: 2,
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
        },
      ],
    };
  },
  computed: {
    showVip() {
      return this.tokoId === 2 || this.tokoId === 8;
    },
    // fallback: kalau props kosong -> dummy
    antrianProductList() {
      return this.dummyProduct;
    },
    antrianTreatmentList() {
      return this.dummyTreatment;
    },
    antrianVipList() {
      return this.dummyVip;
    },
  },
  methods: {
    handleCall(payload) {
      // payload: { type, id, counter }
      console.log("CALL", payload);

      // Kalau mau langsung hit API, taruh di sini.
      // contoh:
      // this.$axios.post(`${this.baseUrl}Antrian/panggil_${payload.type}/${payload.id}`, { counter: payload.counter })
    },
  },
};
</script>
