<template>
  <div class="queue-display-page">
    <header class="brand-bar">
      <img :src="logo" alt="MS Glow Aesthetics" class="brand-logo" />
    </header>

    <main class="display-shell">
      <section class="hero-block">
        <h1 class="hero-title">Antrian Dalam Penanganan</h1>
        <p class="hero-subtitle">
          Nomor aktif, counter tujuan, dan persiapan berikutnya untuk setiap
          layanan
        </p>
      </section>

      <section class="panel-grid" :class="gridClass">
        <article
          v-for="service in visibleServices"
          :key="service.type"
          class="queue-panel"
        >
          <div class="panel-header">
            <div class="panel-title-wrap">
              <div class="panel-icon">
                <v-icon size="24">{{ service.icon }}</v-icon>
              </div>

              <div>
                <div class="panel-label">{{ service.label }}</div>
                <div class="panel-status">
                  <span class="live-dot"></span>
                  Live
                </div>
              </div>
            </div>
          </div>

          <div class="panel-body">
            <div class="info-section">
              <div class="section-label">Sedang Dilayani</div>

              <div class="main-number">
                {{ getCurrentNo(service.type) }}
              </div>

              <div class="counter-badge">
                <v-icon size="16">mdi-storefront-outline</v-icon>
                {{ getCurrentCounter(service.type) }}
              </div>
            </div>

            <div class="divider-line"></div>

            <div class="info-section info-section-next">
              <div class="section-label">Persiapan Berikutnya</div>

              <div class="next-number">
                {{ getNextNo(service.type) }}
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: "DisplayAntrianInformativeDummy",

  data() {
    return {
      logo: new URL("@/assets/logowebsitenew.png", import.meta.url).href,
      tokoId: 2,
      intervalId: null,

      // Struktur data dummy yang lebih benar:
      // current dan next dipisah agar counter bisa berbeda
      antrian: {
        product: {
          current: {
            no: "P-013",
            counter: "Counter 1",
          },
          next: {
            no: "P-014",
            counter: "Counter 3",
          },
        },
        treatment: {
          current: {
            no: "T-022",
            counter: "Counter 2",
          },
          next: {
            no: "T-023",
            counter: "Counter 1",
          },
        },
        vip: {
          current: {
            no: "V-005",
            counter: "Counter VIP",
          },
          next: {
            no: "V-006",
            counter: "Counter VIP",
          },
        },
      },

      services: [
        {
          type: "product",
          label: "Product",
          icon: "mdi-bag-personal-outline",
          kode: "P",
        },
        {
          type: "treatment",
          label: "Treatment",
          icon: "mdi-spa-outline",
          kode: "T",
        },
        {
          type: "vip",
          label: "VIP",
          icon: "mdi-crown-outline",
          kode: "V",
        },
      ],

      // dummy mapping counter yang mungkin dipakai per service
      counterPool: {
        product: ["Counter 1", "Counter 2", "Counter 3"],
        treatment: ["Counter 1", "Counter 2", "Counter 4"],
        vip: ["Counter VIP"],
      },
    };
  },

  computed: {
    showVip() {
      return this.tokoId === 2 || this.tokoId === 8;
    },

    visibleServices() {
      return this.services.filter((item) => {
        if (item.type === "vip") return this.showVip;
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
    this.intervalId = setInterval(() => {
      this.rotateDummyQueue();
    }, 9000);
  },

  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  },

  methods: {
    getQueueItem(type) {
      return this.antrian?.[type] || null;
    },

    getCurrentNo(type) {
      return this.getQueueItem(type)?.current?.no || "-";
    },

    getCurrentCounter(type) {
      return this.getQueueItem(type)?.current?.counter || "-";
    },

    getNextNo(type) {
      return this.getQueueItem(type)?.next?.no || "-";
    },

    getNextCounter(type) {
      return this.getQueueItem(type)?.next?.counter || "-";
    },

    extractNumber(value) {
      if (!value || typeof value !== "string") return 0;
      const match = value.match(/(\d+)$/);
      if (!match) return 0;

      const num = parseInt(match[1], 10);
      return Number.isNaN(num) ? 0 : num;
    },

    formatNumber(num) {
      return String(num).padStart(3, "0");
    },

    buildQueueNumber(type, num) {
      const service = this.services.find((item) => item.type === type);
      if (!service) return "-";
      return `${service.kode}-${this.formatNumber(num)}`;
    },

    getRandomCounter(type) {
      const pool = this.counterPool[type] || ["Counter 1"];
      const randomIndex = Math.floor(Math.random() * pool.length);
      return pool[randomIndex];
    },

    rotateDummyQueue() {
      this.visibleServices.forEach((service) => {
        const item = this.getQueueItem(service.type);
        if (!item?.current || !item?.next) return;

        const currentNextNo = item.next.no;
        const currentNextCounter = item.next.counter;

        const nextSequence = this.extractNumber(currentNextNo) + 1;

        this.antrian[service.type] = {
          current: {
            no: currentNextNo,
            counter: currentNextCounter,
          },
          next: {
            no: this.buildQueueNumber(service.type, nextSequence),
            counter: this.getRandomCounter(service.type),
          },
        };
      });
    },
  },
};
</script>

<style scoped>
.queue-display-page {
  min-height: 100vh;
  background: #f6f3f5;
  font-family: Arial, Helvetica, sans-serif;
  color: #231a1f;
}

.brand-bar {
  height: 118px;
  background: linear-gradient(90deg, #cb6c9a 0%, #a54f7a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.brand-logo {
  max-height: 82px;
  width: auto;
  object-fit: contain;
}

.display-shell {
  max-width: 1480px;
  margin: 0 auto;
  padding: 36px 24px 44px;
}

.hero-block {
  text-align: center;
  margin-bottom: 30px;
}

.hero-title {
  margin: 0;
  font-size: 50px;
  line-height: 1.08;
  font-weight: 800;
  color: #23161b;
}

.hero-subtitle {
  margin: 12px auto 0;
  font-size: 18px;
  color: #675b61;
  max-width: 840px;
  line-height: 1.6;
}

.panel-grid {
  display: grid;
  gap: 22px;
  justify-content: center;
}

.panel-grid-1 {
  grid-template-columns: minmax(460px, 520px);
}

.panel-grid-2 {
  grid-template-columns: repeat(2, minmax(420px, 500px));
}

.panel-grid-3 {
  grid-template-columns: repeat(3, minmax(320px, 420px));
}

.queue-panel {
  width: 100%;
  background: #ffffff;
  border: 1px solid #ead9e1;
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 520px;
  box-shadow: 0 10px 28px rgba(44, 20, 32, 0.06);
}

.panel-header {
  padding: 22px 22px 16px;
  border-bottom: 1px solid #f1e5eb;
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.panel-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  background: #f6e5ed;
  color: #9e5477;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.panel-label {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.08;
  color: #24181d;
}

.panel-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 14px;
  color: #5f565b;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #30b566;
}

.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 22px 22px;
}

