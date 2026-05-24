<template>
  <div class="queue-display-page">
    <header class="brand-bar">
      <img :src="logo" alt="MS Glow Aesthetics" class="brand-logo" />
    </header>

    <main class="display-shell">
      <section class="title-section">
        <h1>Antrian Dalam Penanganan</h1>
        <p>Mohon perhatikan nomor antrian dan counter tujuan.</p>

        <div v-if="lastUpdated" class="last-updated">
          Update terakhir: {{ lastUpdated }}
        </div>
      </section>

      <v-alert
        v-if="errorMessage"
        class="mb-5"
        type="error"
        variant="tonal"
        border="start"
      >
        {{ errorMessage }}
      </v-alert>

      <section class="panel-grid" :class="gridClass">
        <article
          v-for="service in visibleServices"
          :key="service.type"
          class="queue-panel"
        >
          <div class="panel-header">
            <div class="service-mark">
              <v-icon size="26">{{ service.icon }}</v-icon>
            </div>

            <div>
              <div class="service-label">{{ service.label }}</div>
              <div class="service-subtitle">Sedang Dilayani</div>
            </div>
          </div>

          <div class="panel-main">
            <div class="main-number">
              {{ getCurrentNo(service.type) }}
            </div>

            <div class="counter-badge">
              {{ getCurrentCounter(service.type) }}
            </div>
          </div>

          <div class="panel-footer">
            <span>Berikutnya</span>
            <strong>{{ getNextNo(service.type) }}</strong>
          </div>
        </article>
      </section>

      <div v-if="!loading && visibleServices.length === 0" class="empty-state">
        Belum ada data antrian untuk ditampilkan.
      </div>
    </main>
  </div>
</template>

<script>
import antrianService from "@/services/antrian/antrianService";

