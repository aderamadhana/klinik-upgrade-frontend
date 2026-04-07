<template>
  <div class="antrian-page">
    <header class="top-banner">
      <img :src="logo" alt="MS Glow Aesthetics" class="top-logo" />
    </header>

    <main class="content-wrap">
      <section class="hero-section">
        <h1 class="page-title">Pilih Layanan</h1>
        <p class="page-subtitle">
          Sentuh salah satu kartu untuk mengambil nomor antrean.
        </p>
      </section>

      <section class="queue-grid" :class="gridClass">
        <article
          v-for="service in visibleServices"
          :key="service.type"
          class="service-card"
          :class="{ 'is-loading': loadingType === service.type }"
        >
          <div class="card-top">
            <div class="card-icon">
              <v-icon size="34">{{ service.icon }}</v-icon>
            </div>

            <div class="card-title-wrap">
              <h2 class="card-title">{{ service.label }}</h2>
              <p class="card-desc">{{ service.desc }}</p>
            </div>
          </div>

          <div class="card-middle">
            <div class="meta-box">
              <span class="meta-label">Nomor berikutnya</span>
              <strong class="meta-value">
                {{ service.kode
                }}{{ formatNumber(getNextNumber(service.type)) }}
              </strong>
            </div>

            <div class="meta-box">
              <span class="meta-label">Sudah tercetak hari ini</span>
              <strong class="meta-value">
                {{ counters[service.type] || 0 }}
              </strong>
            </div>
          </div>

          <div class="card-bottom">
            <button
              class="btn-primary"
              :disabled="loadingType !== null"
              @click="ambilNomor(service.type)"
            >
              {{
                loadingType === service.type ? "Memproses..." : "Ambil Nomor"
              }}
            </button>
          </div>
        </article>
      </section>
    </main>

    <transition name="fade">
      <div v-if="result" class="modal-overlay" @click.self="closeResult">
        <div class="modal-box">
          <div class="result-badge">{{ result.label }}</div>

          <p class="result-caption">Nomor antrean Anda</p>

          <div class="result-number">
            {{ result.kode }}{{ formatNumber(result.no) }}
          </div>

          <div class="result-meta">
            <div class="result-meta-item">
              <span>Waktu ambil</span>
              <strong>{{ result.time }}</strong>
            </div>

            <div class="result-meta-item">
              <span>Tanggal</span>
              <strong>{{ result.date }}</strong>
            </div>
          </div>

          <p class="result-note">
            Silakan menunggu sampai nomor Anda dipanggil.
          </p>

          <div class="modal-actions">
            <button class="btn-secondary" @click="closeResult">Tutup</button>
            <button class="btn-primary" @click="printTicket">Cetak</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "AntrianPageModernDummy",

  data() {
    return {
      logo: new URL("@/assets/logowebsitenew.png", import.meta.url).href,
      tokoId: 2,

      loadingType: null,
      result: null,

      counters: {
        product: 12,
        treatment: 8,
        vip: 3,
      },

      services: [
        {
          type: "product",
          label: "Product",
          desc: "Pembelian produk",
          kode: "P",
          icon: "mdi-bag-personal",
        },
        {
          type: "treatment",
          label: "Treatment",
          desc: "Perawatan, tindakan, dan layanan klinik",
          kode: "T",
          icon: "mdi-spa",
        },
        {
          type: "vip",
          label: "VIP",
          desc: "Layanan prioritas untuk pelanggan VIP",
          kode: "V",
          icon: "mdi-crown",
        },
      ],
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
      if (count <= 1) return "queue-grid-1";
      if (count === 2) return "queue-grid-2";
      return "queue-grid-3";
    },
  },

  methods: {
    getNextNumber(type) {
      return (this.counters[type] || 0) + 1;
    },

    formatNumber(num) {
      return String(num).padStart(3, "0");
    },

    getService(type) {
      return this.visibleServices.find((item) => item.type === type);
    },

    getNowDate() {
      const now = new Date();
      return now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    },

    getNowTime() {
      const now = new Date();
      return now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    async ambilNomor(type) {
      if (this.loadingType) return;

      const service = this.getService(type);
      if (!service) return;

      this.loadingType = type;

      await new Promise((resolve) => setTimeout(resolve, 900));

      const nextNumber = this.getNextNumber(type);
      this.counters[type] = nextNumber;

      this.result = {
        type,
        label: service.label,
        kode: service.kode,
        no: nextNumber,
        date: this.getNowDate(),
        time: this.getNowTime(),
      };

      this.loadingType = null;
    },

    closeResult() {
      this.result = null;
    },

    printTicket() {
      window.print();
    },
  },
};
</script>

<style scoped>
.antrian-page {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top right,
      rgba(216, 106, 162, 0.08),
      transparent 28%
    ),
    linear-gradient(180deg, #faf7f9 0%, #f4f4f5 100%);
  font-family: Arial, Helvetica, sans-serif;
  color: #1f1f1f;
}

