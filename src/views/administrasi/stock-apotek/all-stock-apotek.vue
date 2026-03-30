<template>
  <div>
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Manajemen Stok Apotek</h1>
        <p class="page-subtitle">
          Kelola data obat, kartu stok, penerimaan, penyesuaian, dan proses stok
          opname
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <!-- ALERT -->
    <v-alert
      v-if="berhasil"
      type="success"
      variant="tonal"
      closable
      class="mb-4"
    >
      <strong>{{ berhasil }}</strong>
    </v-alert>

    <!-- ALERT KHUSUS STOCK OPNAME -->
    <v-alert
      v-if="showStockOpnameNow"
      type="warning"
      variant="tonal"
      border="start"
      class="mb-6"
    >
      Hari ini adalah akhir bulan. Silakan lakukan
      <strong>Stok Opname</strong> untuk memastikan data stok tetap akurat.
    </v-alert>

    <!-- MENU CARDS -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="menu-card" elevation="2">
          <v-card-text class="d-flex align-start ga-4">
            <div class="menu-icon error-soft">
              <v-icon size="28">mdi-pill</v-icon>
            </div>

            <div class="flex-grow-1">
              <div class="menu-title">Data Obat / Alkes / Bahan</div>
              <div class="menu-desc">
                Lihat dan kelola seluruh data item obat, alat kesehatan, dan
                bahan yang tersedia.
              </div>

              <v-btn
                class="mt-4"
                color="error"
                prepend-icon="mdi-arrow-right"
                :href="baseUrl + 'Administrasi/Stok_apotek/list_apotek'"
              >
                Buka Data Master
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="menu-card" elevation="2">
          <v-card-text class="d-flex align-start ga-4">
            <div class="menu-icon grey-soft">
              <v-icon size="28">mdi-cart-outline</v-icon>
            </div>

            <div class="flex-grow-1">
              <div class="menu-title">Pembelian Obat / Alkes / Bahan</div>
              <div class="menu-desc">
                Fitur pembelian digunakan untuk mencatat proses pengadaan barang
                dari supplier.
              </div>

              <v-btn
                class="mt-4"
                color="grey"
                prepend-icon="mdi-lock-outline"
                disabled
              >
                Belum Tersedia
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="menu-card" elevation="2">
          <v-card-text class="d-flex align-start ga-4">
            <div class="menu-icon warning-soft">
              <v-icon size="28">mdi-card-bulleted-outline</v-icon>
            </div>

            <div class="flex-grow-1">
              <div class="menu-title">Kartu Stok</div>
              <div class="menu-desc">
                Pantau pergerakan masuk dan keluar stok untuk setiap item secara
                lebih detail.
              </div>

              <v-btn
                class="mt-4"
                color="warning"
                prepend-icon="mdi-arrow-right"
                :href="baseUrl + 'Administrasi/Stok_apotek/kartu_stock_produk'"
              >
                Lihat Kartu Stok
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" v-if="showStockOpnameNow">
        <v-card class="menu-card opname-card" elevation="3">
          <v-card-text class="d-flex align-start ga-4">
            <div class="menu-icon success-soft">
              <v-icon size="28">mdi-clipboard-check-outline</v-icon>
            </div>

            <div class="flex-grow-1">
              <div class="menu-title">Stok Opname Sekarang</div>
              <div class="menu-desc">
                Lakukan pengecekan fisik stok akhir bulan dan cocokkan dengan
                data sistem.
              </div>

              <v-btn
                class="mt-4"
                color="success"
                prepend-icon="mdi-check-circle-outline"
                :href="baseUrl + 'Administrasi/Stok_apotek/stock_opname'"
              >
                Mulai Stok Opname
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="menu-card" elevation="2">
          <v-card-text class="d-flex align-start ga-4">
            <div class="menu-icon primary-soft">
              <v-icon size="28">mdi-truck-delivery-outline</v-icon>
            </div>

            <div class="flex-grow-1">
              <div class="menu-title">Penerimaan Stok</div>
              <div class="menu-desc">
                Catat barang yang masuk agar stok sistem selalu sesuai dengan
                kondisi aktual.
              </div>

              <v-btn
                class="mt-4"
                color="primary"
                prepend-icon="mdi-arrow-right"
                :href="baseUrl + 'Administrasi/Stok_apotek/stock_opname_produk'"
              >
                Buka Penerimaan
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="menu-card" elevation="2">
          <v-card-text class="d-flex align-start ga-4">
            <div class="menu-icon success-soft">
              <v-icon size="28">mdi-tune-variant</v-icon>
            </div>

            <div class="flex-grow-1">
              <div class="menu-title">Penyesuaian Stok</div>
              <div class="menu-desc">
                Gunakan fitur ini untuk koreksi stok jika ada selisih atau
                penyesuaian khusus.
              </div>

              <v-btn
                class="mt-4"
                color="success"
                prepend-icon="mdi-arrow-right"
                @click="handlePenyesuaianStok"
              >
                Buka Penyesuaian
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- DIALOG AKSES -->
    <v-dialog v-model="dialogAkses" max-width="420">
      <v-card>
        <v-card-title class="text-h6"> Akses Dibatasi </v-card-title>
        <v-card-text>
          Anda tidak memiliki akses untuk membuka fitur
          <strong>Penyesuaian Stok</strong>. Silakan hubungi SPV atau Manager.
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="primary" variant="text" @click="dialogAkses = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "StokApotekMenu",
  data() {
    return {
      baseUrl: window.baseUrl || "/",
      berhasil: "",
      cek_so: [],
      role_id: 1,
      dialogAkses: false,
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        {
          title: "Stok Apotek",
          disabled: false,
          to: "/administrasi/stock-apotek",
        },
      ],
    };
  },

  computed: {
    showStockOpnameNow() {
      const now = new Date();
      const today = now.getDate();
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();

      return (
        lastDayOfMonth === today && (!this.cek_so || this.cek_so.length === 0)
      );
    },
  },

  methods: {
    handlePenyesuaianStok() {
      if (this.role_id === 1) {
        window.location.href =
          this.baseUrl + "Administrasi/Stok_apotek/penyesuaian_stok";
      } else {
        this.dialogAkses = true;
      }
    },
  },
};
</script>

<style scoped>
.menu-card {
  height: 100%;
  border-radius: 16px;
}

.opname-card {
  border: 1px solid rgba(76, 175, 80, 0.35);
}

.menu-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
}

.menu-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
}

.menu-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.error-soft {
  background: rgba(244, 67, 54, 0.12);
  color: #d32f2f;
}

.warning-soft {
  background: rgba(251, 140, 0, 0.12);
  color: #f57c00;
}

.success-soft {
  background: rgba(76, 175, 80, 0.12);
  color: #2e7d32;
}

.primary-soft {
  background: rgba(33, 150, 243, 0.12);
  color: #1565c0;
}

.grey-soft {
  background: rgba(158, 158, 158, 0.12);
  color: #616161;
}
</style>
