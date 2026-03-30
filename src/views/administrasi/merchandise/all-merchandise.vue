<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Voucher</h1>
        <p class="page-subtitle">
          Kelola data voucher yang terdaftar di sistem
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            color="success"
            prepend-icon="mdi-plus"
            :to="'/administrasi/voucher/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari voucher..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 260px"
        />
      </v-card-title>

      <v-card-text>
        <div class="table-responsive">
          <v-data-table
            :headers="headers"
            :items="formattedVouchers"
            :search="search"
            item-value="id"
            density="compact"
            class="responsive-table"
          >
            <template #item.diskon_display="{ item }">
              {{ item.diskon_display }}
            </template>

            <template #item.harga_poin="{ item }">
              {{ formatNumber(item.harga_poin) }}
            </template>

            <template #item.stok_merchant="{ item }">
              {{ formatNumber(item.stok_merchant) }}
            </template>

            <template #item.action="{ item }">
              <div class="d-flex ga-2">
                <v-btn
                  size="small"
                  color="primary"
                  prepend-icon="mdi-pencil"
                  :to="'/administrasi/voucher/edit/' + item.id"
                >
                  Edit
                </v-btn>

                <v-btn
                  size="small"
                  color="error"
                  prepend-icon="mdi-delete"
                  @click="confirmDelete(item)"
                >
                  Hapus
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>

    <!-- Dialog hapus -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6"> Konfirmasi Hapus </v-card-title>

        <v-card-text>
          Yakin ingin menghapus voucher
          <strong>{{ selectedItem?.nama_voucher }}</strong
          >?
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="deleteDialog = false"> Batal </v-btn>
          <v-btn color="error" @click="deleteVoucher"> Hapus </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "VoucherIndex",
  data() {
    return {
      search: "",
      deleteDialog: false,
      selectedItem: null,

      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        { title: "Voucher", disabled: false, to: "/administrasi/voucher" },
      ],

      headers: [
        { title: "NAMA VOUCHER", key: "nama_voucher" },
        { title: "DISKON", key: "diskon_display" },
        { title: "HARGA POIN", key: "harga_poin" },
        { title: "STOK", key: "stok_merchant" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      // dummy data
      vouchers: [
        {
          id: 1,
          nama_voucher: "Voucher Hemat 10%",
          diskon_tipe: "pr",
          diskon: 10,
          harga_poin: 100,
          stok_merchant: 25,
        },
        {
          id: 2,
          nama_voucher: "Voucher Potongan Rp50.000",
          diskon_tipe: "rp",
          diskon: 50000,
          harga_poin: 200,
          stok_merchant: 10,
        },
        {
          id: 3,
          nama_voucher: "Souvenir Special",
          diskon_tipe: "sv",
          diskon: 0,
          harga_poin: 150,
          stok_merchant: 8,
        },
      ],
    };
  },

  computed: {
    formattedVouchers() {
      return this.vouchers.map((v) => ({
        ...v,
        diskon_display: this.formatDiskon(v),
      }));
    },
  },

  methods: {
    formatDiskon(v) {
      if (v.diskon_tipe === "pr") {
        return `${v.diskon}%`;
      }

      if (v.diskon_tipe === "rp") {
        return this.formatRupiah(v.diskon);
      }

      return "Souvenir";
    },

    formatRupiah(value) {
      const number = Number(value || 0);
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number);
    },

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    deleteVoucher() {
      // sesuaikan dengan flow backend/API kamu
      console.log("hapus voucher", this.selectedItem);
      this.deleteDialog = false;
    },
  },
};
</script>
