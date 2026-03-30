<template>
  <div class="display-antrian-page">
    <!-- HEADER -->
    <div class="top-banner">
      <img :src="logo" alt="MS Glow Aesthetics" class="top-logo" />
    </div>

    <!-- CONTENT -->
    <div
      class="content-wrap"
      :style="{ paddingTop: tokoId === 8 ? '140px' : '180px' }"
    >
      <div class="title-wrap">
        <span class="page-title"> ANTRIAN DALAM PENANGANAN </span>
      </div>

      <div
        class="queue-row"
        :class="{ 'queue-row-2': !showVip, 'queue-row-3': showVip }"
      >
        <!-- PRODUCT -->
        <div class="queue-col">
          <div class="queue-card text-center">
            <div class="queue-card-header">Product</div>

            <div class="queue-card-body">
              <span class="queue-number">
                {{ productDisplay }}
              </span>
            </div>

            <div class="queue-card-footer">
              {{ productPreparation }}
            </div>
          </div>
        </div>

        <!-- TREATMENT -->
        <div class="queue-col">
          <div class="queue-card text-center">
            <div class="queue-card-header">Treatment</div>

            <div class="queue-card-body">
              <span class="queue-number">
                {{ treatmentDisplay }}
              </span>
            </div>

            <div class="queue-card-footer">
              {{ treatmentPreparation }}
            </div>
          </div>
        </div>

        <!-- VIP -->
        <div v-if="showVip" class="queue-col">
          <div class="queue-card text-center">
            <div class="queue-card-header">VIP</div>

            <div class="queue-card-body">
              <span class="queue-number">
                {{ vipDisplay }}
              </span>
            </div>

            <div class="queue-card-footer">
              {{ vipPreparation }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DisplayAntrian",
  data() {
    return {
      logo: new URL("@/assets/logowebsitenew.png", import.meta.url).href,
      tokoId: 2,
      baseUrl: window.location.origin + "/",

      intervalId: null,

      antrian: {
        product: [],
        treatment: [],
        vip: [],
      },
    };
  },
  computed: {
    showVip() {
      return this.tokoId === 2 || this.tokoId === 8;
    },

    productAntri() {
      return this.antrian?.product?.[0]?.antri || "";
    },
    treatmentAntri() {
      return this.antrian?.treatment?.[0]?.antri || "";
    },
    vipAntri() {
      return this.antrian?.vip?.[0]?.antri || "";
    },

    productDisplay() {
      return this.productAntri || "-";
    },
    treatmentDisplay() {
      return this.treatmentAntri || "-";
    },
    vipDisplay() {
      return this.vipAntri || "-";
    },

    productPreparation() {
      return `Persiapan : P-${this.getNextNumber(this.productAntri, 2)}`;
    },
    treatmentPreparation() {
      return `Persiapan : T-${this.getNextNumber(this.treatmentAntri, 2)}`;
    },
    vipPreparation() {
      return `Persiapan : V-${this.getNextNumber(this.vipAntri, 2)}`;
    },
  },
  mounted() {
    this.fetchAntrian();
    this.intervalId = setInterval(() => {
      this.fetchAntrian();
    }, 5000);
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  methods: {
    async fetchAntrian() {
      try {
        const response = await axios.get(this.baseUrl + "Antrian/get_antrian", {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        });

        this.antrian = response.data || {
          product: [],
          treatment: [],
          vip: [],
        };
      } catch (error) {
        console.error("Gagal mengambil data antrian:", error);
      }
    },

    getNextNumber(value, prefixLength = 2) {
      if (!value || typeof value !== "string") {
        return 1;
      }

      const raw = parseInt(value.slice(prefixLength), 10);
      return isNaN(raw) ? 1 : raw + 1;
    },
  },
};
</script>

<style scoped>
.display-antrian-page {
  min-height: 100vh;
  background: url("/assets/bg-clinic.jpg") no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  font-family: Arial, Helvetica, sans-serif;
}

.top-banner {
  width: 100%;
  height: 142px;
  background: linear-gradient(90deg, #d86aa2 0%, #a04678 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-logo {
  max-height: 150px;
  width: auto;
  object-fit: contain;
}

.content-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.title-wrap {
  text-align: center;
  margin-bottom: 18px;
}

.page-title {
  font-size: 2rem;
  color: black;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
}

.queue-row {
  display: flex;
  justify-content: center;
  gap: 28px;
  flex-wrap: wrap;
}

.queue-row-2 .queue-col {
  width: 500px;
}

.queue-row-3 .queue-col {
  width: 320px;
}

.queue-card {
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  overflow: hidden;
}

.queue-card-header {
  background-color: #ba678e;
  color: white;
  font-size: 2rem;
  text-align: center;
  padding: 12px 16px;
  font-weight: 500;
}

.queue-card-body {
  padding: 0;
  min-height: 220px;
  background: #efefef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.queue-number {
  font-size: 10rem;
  line-height: 1;
  color: #212529;
  font-weight: 400;
}

.queue-card-footer {
  background-color: #ba678e;
  color: white !important;
  font-size: 2rem;
  text-align: center;
  padding: 12px 16px;
  font-weight: 500;
}

.text-center {
  text-align: center;
}

@media (max-width: 1200px) {
  .queue-row-2 .queue-col,
  .queue-row-3 .queue-col {
    width: 100%;
    max-width: 500px;
  }

  .content-wrap {
    padding-top: 90px !important;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .queue-card-header,
  .queue-card-footer {
    font-size: 1.5rem;
  }

  .queue-number {
    font-size: 6rem;
  }

  .queue-card-body {
    min-height: 160px;
  }
}
</style>
