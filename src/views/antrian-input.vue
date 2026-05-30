<template>
  <div class="antrian-page">
    <header class="top-banner">
      <img :src="logo" alt="MS Glow Aesthetics" class="top-logo" />
    </header>

    <main class="content-wrap">
      <section class="hero-section">
        <h1 class="page-title">Pilih Kategori Antrian</h1>
        <p class="page-subtitle">Silakan pilih layanan yang dibutuhkan.</p>
      </section>

      <section class="mode-card">
        <button
          type="button"
          class="mode-button"
          :class="{ active: mode === 'walk_in' }"
          @click="mode = 'walk_in'"
        >
          Ambil Nomor Antrian
        </button>

        <button
          type="button"
          class="mode-button"
          :class="{ active: mode === 'booking' }"
          @click="mode = 'booking'"
        >
          Saya Sudah Booking
        </button>
      </section>

      <v-alert
        v-if="errorMessage"
        class="mb-5"
        type="error"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-progress-linear
        v-if="loadingKategori || loadingBooking"
        class="mb-5"
        indeterminate
        color="primary"
      />

      <section v-if="mode === 'walk_in'" class="queue-grid" :class="gridClass">
        <button
          v-for="service in visibleServices"
          :key="service.id"
          type="button"
          class="service-card"
          :class="{ 'is-loading': loadingType === service.type }"
          :disabled="loadingType !== null"
          @click="ambilNomor(service)"
        >
          <div class="card-icon">
            <v-icon size="34">{{ service.icon }}</v-icon>
          </div>

          <h2 class="card-title">
            {{ service.label }}
          </h2>

          <p class="card-desc">
            {{ service.desc }}
          </p>

          <div class="next-number">
            <span>Kode Antrian</span>
            <strong>{{ service.kode }}</strong>
          </div>

          <div class="card-action">
            {{ loadingType === service.type ? "Memproses..." : "Ambil Nomor" }}
          </div>
        </button>
      </section>

      <section v-if="mode === 'booking'" class="booking-panel">
        <div class="booking-search">
          <v-text-field
            v-model="bookingKeyword"
            label="Cari booking"
            placeholder="Masukkan kode booking / nama / nomor HP"
            variant="outlined"
            density="comfortable"
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @keyup.enter="searchBooking"
          />

          <v-btn
            color="primary"
            height="48"
            :loading="loadingBooking"
            @click="searchBooking"
          >
            Cari
          </v-btn>
        </div>

        <div v-if="bookingList.length" class="booking-list">
          <article
            v-for="booking in bookingList"
            :key="booking.id"
            class="booking-item"
          >
            <div class="booking-info">
              <div class="booking-code">
                {{ booking.booking_code }}
              </div>

              <div class="booking-name">
                {{ booking.nama_pasien || booking.pasien?.nama || "-" }}
              </div>

              <div class="booking-meta">
                {{ formatDateTime(booking.appointment_at) }}
                <span v-if="booking.kategori?.nama">
                  · {{ booking.kategori.nama }}
                </span>
              </div>

              <div v-if="booking.no_hp" class="booking-phone">
                {{ booking.no_hp }}
              </div>
            </div>

            <button
              type="button"
              class="booking-checkin"
              :disabled="loadingBookingId === booking.id"
              @click="checkInBooking(booking)"
            >
              {{ loadingBookingId === booking.id ? "Check-in..." : "Check-in" }}
            </button>
          </article>
        </div>

        <div
          v-else-if="bookingSearched && !loadingBooking"
          class="booking-empty"
        >
          Booking tidak ditemukan untuk hari ini.
        </div>
      </section>
    </main>

    <transition name="fade">
      <div v-if="result" class="modal-overlay" @click.self="closeResult">
        <div class="modal-box">
          <p class="result-label">
            {{ result.label }}
          </p>

          <div class="result-number">
            {{ result.kodeNomor }}
          </div>

          <p class="result-time">{{ result.date }} · {{ result.time }}</p>

          <p class="result-note">
            Silakan menunggu sampai nomor Anda dipanggil.
          </p>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeResult">
              Tutup
            </button>

            <button type="button" class="btn-primary" @click="printTicket">
              Cetak
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import antrianService from "@/services/antrian/antrianService";

