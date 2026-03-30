<template>
  <div class="antrian-page">
    <!-- TOP HEADER -->
    <div class="top-banner">
      <img :src="logo" alt="MS Glow Aesthetics" class="top-logo" />
    </div>

    <!-- CONTENT -->
    <div class="content-wrap">
      <div class="title-wrap">
        <h1 class="page-title">PILIH ANTRIAN</h1>
      </div>

      <div
        class="queue-row"
        :class="{ 'queue-row-2': !showVip, 'queue-row-3': showVip }"
      >
        <!-- PRODUCT -->
        <div class="queue-col">
          <div class="queue-card">
            <div class="queue-card-header">PRODUCT</div>

            <form @submit.prevent="submitAntrian('product')">
              <div class="queue-card-body">
                <button type="submit" class="number-trigger">
                  <input
                    type="text"
                    class="queue-number-input"
                    :value="nextProduct"
                    readonly
                  />
                </button>
              </div>

              <div class="queue-card-footer">
                <button type="submit" class="btn-cetak">CETAK</button>
              </div>
            </form>
          </div>
        </div>

        <!-- TREATMENT -->
        <div class="queue-col">
          <div class="queue-card">
            <div class="queue-card-header">TREATMENT</div>

            <form @submit.prevent="submitAntrian('treatment')">
              <div class="queue-card-body">
                <button type="submit" class="number-trigger">
                  <input
                    type="text"
                    class="queue-number-input"
                    :value="nextTreatment"
                    readonly
                  />
                </button>
              </div>

              <div class="queue-card-footer">
                <button type="submit" class="btn-cetak">CETAK</button>
              </div>
            </form>
          </div>
        </div>

        <!-- VIP -->
        <div v-if="showVip" class="queue-col">
          <div class="queue-card">
            <div class="queue-card-header">VIP</div>

            <form @submit.prevent="submitAntrian('vip')">
              <div class="queue-card-body">
                <button type="submit" class="number-trigger">
                  <input
                    type="text"
                    class="queue-number-input"
                    :value="nextVip"
                    readonly
                  />
                </button>
              </div>

              <div class="queue-card-footer">
                <button type="submit" class="btn-cetak">CETAK</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AntrianPage",
  data() {
    return {
      logo: new URL("@/assets/logowebsitenew.png", import.meta.url).href,
      tokoId: 2,
      noProduct: 0,
      noTreatment: 0,
      noVip: 0,
      baseUrl: window.location.origin + "/",
    };
  },
  computed: {
    nextProduct() {
      return this.noProduct + 1;
    },
    nextTreatment() {
      return this.noTreatment + 1;
    },
    nextVip() {
      return this.noVip + 1;
    },
    showVip() {
      return this.tokoId === 2 || this.tokoId === 8;
    },
  },
  methods: {
    submitAntrian(type) {
      let action = "";
      let nomor = "";

      if (type === "product") {
        action = this.baseUrl + "Antrian/antrian_product";
        nomor = this.nextProduct;
      } else if (type === "treatment") {
        action = this.baseUrl + "Antrian/antrian_treatment";
        nomor = this.nextTreatment;
      } else if (type === "vip") {
        action = this.baseUrl + "Antrian/antrian_vip";
        nomor = this.nextVip;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = action;

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "input[no]";
      input.value = nomor;

      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    },
  },
};
</script>

<style scoped>
.antrian-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  background-image: url("/assets/pattern-bg.png");
  background-repeat: repeat;
  font-family: Arial, Helvetica, sans-serif;
}

/* HEADER ATAS */
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

/* CONTENT */
.content-wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding-top: 165px;
  padding-left: 20px;
  padding-right: 20px;
}

.title-wrap {
  text-align: center;
  margin-bottom: 28px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #000;
  letter-spacing: 0.2px;
}

/* GRID */
.queue-row {
  display: flex;
  justify-content: center;
  gap: 28px;
  flex-wrap: wrap;
}

.queue-row-2 .queue-col {
  width: 495px;
}

.queue-row-3 .queue-col {
  width: 320px;
}

.queue-col {
  flex: 0 0 auto;
}

/* CARD */
.queue-card {
  background: #fff;
  border: 1px solid #d7d7d7;
  border-radius: 2px;
  overflow: hidden;
}

.queue-card-header {
  height: 50px;
  background: #ba678e;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.queue-card-body {
  background: #efefef;
  border-top: 1px solid #d7d7d7;
  border-bottom: 1px solid #d7d7d7;
  padding: 0;
}

.number-trigger {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
}

.queue-number-input {
  width: 100%;
  height: 200px;
  border: 0;
  outline: none;
  background: #efefef;
  color: #000;
  text-align: center;
  font-size: 150px;
  font-weight: 400;
  line-height: 1;
  padding: 0;
  margin: 0;
}

.queue-number-input[readonly] {
  opacity: 1;
}

.queue-card-footer {
  background: #f3f3f3;
  text-align: center;
  padding: 10px 0;
}

.btn-cetak {
  min-width: 153px;
  height: 34px;
  background: #ba678e;
  color: #fff;
  border: 0;
  border-radius: 3px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cetak:hover {
  background: #a8597d;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .queue-row-2 .queue-col,
  .queue-row-3 .queue-col {
    width: 100%;
    max-width: 495px;
  }

  .content-wrap {
    padding-top: 90px;
  }
}

@media (max-width: 768px) {
  .top-banner {
    height: 110px;
  }

  .top-logo {
    max-height: 78px;
  }

  .page-title {
    font-size: 24px;
  }

  .queue-number-input {
    height: 160px;
    font-size: 110px;
  }
}
</style>
