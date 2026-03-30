<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Jadwal Perawat</h1>
        <p class="page-subtitle">
          Kelola jadwal perawat yang terdaftar di sistem
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
            :to="'/administrasi/karyawan/add_jadwal'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari perawat..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 260px"
        />
      </v-card-title>

      <v-card-text class="pa-0 pa-sm-4">
        <div class="table-scroll-wrapper">
          <v-data-table
            :headers="headers"
            :items="formattedNursex"
            :search="search"
            item-value="id_perawat"
            density="compact"
            class="jadwal-table"
          >
            <template #item.jabatanx="{ item }">
              <v-chip
                size="small"
                class="font-weight-medium text-white"
                :class="
                  item.jabatanx === 'Beautician'
                    ? 'chip-beautician'
                    : 'chip-jabatan-lain'
                "
              >
                {{ item.jabatanx }}
              </v-chip>
            </template>

            <template
              v-for="day in dayKeys"
              #[`item.${day}`]="{ item }"
              :key="day"
            >
              <v-chip
                size="small"
                class="font-weight-medium text-white chip-hari"
                :class="item[day].status === '1' ? 'chip-masuk' : 'chip-libur'"
              >
                <!-- Tampilan pendek di mobile, lengkap di desktop -->
                <span class="d-none d-md-inline">{{ item[day].text }}</span>
                <span class="d-inline d-md-none">
                  {{ item[day].status === "1" ? "✓" : "✗" }}
                </span>
              </v-chip>
            </template>

            <template #item.action="{ item }">
              <v-btn
                color="primary"
                size="small"
                icon="mdi-pencil"
                variant="text"
                class="d-md-none"
                :to="'/administrasi/karyawan/edit_jadwal/' + item.id_perawat"
              />
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                class="d-none d-md-flex"
                :to="'/administrasi/karyawan/edit_jadwal/' + item.id_perawat"
              >
                Edit Jadwal
              </v-btn>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "JadwalPerawatIndex",
  data() {
    return {
      search: "",
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        {
          title: "Jadwal Perawat",
          disabled: false,
          to: "/administrasi/karyawan/jadwal-perawat",
        },
      ],

      headers: [
        { title: "NAMA", key: "nama", minWidth: "120px" },
        { title: "JABATAN", key: "jabatanx", minWidth: "100px" },
        { title: "SEN", key: "senin", minWidth: "60px", align: "center" },
        { title: "SEL", key: "selasa", minWidth: "60px", align: "center" },
        { title: "RAB", key: "rabu", minWidth: "60px", align: "center" },
        { title: "KAM", key: "kamis", minWidth: "60px", align: "center" },
        { title: "JUM", key: "jumat", minWidth: "60px", align: "center" },
        { title: "SAB", key: "sabtu", minWidth: "60px", align: "center" },
        { title: "MIN", key: "minggu", minWidth: "60px", align: "center" },
        {
          title: "",
          key: "action",
          sortable: false,
          minWidth: "50px",
          align: "end",
        },
      ],

      dayKeys: ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"],

      nursex: [
        {
          id_perawat: 1,
          nama: "Sinta Aulia",
          jabatanx: "Beautician",
          start_jadwal: "08:00",
          end_jadwal: "16:00",
        },
        {
          id_perawat: 2,
          nama: "Rani Putri",
          jabatanx: "Nurse",
          start_jadwal: "09:00",
          end_jadwal: "17:00",
        },
      ],

      jadwal: [
        { id_perawat: 1, hari: "senin", status: "1" },
        { id_perawat: 1, hari: "selasa", status: "1" },
        { id_perawat: 1, hari: "rabu", status: "0" },
        { id_perawat: 1, hari: "kamis", status: "1" },
        { id_perawat: 1, hari: "jumat", status: "1" },
        { id_perawat: 1, hari: "sabtu", status: "0" },
        { id_perawat: 1, hari: "minggu", status: "0" },

        { id_perawat: 2, hari: "senin", status: "1" },
        { id_perawat: 2, hari: "selasa", status: "0" },
        { id_perawat: 2, hari: "rabu", status: "1" },
        { id_perawat: 2, hari: "kamis", status: "1" },
        { id_perawat: 2, hari: "jumat", status: "1" },
        { id_perawat: 2, hari: "sabtu", status: "1" },
        { id_perawat: 2, hari: "minggu", status: "0" },
      ],
    };
  },

  computed: {
    formattedNursex() {
      return this.nursex.map((d) => {
        const row = {
          id_perawat: d.id_perawat,
          nama: d.nama,
          jabatanx: d.jabatanx,
        };

        this.dayKeys.forEach((hari) => {
          const dataJadwal = this.jadwal.find(
            (j) => j.id_perawat === d.id_perawat && j.hari === hari,
          );

          const isMasuk = dataJadwal && dataJadwal.status === "1";

          row[hari] = {
            status: isMasuk ? "1" : "0",
            text: isMasuk ? `${d.start_jadwal}-${d.end_jadwal}` : "Libur",
          };
        });

        return row;
      });
    },
  },
};
</script>

<style scoped>
/* Wrapper scroll horizontal — kunci responsivitas */
.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Biarkan tabel menyesuaikan konten, bukan dipaksa lebar */
:deep(.jadwal-table) {
  white-space: nowrap;
  width: 100%;
}

/* Chip hari lebih compact */
.chip-hari {
  min-width: 32px;
  justify-content: center;
}

.chip-beautician {
  background-color: #35c6d4 !important;
}

.chip-jabatan-lain {
  background-color: pink !important;
  color: white !important;
}

.chip-masuk {
  background-color: #4caf50 !important;
}

.chip-libur {
  background-color: #d4356a !important;
}
</style>
