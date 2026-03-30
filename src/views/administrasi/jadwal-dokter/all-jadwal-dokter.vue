<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Jadwal Dokter</h1>
        <p class="page-subtitle">
          Kelola jadwal dokter yang terdaftar di sistem
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <!-- HEADER ACTION -->
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
          placeholder="Cari dokter..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 260px"
        />
      </v-card-title>

      <!-- TABLE -->
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="formattedDokter"
          :search="search"
          item-value="id_dokter"
          density="compact"
        >
          <template #item.action="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                :to="'/administrasi/karyawan/edit_jadwal/' + item.id_dokter"
              >
                Edit Jadwal
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "JadwalDokterIndex",
  data() {
    return {
      search: "",
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        {
          title: "Jadwal Dokter",
          disabled: false,
          to: "/administrasi/jadwal-dokter",
        },
      ],

      headers: [
        { title: "NAMA", key: "nama" },
        { title: "SENIN", key: "senin" },
        { title: "SELASA", key: "selasa" },
        { title: "RABU", key: "rabu" },
        { title: "KAMIS", key: "kamis" },
        { title: "JUMAT", key: "jumat" },
        { title: "SABTU", key: "sabtu" },
        { title: "MINGGU", key: "minggu" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      // contoh data dokter
      dokter: [
        {
          id_dokter: 1,
          nama: "Dr. Andi",
          start_jadwal: "08:00",
          end_jadwal: "16:00",
        },
        {
          id_dokter: 2,
          nama: "Dr. Sinta",
          start_jadwal: "09:00",
          end_jadwal: "17:00",
        },
      ],

      // contoh data jadwal
      jadwal: [
        { id_dokter: 1, hari: "senin", status: "1" },
        { id_dokter: 1, hari: "selasa", status: "1" },
        { id_dokter: 1, hari: "rabu", status: "0" },
        { id_dokter: 1, hari: "kamis", status: "1" },
        { id_dokter: 1, hari: "jumat", status: "1" },
        { id_dokter: 1, hari: "sabtu", status: "0" },
        { id_dokter: 1, hari: "minggu", status: "0" },

        { id_dokter: 2, hari: "senin", status: "0" },
        { id_dokter: 2, hari: "selasa", status: "1" },
        { id_dokter: 2, hari: "rabu", status: "1" },
        { id_dokter: 2, hari: "kamis", status: "1" },
        { id_dokter: 2, hari: "jumat", status: "1" },
        { id_dokter: 2, hari: "sabtu", status: "1" },
        { id_dokter: 2, hari: "minggu", status: "0" },
      ],
    };
  },

  computed: {
    formattedDokter() {
      const hariList = [
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu",
        "minggu",
      ];

      return this.dokter.map((d) => {
        const row = {
          id_dokter: d.id_dokter,
          nama: d.nama,
        };

        hariList.forEach((hari) => {
          const dataJadwal = this.jadwal.find(
            (j) => j.id_dokter === d.id_dokter && j.hari === hari,
          );

          row[hari] =
            dataJadwal && dataJadwal.status === "1"
              ? `Masuk (${d.start_jadwal} - ${d.end_jadwal})`
              : "Libur";
        });

        return row;
      });
    },
  },
};
</script>