export default {
  name: "DisplayAntrianInformative",

  props: {
    tokoId: {
      type: [Number, String],
      default: null,
    },
  },

  data() {
    return {
      logo: new URL("@/assets/logowebsitenew.png", import.meta.url).href,

      loading: false,
      errorMessage: "",
      intervalId: null,
      lastUpdated: "",

      services: [],
      queueMap: {
        product: {
          current: null,
          next: null,
        },
        treatment: {
          current: null,
          next: null,
        },
        vip: {
          current: null,
          next: null,
        },
      },

      defaultServiceMeta: {
        product: {
          type: "product",
          label: "Product",
          icon: "mdi-shopping-outline",
          kode: "P",
        },
        treatment: {
          type: "treatment",
          label: "Treatment",
          icon: "mdi-spa-outline",
          kode: "T",
        },
        vip: {
          type: "vip",
          label: "VIP",
          icon: "mdi-crown-outline",
          kode: "V",
        },
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

    visibleServices() {
      const rows = this.services.length
        ? this.services
        : [
            this.defaultServiceMeta.product,
            this.defaultServiceMeta.treatment,
            ...(this.showVip ? [this.defaultServiceMeta.vip] : []),
          ];

      return rows.filter((item) => {
        if (item.type === "vip") {
          return this.showVip;
        }

        return true;
      });
    },

    gridClass() {
      const count = this.visibleServices.length;

      if (count <= 1) return "panel-grid-1";
      if (count === 2) return "panel-grid-2";

      return "panel-grid-3";
    },
  },

  mounted() {
    this.fetchDisplay();

    this.intervalId = setInterval(() => {
      this.fetchDisplay(true);
    }, 5000);
  },

  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },

  methods: {
    async fetchDisplay(silent = false) {
      if (!silent) {
        this.loading = true;
      }

      this.errorMessage = "";

      try {
        const response = await antrianService.display({
          toko_id: this.activeTokoId,
          tanggal: this.getTodayDate(),
        });

        const rows = response?.data || [];

        this.applyDisplayRows(rows);
        this.lastUpdated = this.getCurrentTime();
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data display antrian.",
        );
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },

    applyDisplayRows(rows = []) {
      const nextServices = [];
      const nextQueueMap = {
        product: {
          current: null,
          next: null,
        },
        treatment: {
          current: null,
          next: null,
        },
        vip: {
          current: null,
          next: null,
        },
      };

      rows.forEach((row) => {
        const kategori = row?.kategori || {};
        const type = this.resolveQueueType(kategori);

        if (!nextQueueMap[type]) {
          return;
        }

        if (type === "vip" && !this.showVip) {
          return;
        }

        const serviceMeta = {
          ...this.defaultServiceMeta[type],
          label: kategori.nama || this.defaultServiceMeta[type].label,
          kode: kategori.kode || this.defaultServiceMeta[type].kode,
          icon: kategori.icon || this.defaultServiceMeta[type].icon,
        };

        const serviceExists = nextServices.some(
          (item) => item.type === serviceMeta.type,
        );

        if (!serviceExists) {
          nextServices.push(serviceMeta);
        }

        nextQueueMap[type] = {
          current: row.current || null,
          next: row.next || null,
        };
      });

      this.services = this.sortServices(nextServices);
      this.queueMap = nextQueueMap;
    },

    sortServices(rows = []) {
      const order = {
        product: 1,
        treatment: 2,
        vip: 3,
      };

      return [...rows].sort((a, b) => {
        return (order[a.type] || 99) - (order[b.type] || 99);
      });
    },

    resolveQueueType(kategori = {}) {
      const kode = String(kategori.kode || "").toUpperCase();
      const nama = String(kategori.nama || "").toLowerCase();

      if (kode === "P" || nama.includes("product")) {
        return "product";
      }

      if (kode === "T" || nama.includes("treatment")) {
        return "treatment";
      }

      if (kode === "V" || nama.includes("vip")) {
        return "vip";
      }

      return "product";
    },

    getQueueItem(type) {
      return (
        this.queueMap?.[type] || {
          current: null,
          next: null,
        }
      );
    },

    getCurrentNo(type) {
      const current = this.getQueueItem(type)?.current;

      return current?.kode_nomor || "-";
    },

    getCurrentCounter(type) {
      const current = this.getQueueItem(type)?.current;

      return current?.counter || "-";
    },

    getNextNo(type) {
      const next = this.getQueueItem(type)?.next;

      return next?.kode_nomor || "-";
    },

    getTodayDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    getCurrentTime() {
      const now = new Date();
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");
      const second = String(now.getSeconds()).padStart(2, "0");

      return `${hour}:${minute}:${second}`;
    },

    getErrorMessage(error, fallback) {
      const rawError = error?.response?.data?.error;

      if (typeof rawError === "string") {
        return rawError;
      }

      return error?.response?.data?.message || error?.message || fallback;
    },
  },
};
</script>

<style scoped>
.queue-display-page {
  min-height: 100vh;
  background: #f4f5f7;
  font-family: Arial, Helvetica, sans-serif;
  color: #111827;
}

.brand-bar {
  height: 92px;
  background: linear-gradient(90deg, #d86aa2 0%, #a04678 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  box-shadow: 0 2px 10px rgba(17, 24, 39, 0.12);
}

.brand-logo {
  max-height: 78px;
  width: auto;
  object-fit: contain;
}

.display-shell {
  max-width: 1500px;
  margin: 0 auto;
  padding: 38px 42px 52px;
}

.title-section {
  text-align: center;
  margin-bottom: 30px;
}

.title-section h1 {
  margin: 0;
  font-size: 42px;
  line-height: 1.15;
  font-weight: 800;
  color: #0f172a;
}

.title-section p {
  margin: 10px 0 0;
  font-size: 18px;
  color: #64748b;
}

.last-updated {
  margin-top: 10px;
  font-size: 13px;
  color: #94a3b8;
}

.panel-grid {
  display: grid;
  gap: 26px;
  justify-content: center;
}

.panel-grid-1 {
  grid-template-columns: minmax(420px, 560px);
}

.panel-grid-2 {
  grid-template-columns: repeat(2, minmax(420px, 560px));
}

.panel-grid-3 {
  grid-template-columns: repeat(3, minmax(380px, 1fr));
}

.queue-panel {
  min-height: 440px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.panel-header {
  min-height: 92px;
  padding: 22px 24px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  gap: 16px;
}

.service-mark {
  width: 54px;
  height: 54px;
  border-radius: 15px;
  background: #fdf2f8;
  color: #b5477a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-label {
  font-size: 30px;
  line-height: 1.1;
  font-weight: 800;
  color: #0f172a;
}

.service-subtitle {
  margin-top: 5px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.panel-main {
  flex: 1;
  padding: 34px 26px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main-number {
  width: 100%;
  white-space: nowrap;
  text-align: center;
  font-size: clamp(76px, 7vw, 116px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.06em;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}

.counter-badge {
  margin-top: 20px;
  min-height: 42px;
  padding: 0 20px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.panel-footer {
  min-height: 78px;
  margin: 0 24px 24px;
  padding: 0 20px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.panel-footer span {
  font-size: 17px;
  font-weight: 700;
  color: #64748b;
}

.panel-footer strong {
  white-space: nowrap;
  font-size: 34px;
  line-height: 1;
  font-weight: 900;
  color: #b5477a;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.empty-state {
  margin-top: 28px;
  padding: 28px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  text-align: center;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 1280px) {
  .display-shell {
    padding-left: 28px;
    padding-right: 28px;
  }

  .panel-grid-3 {
    grid-template-columns: repeat(3, minmax(300px, 1fr));
  }

  .main-number {
    font-size: clamp(66px, 7vw, 96px);
  }
}

@media (max-width: 980px) {
  .panel-grid-3 {
    grid-template-columns: repeat(2, minmax(320px, 1fr));
  }

  .title-section h1 {
    font-size: 34px;
  }

  .title-section p {
    font-size: 16px;
  }
}

@media (max-width: 720px) {
  .brand-bar {
    height: 88px;
  }

  .brand-logo {
    max-height: 58px;
  }

  .display-shell {
    padding: 28px 16px 40px;
  }

  .title-section {
    margin-bottom: 22px;
  }

  .title-section h1 {
    font-size: 28px;
  }

  .title-section p {
    font-size: 15px;
  }

  .panel-grid-1,
  .panel-grid-2,
  .panel-grid-3 {
    grid-template-columns: 1fr;
  }

  .queue-panel {
    min-height: 360px;
  }

  .panel-header {
    min-height: 78px;
    padding: 18px;
  }

  .service-mark {
    width: 48px;
    height: 48px;
  }

  .service-label {
    font-size: 25px;
  }

  .main-number {
    font-size: clamp(64px, 18vw, 88px);
  }

  .panel-footer {
    min-height: 68px;
    margin: 0 18px 18px;
  }

  .panel-footer strong {
    font-size: 28px;
  }
}
</style>