export default {
  name: "AntrianInput",

  props: {
    tokoId: {
      type: [Number, String],
      default: null,
    },
  },

  data() {
    return {
      logo: new URL("@/assets/logowebsitenew.png", import.meta.url).href,

      mode: "walk_in",

      loadingKategori: false,
      loadingBooking: false,
      loadingType: null,
      loadingBookingId: null,

      errorMessage: "",
      result: null,

      services: [],

      bookingKeyword: "",
      bookingList: [],
      bookingSearched: false,
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
      return this.services.filter((item) => {
        if (item.type === "vip") {
          return this.showVip;
        }

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

  mounted() {
    this.fetchKategori();
  },

  methods: {
    async fetchKategori() {
      this.loadingKategori = true;
      this.errorMessage = "";

      try {
        const response = await antrianService.kategori({
          toko_id: this.activeTokoId,
        });

        const rows = response?.data || [];

        this.services = rows.map((item) => this.normalizeService(item));

        if (!this.services.length) {
          this.errorMessage = "Kategori antrian belum tersedia.";
        }
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil kategori antrian.",
        );
      } finally {
        this.loadingKategori = false;
      }
    },

    normalizeService(item = {}) {
      const kode = String(item.kode || "").toUpperCase();
      const nama = String(item.nama || "").toLowerCase();

      let type = "product";

      if (kode === "T" || nama.includes("treatment")) {
        type = "treatment";
      }

      if (kode === "V" || nama.includes("vip")) {
        type = "vip";
      }

      if (kode === "P" || nama.includes("product")) {
        type = "product";
      }

      return {
        id: item.id,
        type,
        label: item.nama || "-",
        desc: item.deskripsi || "Layanan klinik",
        kode: item.kode || "-",
        icon: item.icon || this.getDefaultIcon(type),
        priority_level: Number(item.priority_level || 0),
      };
    },

    getDefaultIcon(type) {
      if (type === "treatment") return "mdi-spa-outline";
      if (type === "vip") return "mdi-crown-outline";

      return "mdi-shopping-outline";
    },

    async ambilNomor(service) {
      if (this.loadingType) return;

      this.loadingType = service.type;
      this.errorMessage = "";

      try {
        const response = await antrianService.ambilNomor({
          toko_id: this.activeTokoId,
          kategori_id: service.id,
          source_type: "walk_in",
          priority_level: service.priority_level,
        });

        const data = response?.data || {};

        this.result = {
          label: service.label,
          kodeNomor: data.kode_nomor || "-",
          date: this.getNowDate(),
          time: this.getNowTime(),
        };
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil nomor antrian.",
        );
      } finally {
        this.loadingType = null;
      }
    },

    async searchBooking() {
      this.errorMessage = "";
      this.bookingSearched = true;
      this.bookingList = [];

      if (!this.bookingKeyword) {
        this.errorMessage = "Masukkan kode booking, nama, atau nomor HP.";
        return;
      }

      this.loadingBooking = true;

      try {
        const response = await antrianService.cariBookingHariIni({
          toko_id: this.activeTokoId,
          keyword: this.bookingKeyword,
        });

        this.bookingList = response?.data || [];
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mencari data booking.",
        );
      } finally {
        this.loadingBooking = false;
      }
    },

    async checkInBooking(booking) {
      if (!booking?.id) return;

      this.loadingBookingId = booking.id;
      this.errorMessage = "";

      try {
        const response = await antrianService.checkInBooking(booking.id, {
          toko_id: this.activeTokoId,
        });

        const data = response?.data || {};
        const kategori = data.kategori || booking.kategori || {};

        this.result = {
          label: kategori.nama || "Booking",
          kodeNomor: data.kode_nomor || "-",
          date: this.getNowDate(),
          time: this.getNowTime(),
        };

        this.bookingList = this.bookingList.filter(
          (item) => item.id !== booking.id,
        );
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal check-in booking.",
        );
      } finally {
        this.loadingBookingId = null;
      }
    },

    closeResult() {
      this.result = null;
    },

    printTicket() {
      window.print();
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

    formatDateTime(value) {
      if (!value) return "-";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
.antrian-page {
  min-height: 100vh;
  background: #f6f7f9;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2933;
}

.top-banner {
  height: 92px;
  background: linear-gradient(90deg, #d86aa2 0%, #a04678 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  box-shadow: 0 2px 10px rgba(17, 24, 39, 0.12);
}

.top-logo {
  max-height: 78px;
  width: auto;
  object-fit: contain;
}

.content-wrap {
  max-width: 1160px;
  margin: 0 auto;
  padding: 38px 24px 56px;
}

.hero-section {
  text-align: center;
  margin-bottom: 22px;
}

.page-title {
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  margin: 8px 0 0;
  font-size: 17px;
  color: #6b7280;
}

.mode-card {
  max-width: 560px;
  margin: 0 auto 28px;
  padding: 6px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.mode-button {
  height: 46px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #6b7280;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.mode-button.active {
  background: #b5477a;
  color: #ffffff;
}

.queue-grid {
  display: grid;
  gap: 20px;
  justify-content: center;
}

.queue-grid-1 {
  grid-template-columns: minmax(320px, 440px);
}

.queue-grid-2 {
  grid-template-columns: repeat(2, minmax(320px, 420px));
}

.queue-grid-3 {
  grid-template-columns: repeat(3, minmax(280px, 360px));
}

.service-card {
  width: 100%;
  min-height: 300px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  padding: 24px;
  cursor: pointer;
  color: inherit;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}

.service-card:hover:not(:disabled) {
  border-color: #c45b8c;
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.08);
  transform: translateY(-2px);
}

.service-card:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.service-card.is-loading {
  border-color: #c45b8c;
}

.card-icon {
  width: 62px;
  height: 62px;
  border-radius: 16px;
  background: #fdf2f8;
  color: #b5477a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.card-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.card-desc {
  margin: 8px 0 0;
  font-size: 15px;
  color: #6b7280;
}

.next-number {
  margin: 24px 0;
}

.next-number span {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #6b7280;
}

.next-number strong {
  display: block;
  font-size: 42px;
  line-height: 1;
  font-weight: 800;
  color: #111827;
}

.card-action {
  width: 100%;
  min-height: 48px;
  margin-top: auto;
  border-radius: 10px;
  background: #b5477a;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-panel {
  max-width: 780px;
  margin: 0 auto;
}

.booking-search {
  padding: 18px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
}

.booking-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.booking-item {
  padding: 18px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.booking-code {
  font-size: 14px;
  font-weight: 800;
  color: #b5477a;
}

.booking-name {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.booking-meta,
.booking-phone {
  margin-top: 4px;
  font-size: 14px;
  color: #6b7280;
}

.booking-checkin {
  min-width: 120px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: #b5477a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.booking-checkin:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.booking-empty {
  margin-top: 16px;
  padding: 22px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  text-align: center;
  color: #64748b;
  font-weight: 700;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 30;
}

.modal-box {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 30px 26px 24px;
  text-align: center;
  box-shadow: 0 16px 32px rgba(17, 24, 39, 0.18);
}

.result-label {
  margin: 0 0 10px;
  color: #6b7280;
  font-size: 16px;
  font-weight: 600;
}

.result-number {
  white-space: nowrap;
  font-size: 72px;
  line-height: 1;
  font-weight: 800;
  color: #111827;
}

.result-time {
  margin: 14px 0 0;
  color: #4b5563;
  font-size: 15px;
}

.result-note {
  margin: 18px 0 22px;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.5;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  height: 46px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  border: 1px solid #b5477a;
  background: #b5477a;
  color: #ffffff;
}

.btn-secondary {
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1080px) {
  .queue-grid-3 {
    grid-template-columns: repeat(2, minmax(300px, 420px));
  }
}

@media (max-width: 760px) {
  .top-banner {
    height: 88px;
  }

  .top-logo {
    max-height: 58px;
  }

  .content-wrap {
    padding: 28px 16px 42px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 15px;
  }

  .mode-card {
    grid-template-columns: 1fr;
  }

  .queue-grid-1,
  .queue-grid-2,
  .queue-grid-3 {
    grid-template-columns: 1fr;
  }

  .service-card {
    min-height: 260px;
    padding: 22px;
  }

  .card-title {
    font-size: 25px;
  }

  .next-number strong {
    font-size: 38px;
  }

  .booking-search {
    grid-template-columns: 1fr;
  }

  .booking-item {
    align-items: stretch;
    flex-direction: column;
  }

  .booking-checkin {
    width: 100%;
  }

  .modal-actions {
    grid-template-columns: 1fr;
  }

  .result-number {
    font-size: 58px;
  }
}

@media print {
  .top-banner,
  .content-wrap,
  .modal-actions {
    display: none !important;
  }

  .modal-overlay {
    position: static;
    background: #ffffff;
    padding: 0;
  }

  .modal-box {
    max-width: 100%;
    box-shadow: none;
    border-radius: 0;
  }
}
</style>