.info-section {
  text-align: center;
}

.info-section-next {
  margin-top: 6px;
}

.section-label {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #877982;
}

.main-number {
  font-size: clamp(84px, 9vw, 128px);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #1f1318;
  margin-bottom: 16px;
}

.counter-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f9eef3;
  border: 1px solid #edd9e4;
  color: #8f5572;
  font-size: 14px;
  font-weight: 700;
}

.divider-line {
  height: 1px;
  background: #f1e5eb;
  margin: 28px 0 24px;
}

.next-number {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.1;
  color: #9e5477;
  margin-bottom: 14px;
}

.next-destination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.destination-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a7b83;
}

.destination-value {
  font-size: 24px;
  font-weight: 800;
  color: #3d2b33;
}

@media (max-width: 1360px) {
  .panel-grid-3 {
    grid-template-columns: repeat(3, minmax(280px, 360px));
  }

  .hero-title {
    font-size: 42px;
  }
}

@media (max-width: 1100px) {
  .panel-grid-3 {
    grid-template-columns: repeat(2, minmax(360px, 460px));
  }
}

@media (max-width: 900px) {
  .panel-grid-1,
  .panel-grid-2,
  .panel-grid-3 {
    grid-template-columns: minmax(320px, 460px);
  }

  .brand-bar {
    height: 90px;
  }

  .brand-logo {
    max-height: 56px;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .queue-panel {
    min-height: 460px;
  }

  .panel-label {
    font-size: 28px;
  }

  .main-number {
    font-size: 84px;
  }

  .next-number {
    font-size: 34px;
  }

  .destination-value {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .display-shell {
    padding-left: 16px;
    padding-right: 16px;
  }

  .panel-grid-1,
  .panel-grid-2,
  .panel-grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>
