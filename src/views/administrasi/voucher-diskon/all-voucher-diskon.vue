<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Voucher Diskon</h1>
        <p class="page-subtitle">
          Kelola direct voucher dan generate voucher dalam satu halaman
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <v-btn
          color="success"
          prepend-icon="mdi-plus"
          :href="baseUrl + 'Administrasi/Diskon/create'"
        >
          Tambah Voucher
        </v-btn>

        <v-text-field
          v-model="search"
          placeholder="Cari voucher..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 280px"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div class="voucher-full-tabs mb-4">
          <div
            class="voucher-full-tab"
            :class="{ active: activeTab === 'direct' }"
            @click="activeTab = 'direct'"
          >
            Direct Voucher
          </div>

          <div
            class="voucher-full-tab"
            :class="{ active: activeTab === 'generate' }"
            @click="activeTab = 'generate'"
          >
            Generate Voucher
          </div>
        </div>

        <div v-if="activeTab === 'direct'" class="table-responsive">
          <v-data-table
            :headers="headers"
            :items="filteredDirectVouchers"
            :loading="loadingDirect"
            item-value="id"
            density="compact"
            class="responsive-table"
          >
            <template #item.no="{ index }">
              {{ index + 1 }}
            </template>

            <template #item.action="{ item }">
              <div class="d-flex ga-2">
                <v-btn
                  size="small"
                  color="primary"
                  prepend-icon="mdi-pencil"
                  :href="baseUrl + 'Administrasi/Diskon/edit/' + item.id"
                >
                  Edit
                </v-btn>

                <v-btn
                  size="small"
                  color="error"
                  prepend-icon="mdi-delete"
                  @click="confirmDelete(item, 'direct')"
                >
                  Hapus
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>

        <div v-else class="table-responsive">
          <v-data-table
            :headers="headers"
            :items="filteredGenerateVouchers"
            :loading="loadingGenerate"
            item-value="id"
            density="compact"
            class="responsive-table"
          >
            <template #item.no="{ index }">
              {{ index + 1 }}
            </template>

            <template #item.action="{ item }">
              <div class="d-flex ga-2">
                <v-btn
                  size="small"
                  color="primary"
                  prepend-icon="mdi-pencil"
                  :href="baseUrl + 'Administrasi/Diskon/edit/' + item.id"
                >
                  Edit
                </v-btn>

                <v-btn
                  size="small"
                  color="error"
                  prepend-icon="mdi-delete"
                  @click="confirmDelete(item, 'generate')"
                >
                  Hapus
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>

    <!-- DIALOG DELETE -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6"> Konfirmasi Hapus </v-card-title>

        <v-card-text>
          Yakin ingin menghapus voucher
          <strong>{{ selectedItem?.nama }}</strong
          >?
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="deleteDialog = false"> Batal </v-btn>
          <v-btn color="error" @click="deleteVoucher"> Hapus </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "DiskonIndex",
  data() {
    return {
      baseUrl: window.baseUrl || "/",
      activeTab: "direct",
      search: "",
      deleteDialog: false,
      selectedItem: null,
      selectedType: null,

      loadingDirect: false,
      loadingGenerate: false,

      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        {
          title: "Voucher Diskon",
          disabled: false,
          to: "/administrasi/diskon",
        },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "5%" },
        { title: "NAMA", key: "nama" },
        { title: "DESKRIPSI", key: "deskripsi" },
        { title: "JENIS", key: "opsi" },
        { title: "KODE", key: "kode_voucher" },
        { title: "BERLAKU DI", key: "berlaku", sortable: false },
        { title: "AKSI", key: "action", sortable: false, width: "15%" },
      ],

      directVouchers: [
        {
          id: 1,
          no: 1,
          nama: "Voucher Member Baru",
          deskripsi: "Diskon khusus untuk member baru",
          opsi: "Direct Voucher",
          kode_voucher: "NEWMEMBER10",
          berlaku: "Semua Cabang",
        },
        {
          id: 2,
          no: 2,
          nama: "Voucher Facial",
          deskripsi: "Potongan harga treatment facial tertentu",
          opsi: "Direct Voucher",
          kode_voucher: "FACIAL25",
          berlaku: "Cabang Malang",
        },
        {
          id: 3,
          no: 3,
          nama: "Voucher Weekend",
          deskripsi: "Promo akhir pekan untuk layanan tertentu",
          opsi: "Direct Voucher",
          kode_voucher: "WEEKEND15",
          berlaku: "Cabang Surabaya",
        },
      ],

      generateVouchers: [
        {
          id: 101,
          no: 1,
          nama: "Voucher Giveaway",
          deskripsi: "Voucher hasil generate untuk event giveaway",
          opsi: "Generate Voucher",
          kode_voucher: "GIVEAWAY001",
          berlaku: "Online / Semua Cabang",
        },
        {
          id: 102,
          no: 2,
          nama: "Voucher Influencer",
          deskripsi: "Voucher generate khusus campaign influencer",
          opsi: "Generate Voucher",
          kode_voucher: "INF2026A",
          berlaku: "Cabang Bandung",
        },
        {
          id: 103,
          no: 3,
          nama: "Voucher Ramadhan",
          deskripsi: "Voucher generate campaign Ramadhan",
          opsi: "Generate Voucher",
          kode_voucher: "RAMADHAN50",
          berlaku: "Cabang Bekasi",
        },
      ],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    filteredDirectVouchers() {
      return this.filterItems(this.directVouchers);
    },
    filteredGenerateVouchers() {
      return this.filterItems(this.generateVouchers);
    },
  },

  methods: {
    filterItems(items) {
      if (!this.search) return items;

      const keyword = this.search.toLowerCase();

      return items.filter((item) =>
        [item.nama, item.deskripsi, item.opsi, item.kode_voucher, item.berlaku]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(keyword)),
      );
    },

    confirmDelete(item, type) {
      this.selectedItem = item;
      this.selectedType = type;
      this.deleteDialog = true;
    },

    deleteVoucher() {
      if (!this.selectedItem) return;

      if (this.selectedType === "direct") {
        this.directVouchers = this.directVouchers.filter(
          (v) => v.id !== this.selectedItem.id,
        );
      } else if (this.selectedType === "generate") {
        this.generateVouchers = this.generateVouchers.filter(
          (v) => v.id !== this.selectedItem.id,
        );
      }

      this.showSnackbar("Voucher berhasil dihapus", "success");
      this.deleteDialog = false;
      this.selectedItem = null;
      this.selectedType = null;
    },

    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>
