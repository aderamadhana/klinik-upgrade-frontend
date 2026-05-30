<template>
  <div>
    <div class="page-header mb-4">
      <div>
        <h1 class="page-title">Master Member Tier</h1>
        <div class="page-subtitle">
          Kelola tingkatan member berdasarkan minimal spending, diskon, dan
          point rate.
        </div>
      </div>

      <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mt-2" />
    </div>

    <v-card class="master-card" elevation="1">
      <v-card-text>
        <div
          class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4"
        >
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Cari tier"
            placeholder="Kode / nama tier"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            style="max-width: 280px"
            @update:model-value="handleSearch"
          />

          <v-btn
            color="success"
            prepend-icon="mdi-plus"
            @click="$router.push('/master/member-tier/add')"
          >
            Entry Data
          </v-btn>
        </div>

        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          density="compact"
          item-value="id"
          class="master-table"
          :items-per-page="pagination.per_page"
          hide-default-footer
        >
          <template #item.no="{ index }">
            {{ rowNumber(index) }}
          </template>

          <template #item.minimal_spending="{ item }">
            {{ formatCurrency(item.minimal_spending) }}
          </template>

          <template #item.diskon_persen="{ item }">
            {{ formatPercent(item.diskon_persen) }}
          </template>

          <template #item.point_rate="{ item }">
            {{ formatPointRate(item.point_rate) }}
          </template>

          <template #item.is_active="{ item }">
            <v-chip
              :color="Number(item.is_active) === 1 ? 'success' : 'grey'"
              size="small"
            >
              {{ Number(item.is_active) === 1 ? "Aktif" : "Nonaktif" }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex align-center justify-center ga-2">
              <v-btn
                size="small"
                color="primary"
                prepend-icon="mdi-pencil"
                @click="$router.push(`/master/member-tier/edit/${item.id}`)"
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

          <template #no-data>
            <div class="py-6 text-center text-medium-emphasis">
              Data member tier belum tersedia.
            </div>
          </template>
        </v-data-table>

        <div
          class="d-flex flex-wrap align-center justify-space-between ga-3 mt-4"
        >
          <div class="text-caption text-medium-emphasis">
            Total data: {{ pagination.total }}
          </div>

          <v-pagination
            v-model="pagination.page"
            :length="pagination.last_page"
            density="comfortable"
            total-visible="5"
            @update:model-value="fetchData"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6">Hapus Member Tier</v-card-title>
        <v-card-text>
          Yakin ingin menghapus tier
          <strong>{{ selectedItem?.nama }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Batal</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteData">
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import memberTierService from "@/services/master/memberTierService";

export default {
  name: "AllMemberTier",

  data() {
    return {
      loading: false,
      deleting: false,
      deleteDialog: false,
      selectedItem: null,
      search: "",
      searchTimer: null,

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Member Tier", disabled: false, to: "/master/member-tier" },
      ],

      headers: [
        { title: "No", key: "no", width: 70, sortable: false },
        { title: "Kode", key: "kode", width: 120 },
        { title: "Nama Tier", key: "nama" },
        { title: "Minimal Spending", key: "minimal_spending", align: "end" },
        { title: "Diskon", key: "diskon_persen", align: "end", width: 120 },
        { title: "Point Rate", key: "point_rate", align: "end", width: 140 },
        { title: "Urutan", key: "sort_order", align: "center", width: 100 },
        { title: "Status", key: "is_active", align: "center", width: 120 },
        {
          title: "Aksi",
          key: "actions",
          align: "end",
          sortable: false,
          width: 110,
        },
      ],

      items: [],

      pagination: {
        page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
      },

      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      this.loading = true;

      try {
        const response = await memberTierService.getAll({
          page: this.pagination.page,
          per_page: this.pagination.per_page,
          search: this.search || "",
        });

        const paginator = response.data;

        this.items = paginator.data || [];
        this.pagination.total = paginator.total || 0;
        this.pagination.last_page = paginator.last_page || 1;
        this.pagination.page = paginator.current_page || 1;
        this.pagination.per_page = paginator.per_page || 15;
      } catch (error) {
        this.showSnackbar(
          error?.response?.data?.message || "Gagal mengambil data member tier",
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      clearTimeout(this.searchTimer);

      this.searchTimer = setTimeout(() => {
        this.pagination.page = 1;
        this.fetchData();
      }, 400);
    },

    rowNumber(index) {
      return (this.pagination.page - 1) * this.pagination.per_page + index + 1;
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    formatPercent(value) {
      return `${Number(value || 0).toFixed(2)}%`;
    },

    formatPointRate(value) {
      return Number(value || 0).toFixed(4);
    },

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async deleteData() {
      if (!this.selectedItem?.id) return;

      this.deleting = true;

      try {
        const response = await memberTierService.delete(this.selectedItem.id);

        this.showSnackbar(response.message || "Member tier berhasil dihapus");
        this.deleteDialog = false;
        this.selectedItem = null;
        this.fetchData();
      } catch (error) {
        this.showSnackbar(
          error?.response?.data?.message || "Gagal menghapus member tier",
          "error",
        );
      } finally {
        this.deleting = false;
      }
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>
