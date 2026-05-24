<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Antrian</h1>
        <p class="page-subtitle">Kelola dan monitor antrian pasien.</p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card>
      <v-card-text>
        <div class="d-flex flex-wrap align-center ga-3">
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

          <v-spacer />

          <v-text-field
            v-model="tanggal"
            type="date"
            label="Tanggal"
            variant="outlined"
            density="compact"
            hide-details
            style="max-width: 190px"
            @update:model-value="fetchQueue"
          />

          <v-btn
            variant="tonal"
            prepend-icon="mdi-refresh"
            :loading="loading"
            @click="fetchQueue"
          >
            Refresh
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

        <v-progress-linear
          v-if="loading"
          class="mt-4"
          indeterminate
          color="primary"
        />

        <v-tabs v-model="tab" class="mt-4" color="primary">
          <v-tab value="product">
            Product
            <v-chip class="ml-2" size="x-small" variant="tonal">
              {{ queueMap.product.length }}
            </v-chip>
          </v-tab>

          <v-tab value="treatment">
            Treatment
            <v-chip class="ml-2" size="x-small" variant="tonal">
              {{ queueMap.treatment.length }}
            </v-chip>
          </v-tab>

          <v-tab v-if="showVip" value="vip">
            VIP
            <v-chip class="ml-2" size="x-small" variant="tonal">
              {{ queueMap.vip.length }}
            </v-chip>
          </v-tab>
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
              @recall="handleRecall"
            />
          </v-window-item>

          <v-window-item value="treatment">
            <QueueTable
              type="treatment"
              :items="queueMap.treatment"
              :counter-options="counterOptions"
              @call="handleCall"
              @recall="handleRecall"
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
              @recall="handleRecall"
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
import antrianService from "@/services/antrian/antrianService";

