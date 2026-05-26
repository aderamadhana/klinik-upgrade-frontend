<template>
  <div class="mb-6">
    <v-divider class="mb-5" />

    <div class="text-subtitle-1 font-weight-bold mb-3">
      Riwayat Transaksi Pasien
    </div>

    <v-data-table
      :headers="headers"
      :items="items"
      item-value="id"
      class="border"
      density="compact"
      no-data-text="Riwayat transaksi belum tersedia"
    >
      <template #item.tindakan_perawat="{ item }">
        <div class="text-body-2" v-html="formatList(item.tindakan_perawat)" />
      </template>

      <template #item.obat="{ item }">
        <div class="text-body-2" v-html="formatList(item.obat)" />
      </template>

      <template #item.catatan="{ item }">
        <div class="text-body-2" style="white-space: pre-line">
          {{ item.catatan || "-" }}
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: "AntrianDokterRiwayatSection",

  props: {
    headers: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    formatList(items) {
      if (!items || !items.length) return "-";

      return `<ul class="ma-0 pl-4">${items
        .map((item) => `<li>${item}</li>`)
        .join("")}</ul>`;
    },
  },
};
</script>
