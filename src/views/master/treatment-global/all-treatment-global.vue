<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Treatment</h1>
        <p class="page-subtitle">
          Kelola data treatment global dan konfigurasi per cabang
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
            prepend-icon="mdi-plus"
            color="success"
            :to="'/master/treatment-global/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari treatment..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 260px"
        />
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="treatmentsForTable"
          :search="search"
          item-value="id"
          density="compact"
        >
          <template v-slot:item.is_ppn_label="{ item }">
            <v-chip
              size="small"
              :color="item.is_ppn ? 'success' : 'grey'"
              variant="tonal"
            >
              {{ item.is_ppn_label }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              size="small"
              :color="item.is_delete ? 'error' : 'success'"
              variant="tonal"
            >
              {{ item.is_delete ? "Deleted" : "Aktif" }}
            </v-chip>
          </template>

          <template v-slot:item.action="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                :to="'/master/treatment-global/edit/' + item.id"
              >
                Edit
              </v-btn>

              <v-btn
                color="info"
                size="small"
                prepend-icon="mdi-eye"
                @click="detailTreatment(item)"
              >
                Detail
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDetail" max-width="900">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Detail Treatment
        </v-card-title>

        <v-divider />

        <v-card-text>
          <pre class="mb-0">{{ formattedDetail }}</pre>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="dialogDetail = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "AllMasterTreatment",
  data() {
    return {
      search: "",
      dialogDetail: false,
      selectedItem: null,

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Treatment", disabled: false, to: "/master/treatment-global" },
      ],

      tokoOptions: [
        { id: 1, nama: "Malang" },
        { id: 2, nama: "Surabaya" },
        { id: 3, nama: "Bandung" },
        { id: 4, nama: "Sidoarjo" },
        { id: 5, nama: "Bekasi" },
        { id: 6, nama: "Medan" },
        { id: 7, nama: "Depok" },
        { id: 8, nama: "Yogyakarta" },
      ],

      headers: [
        { title: "KODE", key: "kode" },
        { title: "NAMA TREATMENT", key: "nama" },
        { title: "KATEGORI", key: "kategori_sales" },
        { title: "DURASI", key: "durasi_label" },
        { title: "PPN", key: "is_ppn_label" },
        { title: "CABANG", key: "jumlah_cabang" },
        { title: "RANGE TARIF", key: "range_tarif" },
        { title: "STATUS", key: "status" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      treatments: [
        {
          id: 1,
          legacy_id: 1,
          kode: "TR-116",
          nama: "FACIAL BARBIE LIGHT",
          kategori_sales: "LOW",
          unit_id: 7,
          tipe_id: 1,
          waktu: 60,
          is_ppn: 1,
          is_delete: 0,
          sort_order: 1,
          toko_configs: [
            {
              id: 1,
              toko_id: 1,
              harga_terendah: 125000,
              tarif: 245000,
              biaya_modal: 0,
              kode_accurate: "TR-116",
              is_referral: 0,
              diskon_referral: 0,
              diskon_fee: 0,
              tarif_dokter: 0,
              tarif_beautician: 12500,
              presentase_tarif_dokter: 0,
              presentase_tarif_dokter_sp: 0,
              flat_tarif_dokter: 0,
              flat_tarif_dokter_sp: 0,
              insentif_use: "Percent",
              insentif_use_sp: "Flat",
              is_active: 1,
              is_delete: 0,
              sort_order: 1,
            },
            {
              id: 2,
              toko_id: 2,
              harga_terendah: 135000,
              tarif: 265000,
              biaya_modal: 0,
              kode_accurate: "TR-116-SBY",
              is_referral: 0,
              diskon_referral: 0,
              diskon_fee: 0,
              tarif_dokter: 0,
              tarif_beautician: 15000,
              presentase_tarif_dokter: 0,
              presentase_tarif_dokter_sp: 0,
              flat_tarif_dokter: 0,
              flat_tarif_dokter_sp: 0,
              insentif_use: "Percent",
              insentif_use_sp: "Flat",
              is_active: 1,
              is_delete: 0,
              sort_order: 2,
            },
          ],
        },
        {
          id: 2,
          legacy_id: 2,
          kode: "TR-201",
          nama: "LASER TONING",
          kategori_sales: "HIGH",
          unit_id: 7,
          tipe_id: 2,
          waktu: 45,
          is_ppn: 1,
          is_delete: 0,
          sort_order: 2,
          toko_configs: [
            {
              id: 3,
              toko_id: 1,
              harga_terendah: 450000,
              tarif: 750000,
              biaya_modal: 100000,
              kode_accurate: "TR-201",
              is_referral: 1,
              diskon_referral: 50000,
              diskon_fee: 25000,
              tarif_dokter: 50000,
              tarif_beautician: 0,
              presentase_tarif_dokter: 0,
              presentase_tarif_dokter_sp: 0,
              flat_tarif_dokter: 50000,
              flat_tarif_dokter_sp: 75000,
              insentif_use: "Flat",
              insentif_use_sp: "Flat",
              is_active: 1,
              is_delete: 0,
              sort_order: 1,
            },
          ],
        },
      ],
    };
  },

  computed: {
    treatmentsForTable() {
      return this.treatments.map((item) => {
        const activeConfigs = item.toko_configs.filter(
          (config) => Number(config.is_delete) === 0,
        );

        const tarifList = activeConfigs.map((config) =>
          Number(config.tarif || 0),
        );
        const minTarif = tarifList.length ? Math.min(...tarifList) : 0;
        const maxTarif = tarifList.length ? Math.max(...tarifList) : 0;

        return {
          ...item,
          durasi_label: `${item.waktu || 0} menit`,
          is_ppn_label: item.is_ppn ? "Ya" : "Tidak",
          jumlah_cabang: activeConfigs.length,
          range_tarif:
            minTarif === maxTarif
              ? this.formatRupiah(minTarif)
              : `${this.formatRupiah(minTarif)} - ${this.formatRupiah(maxTarif)}`,
        };
      });
    },

    formattedDetail() {
      return JSON.stringify(this.selectedItem, null, 2);
    },
  },

  methods: {
    getTokoName(tokoId) {
      const toko = this.tokoOptions.find(
        (item) => Number(item.id) === Number(tokoId),
      );
      return toko ? toko.nama : "-";
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    detailTreatment(item) {
      this.selectedItem = {
        ...item,
        toko_configs: item.toko_configs.map((config) => ({
          ...config,
          toko_nama: this.getTokoName(config.toko_id),
        })),
      };
      this.dialogDetail = true;
    },
  },
};
</script>