export default {
  name: "Antrian",

  components: {
    QueueTable,
  },

  props: {
    tokoId: {
      type: [Number, String],
      default: null,
    },
  },

  data() {
    return {
      tab: "product",
      loading: false,
      errorMessage: "",
      refreshInterval: null,

      tanggal: this.getTodayDate(),

      breadcrumbs: [
        {
          title: "Antrian",
          disabled: true,
        },
      ],

      counterOptions: [],

      queueMap: {
        product: [],
        treatment: [],
        vip: [],
      },
    };
  },

  computed: {
    activeTokoId() {
      const fromProp = Number(this.tokoId || 0);

      if (fromProp) {
        return fromProp;
      }

      const localToko =
        localStorage.getItem("selected_toko_id") ||
        localStorage.getItem("selected_cabang_id") ||
        localStorage.getItem("toko_id");

      return Number(localToko || 2);
    },

    showVip() {
      return this.activeTokoId === 2 || this.activeTokoId === 8;
    },
  },

  mounted() {
    this.fetchInitialData();

    this.refreshInterval = setInterval(() => {
      this.fetchQueue(true);
    }, 8000);
  },

  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },

  methods: {
    async fetchInitialData() {
      await Promise.all([this.fetchCounters(), this.fetchQueue()]);
    },

    async fetchCounters() {
      this.errorMessage = "";

      try {
        const response = await antrianService.counter({
          toko_id: this.activeTokoId,
        });

        const rows = response?.data || [];

        this.counterOptions = rows.map((item) => ({
          title: item.nama,
          value: item.id,
        }));
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data counter.",
        );
      }
    },

    async fetchQueue(silent = false) {
      this.errorMessage = "";

      if (!silent) {
        this.loading = true;
      }

      try {
        const response = await antrianService.operator({
          toko_id: this.activeTokoId,
          tanggal: this.tanggal,
          per_page: 300,
        });

        const payload = response?.data || {};
        const rows = Array.isArray(payload) ? payload : payload.data || [];

        this.applyQueueRows(rows);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data antrian.",
        );
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },

    applyQueueRows(rows = []) {
      const nextMap = {
        product: [],
        treatment: [],
        vip: [],
      };

      rows.forEach((item) => {
        const type = this.resolveQueueType(item);

        if (!nextMap[type]) {
          return;
        }

        nextMap[type].push(this.normalizeQueueItem(item, type));
      });

      this.queueMap = nextMap;

      if (!this.showVip && this.tab === "vip") {
        this.tab = "product";
      }
    },

    resolveQueueType(item = {}) {
      const kodeKategori = String(
        item?.kategori?.kode || item?.kode_kategori || item?.kode || "",
      ).toUpperCase();

      const namaKategori = String(
        item?.kategori?.nama || item?.nama_kategori || "",
      ).toLowerCase();

      if (kodeKategori === "P" || namaKategori.includes("product")) {
        return "product";
      }

      if (kodeKategori === "T" || namaKategori.includes("treatment")) {
        return "treatment";
      }

      if (kodeKategori === "V" || namaKategori.includes("vip")) {
        return "vip";
      }

      return "product";
    },

    normalizeQueueItem(item = {}, type = "product") {
      const kodeNomor = item.kode_nomor || this.buildKodeNomor(item);
      const parsed = this.parseKodeNomor(kodeNomor);

      return {
        ...item,

        id: item.id,
        type,

        tgl_antri: this.formatDate(item.tanggal || item.created_at),
        waktu: this.formatTime(
          item.checkin_at ||
            item.called_at ||
            item.served_at ||
            item.created_at,
        ),

        kode: parsed.kode,
        no: parsed.no,
        kode_nomor: kodeNomor,

        status: this.normalizeStatus(item.status),

        counter: item.counter_id || item.counter?.id || null,

        counter_name: item.counter?.nama || item.nama_counter || "-",

        source_type: item.source_type || "walk_in",
        booking_code: item.booking?.booking_code || null,
        nama_pasien: item.booking?.nama_pasien || item.nama_pasien || null,
        no_hp: item.booking?.no_hp || item.no_hp || null,

        appointment_at:
          item.appointment_at || item.booking?.appointment_at || null,
        checkin_at: item.checkin_at || null,

        isLoading: false,
      };
    },

    buildKodeNomor(item = {}) {
      const kode = item?.kategori?.kode || item.kode || "";
      const nomor = item.nomor || item.no || "";

      if (!kode && !nomor) {
        return "-";
      }

      return `${kode}-${String(nomor).padStart(3, "0")}`;
    },

    parseKodeNomor(kodeNomor) {
      if (!kodeNomor || kodeNomor === "-") {
        return {
          kode: "-",
          no: "-",
        };
      }

      const parts = String(kodeNomor).split("-");

      if (parts.length < 2) {
        return {
          kode: String(kodeNomor).charAt(0),
          no: String(kodeNomor).slice(1),
        };
      }

      return {
        kode: parts[0],
        no: parts.slice(1).join("-"),
      };
    },

    normalizeStatus(status) {
      if (status === "waiting" || status === 0) {
        return "waiting";
      }

      if (status === "called") {
        return "called";
      }

      if (status === "serving" || status === "in_service" || status === 1) {
        return "in_service";
      }

      if (status === "finished" || status === "done" || status === 2) {
        return "done";
      }

      if (status === "skipped") {
        return "skipped";
      }

      if (status === "cancelled") {
        return "cancelled";
      }

      return "waiting";
    },

    toBackendStatus(uiStatus) {
      if (uiStatus === "in_service") {
        return "serving";
      }

      if (uiStatus === "done") {
        return "finished";
      }

      return uiStatus;
    },

    setItemLoading(type, id, value) {
      const index = this.queueMap[type].findIndex((item) => item.id === id);

      if (index === -1) {
        return;
      }

      this.queueMap[type][index] = {
        ...this.queueMap[type][index],
        isLoading: value,
      };
    },

    patchItem(type, id, patch) {
      const index = this.queueMap[type].findIndex((item) => item.id === id);

      if (index === -1) {
        return;
      }

      this.queueMap[type][index] = {
        ...this.queueMap[type][index],
        ...patch,
      };
    },

    async runAction({ type, id, action, counter = null }) {
      this.errorMessage = "";

      const current = this.queueMap[type].find((item) => item.id === id);

      if (!current) {
        return;
      }

      if (action === "call" && !counter) {
        this.errorMessage = "Pilih counter terlebih dahulu.";
        return;
      }

      const previous = { ...current };

      this.setItemLoading(type, id, true);

      try {
        if (action === "call") {
          this.patchItem(type, id, {
            status: "called",
            counter,
          });

          await antrianService.panggil(id, {
            counter_id: counter,
          });

          this.playQueueVoice(current, counter);
        }

        if (action === "recall") {
          await antrianService.panggilUlang(id, {
            counter_id: counter,
          });

          this.playQueueVoice(current, counter);
        }

        if (action === "start") {
          this.patchItem(type, id, {
            status: "in_service",
          });

          await antrianService.mulaiLayanan(id);
        }

        if (action === "finish") {
          this.patchItem(type, id, {
            status: "done",
          });

          await antrianService.selesai(id);
        }

        if (action === "skip") {
          this.patchItem(type, id, {
            status: "skipped",
          });

          await antrianService.lewati(id);
        }

        await this.fetchQueue(true);
      } catch (error) {
        this.patchItem(type, id, previous);

        this.errorMessage = this.getErrorMessage(
          error,
          "Terjadi kesalahan saat memproses antrian.",
        );
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

    async handleRecall(payload) {
      await this.runAction({
        type: payload.type,
        id: payload.id,
        counter: payload.counter,
        action: "recall",
      });
    },
    getTodayDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    formatDate(value) {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    formatTime(value) {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        const raw = String(value);
        return raw.length >= 5 ? raw.slice(0, 5) : raw;
      }

      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");

      return `${hour}:${minute}`;
    },

    getErrorMessage(error, fallback) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
      );
    },
    async playQueueVoice(item, counterId) {
      if (!window.speechSynthesis) {
        return;
      }

      const nomor = item.kode_nomor || `${item.kode}-${item.no}`;
      const counter = this.getCounterTitle(
        counterId || item.counter || item.counter_id,
      );

      const parsed = this.splitQueueCode(nomor);

      window.speechSynthesis.cancel();

      await this.speakQueueText("Nomor antrian");
      await this.delayVoice(250);

      await this.speakQueueText(parsed.prefixText);
      await this.delayVoice(550);

      await this.speakQueueText(parsed.numberText);
      await this.delayVoice(350);

      await this.speakQueueText(`Silakan menuju ${counter}`);
    },

    speakQueueText(text) {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = "id-ID";
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = resolve;
        utterance.onerror = resolve;

        window.speechSynthesis.speak(utterance);
      });
    },

    delayVoice(ms = 300) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },

    splitQueueCode(value) {
      if (!value) {
        return {
          prefixText: "",
          numberText: "",
        };
      }

      const raw = String(value).trim().toUpperCase();
      const parts = raw.split("-");

      const prefix = parts[0] || "";
      const number = parts[1] || "";

      const prefixMap = {
        P: "P",
        T: "T",
        V: "V",
      };

      return {
        prefixText: prefixMap[prefix] || prefix,
        numberText: this.spellQueueNumber(number),
      };
    },

    spellQueueNumber(value) {
      if (!value) {
        return "";
      }

      const digitMap = {
        0: "nol",
        1: "satu",
        2: "dua",
        3: "tiga",
        4: "empat",
        5: "lima",
        6: "enam",
        7: "tujuh",
        8: "delapan",
        9: "sembilan",
      };

      return String(value)
        .split("")
        .map((char) => digitMap[char] || char)
        .join(" ");
    },

    getCounterTitle(counterId) {
      const found = this.counterOptions.find((item) => {
        return Number(item.value) === Number(counterId);
      });

      return found?.title || `Counter ${counterId}`;
    },
  },
};
</script>
