<template>
  <div class="page-wrap">
    <div class="page-header d-flex justify-space-between align-start mb-6">
      <div>
        <h1 class="page-title">Pembayaran Registrasi</h1>
        <p class="page-subtitle">
          Proses pembayaran untuk registrasi layanan yang sudah difinalisasi
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <!-- INFO REGISTRASI -->
    <v-card rounded="xl" elevation="2" class="mb-6">
      <v-card-text class="pa-6">
        <div class="section-head mb-4">
          <div class="section-title">
            <v-icon class="mr-2" color="primary"
              >mdi-clipboard-account-outline</v-icon
            >
            Informasi Registrasi
          </div>
          <div class="section-subtitle">
            Data registrasi yang akan dibayarkan
          </div>
        </div>

        <v-row dense>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="registrasi.no_registrasi"
              label="No. Registrasi"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="registrasi.tanggal"
              label="Tanggal"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="registrasi.pasien"
              label="Pasien"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="registrasi.dokter"
              label="Dokter"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="registrasi.sumber"
              label="Sumber"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="registrasi.jenis_transaksi"
              label="Jenis Transaksi"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>
        </v-row>

        <div class="status-row mt-4">
          <div class="d-flex align-center ga-3 flex-wrap">
            <div class="text-body-2 text-medium-emphasis">
              Status Registrasi
            </div>
            <v-chip
              :color="getStatusColor(registrasi.status_registrasi)"
              variant="flat"
              size="large"
            >
              {{ formatStatus(registrasi.status_registrasi) }}
            </v-chip>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-btn
              variant="text"
              color="secondary"
              prepend-icon="mdi-printer-outline"
              @click="printInvoice"
            >
              Print Preview
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- RINCIAN TAGIHAN -->
    <v-card rounded="xl" elevation="2" class="mb-6">
      <v-card-text class="pa-6">
        <div class="section-head mb-4">
          <div class="section-title">
            <v-icon class="mr-2" color="primary"
              >mdi-format-list-bulleted</v-icon
            >
            Rincian Tagihan
          </div>
          <div class="section-subtitle">Detail layanan dan nominal final</div>
        </div>

        <v-table class="billing-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Layanan / Item</th>
              <th>Kategori</th>
              <th>Qty</th>
              <th class="text-right">Harga</th>
              <th class="text-right">Diskon</th>
              <th class="text-right">Referral</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in billingItems" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.nama }}</td>
              <td>{{ item.kategori }}</td>
              <td>{{ item.qty }}</td>
              <td class="text-right">Rp {{ formatNumber(item.harga) }}</td>
              <td class="text-right">
                Rp {{ formatNumber(item.diskon_nominal) }}
              </td>
              <td class="text-right">Rp {{ formatNumber(item.referral) }}</td>
              <td class="text-right font-weight-bold">
                Rp {{ formatNumber(item.subtotal) }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- PEMBAYARAN -->
    <v-card rounded="xl" elevation="2" class="mb-6">
      <v-card-text class="pa-6">
        <div class="section-head mb-4">
          <div class="section-title">
            <v-icon class="mr-2" color="primary">mdi-cash-register</v-icon>
            Proses Pembayaran
          </div>
          <div class="section-subtitle">Lengkapi informasi pembayaran</div>
        </div>

        <v-form ref="formRef" v-model="isFormValid">
          <v-row dense>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="payment.no_invoice"
                label="No. Invoice"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-receipt-text"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="payment.metode_bayar"
                label="Metode Bayar"
                :items="metodeBayarList"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-credit-card-outline"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="payment.status_bayar"
                label="Status Bayar"
                :items="statusBayarList"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-check-decagram-outline"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="payment.tanggal_bayar"
                label="Tanggal Bayar"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-check"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="payment.diskon_global"
                label="Diskon Global"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-sale"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="payment.deposit"
                label="Pemakaian Deposit"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-wallet-outline"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="payment.nominal_bayar"
                label="Nominal Dibayar"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="payment.tipe_pelunasan"
                label="Tipe Pelunasan"
                :items="tipePelunasanList"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash-check"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="payment.catatan"
                label="Catatan Pembayaran"
                rows="3"
                auto-grow
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- RINGKASAN TOTAL -->
    <v-card rounded="xl" elevation="2">
      <v-card-text class="pa-6">
        <div class="section-head mb-4">
          <div class="section-title">
            <v-icon class="mr-2" color="primary"
              >mdi-calculator-variant-outline</v-icon
            >
            Ringkasan Pembayaran
          </div>
          <div class="section-subtitle">Perhitungan akhir tagihan</div>
        </div>

        <v-row dense>
          <v-col cols="12" md="3">
            <div class="summary-box">
              <div class="summary-label">Subtotal</div>
              <div class="summary-value">
                Rp {{ formatNumber(subtotalTagihan) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="summary-box">
              <div class="summary-label">Potongan Global + Deposit</div>
              <div class="summary-value text-error">
                Rp {{ formatNumber(totalPotongan) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="summary-box">
              <div class="summary-label">Nominal Dibayar</div>
              <div class="summary-value">
                Rp {{ formatNumber(payment.nominal_bayar) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="summary-box">
              <div class="summary-label">
                {{ sisaTagihan > 0 ? "Sisa Tagihan" : "Kembalian" }}
              </div>
              <div
                class="summary-value"
                :class="sisaTagihan > 0 ? 'text-error' : 'text-success'"
              >
                Rp {{ formatNumber(Math.abs(sisaTagihan)) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12">
            <div class="summary-final">
              <div>
                <div class="summary-final-label">
                  Total Akhir yang Harus Dibayar
                </div>
                <div class="summary-final-note">
                  Nilai final setelah diskon global dan pemakaian deposit
                </div>
              </div>

              <div class="summary-final-value">
                Rp {{ formatNumber(totalAkhirBayar) }}
              </div>
            </div>
          </v-col>
        </v-row>

        <div class="action-bar">
          <v-btn
            variant="text"
            color="secondary"
            prepend-icon="mdi-arrow-left"
            @click="$router.back()"
          >
            Kembali
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-content-save"
            :loading="loadingDraft"
            :disabled="loadingDraft || loadingSubmit"
            @click="saveDraftPayment"
          >
            Simpan Draft Pembayaran
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-cash-register"
            :loading="loadingSubmit"
            :disabled="loadingSubmit || loadingDraft"
            @click="submitPayment"
          >
            Proses Pembayaran
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "PembayaranRegistrasiPage",

  data() {
    return {
      isFormValid: false,
      loadingDraft: false,
      loadingSubmit: false,

      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        { title: "Registrasi", disabled: false, to: "/resepsionis/registrasi" },
        { title: "Pembayaran Registrasi", disabled: true },
      ],

      registrasi: {
        id: 1001,
        no_registrasi: "REG-20260408-0001",
        tanggal: "2026-04-08",
        pasien: "Budi Santoso - 3276010101010001",
        dokter: "dr. Andi Saputra",
        sumber: "Pelanggan Lama",
        jenis_transaksi: "Umum",
        status_registrasi: "menunggu_pembayaran",
      },

      billingItems: [
        {
          id: 1,
          nama: "Facial Glow",
          kategori: "Treatment",
          qty: 1,
          harga: 150000,
          diskon_nominal: 0,
          referral: 0,
          subtotal: 150000,
        },
        {
          id: 2,
          nama: "Cream Siang",
          kategori: "Penjualan",
          qty: 1,
          harga: 120000,
          diskon_nominal: 0,
          referral: 0,
          subtotal: 120000,
        },
        {
          id: 3,
          nama: "Cream Malam",
          kategori: "Penjualan",
          qty: 1,
          harga: 135000,
          diskon_nominal: 10000,
          referral: 0,
          subtotal: 125000,
        },
      ],

      payment: {
        no_invoice: "INV-20260408-0001",
        metode_bayar: "Cash",
        status_bayar: "Lunas",
        tanggal_bayar: this.getToday(),
        diskon_global: 0,
        deposit: 0,
        nominal_bayar: 0,
        tipe_pelunasan: "Sekali Bayar",
        catatan: "",
      },

      metodeBayarList: [
        "Cash",
        "Debit",
        "Kredit",
        "Transfer",
        "QRIS",
        "Deposit",
      ],
      statusBayarList: ["Lunas", "Parsial", "Piutang"],
      tipePelunasanList: ["Sekali Bayar", "Cicilan", "Partial Payment"],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => (v !== null && v !== "") || "Field ini wajib diisi",
      },
    };
  },

  computed: {
    subtotalTagihan() {
      return this.billingItems.reduce(
        (sum, item) => sum + Number(item.subtotal || 0),
        0,
      );
    },

    totalPotongan() {
      return (
        Number(this.payment.diskon_global || 0) +
        Number(this.payment.deposit || 0)
      );
    },

    totalAkhirBayar() {
      return Math.max(this.subtotalTagihan - this.totalPotongan, 0);
    },

    sisaTagihan() {
      return (
        Number(this.totalAkhirBayar || 0) -
        Number(this.payment.nominal_bayar || 0)
      );
    },
  },

  methods: {
    getToday() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    formatStatus(status) {
      const map = {
        draft: "Draft",
        terdaftar: "Terdaftar",
        proses_layanan: "Proses Layanan",
        menunggu_pembayaran: "Menunggu Pembayaran",
        lunas: "Lunas",
        batal: "Batal",
      };
      return map[status] || status;
    },

    getStatusColor(status) {
      const map = {
        draft: "grey",
        terdaftar: "info",
        proses_layanan: "warning",
        menunggu_pembayaran: "primary",
        lunas: "success",
        batal: "error",
      };
      return map[status] || "grey";
    },

    validateBusinessRules() {
      if (Number(this.payment.nominal_bayar || 0) < 0) {
        this.showSnackbar("Nominal bayar tidak valid", "error");
        return false;
      }

      if (Number(this.payment.diskon_global || 0) < 0) {
        this.showSnackbar("Diskon global tidak valid", "error");
        return false;
      }

      if (Number(this.payment.deposit || 0) < 0) {
        this.showSnackbar("Deposit tidak valid", "error");
        return false;
      }

      if (
        this.payment.status_bayar === "Lunas" &&
        Number(this.payment.nominal_bayar || 0) < this.totalAkhirBayar
      ) {
        this.showSnackbar(
          "Status Lunas tidak boleh jika nominal bayar masih kurang",
          "error",
        );
        return false;
      }

      if (
        this.payment.status_bayar === "Parsial" &&
        Number(this.payment.nominal_bayar || 0) >= this.totalAkhirBayar
      ) {
        this.showSnackbar(
          "Status Parsial tidak cocok jika pembayaran sudah mencukupi",
          "error",
        );
        return false;
      }

      return true;
    },

    async saveDraftPayment() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Lengkapi field wajib pembayaran", "error");
        return;
      }

      if (!this.validateBusinessRules()) return;

      this.loadingDraft = true;

      try {
        const payload = {
          registrasi_id: this.registrasi.id,
          status: "draft_pembayaran",
          payment: this.payment,
          subtotal_tagihan: this.subtotalTagihan,
          total_potongan: this.totalPotongan,
          total_akhir_bayar: this.totalAkhirBayar,
        };

        console.log("SAVE DRAFT PAYMENT:", payload);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.showSnackbar("Draft pembayaran berhasil disimpan", "success");
      } finally {
        this.loadingDraft = false;
      }
    },

    async submitPayment() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Lengkapi field wajib pembayaran", "error");
        return;
      }

      if (!this.validateBusinessRules()) return;

      this.loadingSubmit = true;

      try {
        const payload = {
          registrasi_id: this.registrasi.id,
          billing_items: this.billingItems,
          payment: this.payment,
          subtotal_tagihan: this.subtotalTagihan,
          total_potongan: this.totalPotongan,
          total_akhir_bayar: this.totalAkhirBayar,
          sisa_tagihan: this.sisaTagihan > 0 ? this.sisaTagihan : 0,
          kembalian: this.sisaTagihan < 0 ? Math.abs(this.sisaTagihan) : 0,
        };

        console.log("SUBMIT PAYMENT:", payload);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        this.registrasi.status_registrasi =
          this.payment.status_bayar === "Lunas"
            ? "lunas"
            : "menunggu_pembayaran";

        this.showSnackbar("Pembayaran berhasil diproses", "success");

        // next:
        // this.$router.push(`/resepsionis/registrasi/hasil/${this.registrasi.id}`)
      } finally {
        this.loadingSubmit = false;
      }
    },

    printInvoice() {
      this.showSnackbar("Preview invoice belum dihubungkan ke printer", "info");
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },
  },
};
</script>

<style scoped>
.page-wrap {
  padding: 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.15;
  margin: 0;
  color: #1f2937;
}

.page-subtitle {
  margin-top: 8px;
  margin-bottom: 0;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
  color: #7c3aed;
}

.section-subtitle {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.billing-table th,
.billing-table td {
  white-space: nowrap;
}

.summary-box {
  border-radius: 18px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border: 1px solid rgba(251, 146, 60, 0.2);
  height: 100%;
}

.summary-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 8px;
}

.summary-value {
  font-size: 26px;
  font-weight: 900;
  color: #111827;
}

.summary-final {
  margin-top: 6px;
  border-radius: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ef4444, #db2777);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.summary-final-label {
  font-size: 14px;
  opacity: 0.92;
}

.summary-final-note {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.82;
}

.summary-final-value {
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .summary-final {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .page-wrap {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .status-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-bar {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .summary-value {
    font-size: 22px;
  }

  .summary-final-value {
    font-size: 28px;
    white-space: normal;
  }
}
</style>