.top-banner {
  height: 118px;
  background: linear-gradient(90deg, #d86aa2 0%, #a04678 100%);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.top-logo {
  max-height: 82px;
  width: auto;
  object-fit: contain;
}

.content-wrap {
  max-width: 1540px;
  margin: 0 auto;
  padding: 44px 28px 64px;
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  margin: 0;
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  color: #21161b;
}

.page-subtitle {
  max-width: 760px;
  margin: 14px auto 0;
  color: #6a6a6a;
  font-size: 21px;
  line-height: 1.6;
}

.queue-grid {
  display: grid;
  gap: 30px;
  justify-content: center;
}

.queue-grid-1 {
  grid-template-columns: minmax(420px, 560px);
}

.queue-grid-2 {
  grid-template-columns: repeat(2, minmax(420px, 520px));
}

.queue-grid-3 {
  grid-template-columns: repeat(3, minmax(380px, 450px));
}

.service-card {
  width: 100%;
  min-height: 520px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(186, 103, 142, 0.16);
  border-radius: 24px;
  box-shadow: 0 14px 34px rgba(44, 20, 32, 0.09);
  padding: 28px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(44, 20, 32, 0.12);
  border-color: rgba(186, 103, 142, 0.26);
}

.service-card.is-loading {
  opacity: 0.9;
}

.card-top {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 28px;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f0c3d8 0%, #e4a8c5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #8f3f63;
}

.card-title-wrap {
  min-width: 0;
}

.card-title {
  margin: 0 0 8px;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.1;
  color: #24181d;
}

.card-desc {
  margin: 0;
  color: #6c6c6c;
  font-size: 18px;
  line-height: 1.6;
}

.card-middle {
  display: grid;
  gap: 16px;
  margin-bottom: 28px;
}

.meta-box {
  min-height: 118px;
  border: 1px solid #f0d5e2;
  border-radius: 18px;
  background: #fff8fb;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.meta-label {
  display: block;
  margin-bottom: 10px;
  color: #876171;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.meta-value {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.1;
  color: #2c1f25;
}

.card-bottom {
  margin-top: auto;
}

.btn-primary,
.btn-secondary {
  height: 60px;
  border: 0;
  border-radius: 14px;
  padding: 0 22px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    opacity 0.16s ease;
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-1px);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.btn-primary {
  width: 100%;
  background: linear-gradient(90deg, #ba678e 0%, #a8597d 100%);
  color: #fff;
  box-shadow: 0 8px 18px rgba(186, 103, 142, 0.28);
}

.btn-secondary {
  background: #ece7ea;
  color: #3e3438;
  min-width: 140px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(22, 14, 18, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 30;
}

.modal-box {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
  padding: 32px 32px 26px;
  text-align: center;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  background: #f8e4ee;
  color: #9d4d75;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.result-caption {
  margin: 18px 0 10px;
  color: #777;
  font-size: 16px;
}

.result-number {
  font-size: 82px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #23161b;
  margin-bottom: 20px;
}

.result-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.result-meta-item {
  background: #faf7f8;
  border: 1px solid #f0e6ea;
  border-radius: 14px;
  padding: 14px;
}

.result-meta-item span {
  display: block;
  color: #7e7277;
  font-size: 12px;
  margin-bottom: 4px;
}

.result-meta-item strong {
  font-size: 16px;
  color: #241b1f;
}

.result-note {
  margin: 0 0 24px;
  color: #666;
  line-height: 1.6;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1380px) {
  .queue-grid-3 {
    grid-template-columns: repeat(2, minmax(400px, 520px));
  }

  .page-title {
    font-size: 46px;
  }

  .page-subtitle {
    font-size: 18px;
  }
}

@media (max-width: 900px) {
  .queue-grid-1,
  .queue-grid-2,
  .queue-grid-3 {
    grid-template-columns: minmax(320px, 520px);
  }

  .top-banner {
    height: 96px;
  }

  .top-logo {
    max-height: 64px;
  }

  .content-wrap {
    padding-top: 28px;
  }

  .page-title {
    font-size: 34px;
  }

  .page-subtitle {
    font-size: 15px;
  }

  .service-card {
    min-height: 460px;
    padding: 22px;
  }

  .card-title {
    font-size: 30px;
  }

  .card-desc {
    font-size: 15px;
  }

  .meta-box {
    min-height: 100px;
  }

  .meta-value {
    font-size: 34px;
  }

  .btn-primary,
  .btn-secondary {
    height: 54px;
    font-size: 17px;
  }

  .result-number {
    font-size: 62px;
  }

  .result-meta {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .content-wrap {
    padding-left: 16px;
    padding-right: 16px;
  }

  .queue-grid-1,
  .queue-grid-2,
  .queue-grid-3 {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 30px;
  }
}

@media print {
  .top-banner,
  .content-wrap {
    display: none !important;
  }

  .modal-overlay {
    position: static;
    background: white;
    padding: 0;
  }

  .modal-box {
    box-shadow: none;
    border: 1px solid #ddd;
    max-width: 100%;
    border-radius: 0;
  }

  .modal-actions {
    display: none;
  }
}
</style>
