<template>
  <div>
    <div class="page-header mb-4">
      <div>
        <h1 class="page-title">Master Poin Rule</h1>
        <div class="page-subtitle">
          Kelola aturan perhitungan poin dari transaksi pelanggan.
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
            label="Cari rule"
            placeholder="Nama rule / keterangan"
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
            @click="$router.push('/master/poin-rule/add')"
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

          <template #item.nominal_per_poin="{ item }">
            {{ formatCurrency(item.nominal_per_poin) }}
          </template>

          <template #item.minimal_transaksi="{ item }">
            {{ formatCurrency(item.minimal_transaksi) }}
          </template>

          <template #item.periode="{ item }">
            {{ formatDate(item.berlaku_mulai) }} -
            {{
              item.berlaku_sampai
                ? formatDate(item.berlaku_sampai)
                : "Seterusnya"
            }}
          </template>

          <template #item.is_berlaku_kelipatan="{ item }">
            <v-chip
              :color="
                Number(item.is_berlaku_kelipatan) === 1 ? 'primary' : 'grey'
              "
              size="small"
            >
              {{
                Number(item.is_berlaku_kelipatan) === 1 ? "Kelipatan" : "Tidak"
              }}
            </v-chip>
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
                @click="$router.push(`/master/poin-rule/edit/${item.id}`)"
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
              Data poin rule belum tersedia.
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
        <v-card-title class="text-h6">Hapus Poin Rule</v-card-title>
        <v-card-text>
          Yakin ingin menghapus rule
          <strong>{{ selectedItem?.nama_rule }}</strong
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
import poinRuleService from "@/services/master/poinRuleService";

export default {
  name: "AllPoinRule",

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
        { title: "Member Poin Rule", disabled: false, to: "/master/poin-rule" },
      ],

      headers: [
        { title: "No", key: "no", width: 70, sortable: false },
        { title: "Nama Rule", key: "nama_rule" },
        { title: "Nominal / Poin", key: "nominal_per_poin", align: "end" },
        { title: "Minimal Transaksi", key: "minimal_transaksi", align: "end" },
        { title: "Periode", key: "periode", width: 220, sortable: false },
        {
          title: "Kelipatan",
          key: "is_berlaku_kelipatan",
          align: "center",
          width: 120,
        },
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
        const response = await poinRuleService.getAll({
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
          error?.response?.data?.message || "Gagal mengambil data poin rule",
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

    formatDate(value) {
      if (!value) return "-";

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value));
    },

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async deleteData() {
      if (!this.selectedItem?.id) return;

      this.deleting = true;

      try {
        const response = await poinRuleService.delete(this.selectedItem.id);

        this.showSnackbar(response.message || "Poin rule berhasil dihapus");
        this.deleteDialog = false;
        this.selectedItem = null;
        this.fetchData();
      } catch (error) {
        this.showSnackbar(
          error?.response?.data?.message || "Gagal menghapus poin rule",
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
