<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Member Tier</h1>
        <p class="page-subtitle">
          Kelola tingkatan member berdasarkan minimal spending, diskon, dan
          point rate.
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
            :to="'/master/member-tier/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari kode atau nama tier..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 300px"
          @keyup.enter="handleSearch"
          @click:clear="handleClearSearch"
        />
      </v-card-title>

      <v-card-text>
        <v-data-table-server
          :page="page"
          :items-per-page="itemsPerPage"
          :headers="headers"
          :items="items"
          :items-length="totalItems"
          :loading="loading"
          :items-per-page-options="itemsPerPageOptions"
          item-value="id"
          density="compact"
          loading-text="Memuat data member tier..."
          no-data-text="Data member tier belum tersedia"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #item.no="{ index }">
            {{ rowNumber(index) }}
          </template>

          <template #item.kode="{ item }">
            <span class="font-weight-medium">
              {{ item.kode || "-" }}
            </span>
          </template>

          <template #item.nama="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.nama || "-" }}
              </div>

              <div
                v-if="getItemDescription(item)"
                class="text-caption text-medium-emphasis"
              >
                {{ getItemDescription(item) }}
              </div>
            </div>
          </template>

          <template #item.minimal_spending="{ item }">
            <div class="text-right font-weight-medium">
              {{ formatCurrency(item.minimal_spending) }}
            </div>
          </template>

          <template #item.diskon_persen="{ item }">
            <div class="text-right">
              {{ formatPercent(item.diskon_persen) }}
            </div>
          </template>

          <template #item.point_rate="{ item }">
            <div class="text-right">
              {{ formatPointRate(item.point_rate) }}
            </div>
          </template>

          <template #item.sort_order="{ item }">
            <div class="text-center">
              {{ item.sort_order ?? "-" }}
            </div>
          </template>

          <template #item.is_active="{ item }">
            <v-chip
              :color="Number(item.is_active) === 1 ? 'success' : 'grey'"
              size="small"
            >
              {{ Number(item.is_active) === 1 ? "Aktif" : "Nonaktif" }}
            </v-chip>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                :to="'/master/member-tier/edit/' + item.id"
              >
                Edit
              </v-btn>

              <v-btn
                color="error"
                size="small"
                prepend-icon="mdi-delete"
                @click="openDeleteDialog(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-6">
              <div class="text-subtitle-2 mb-1">
                Data member tier belum tersedia
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan member tier baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <confirm-delete-dialog
      v-model="deleteDialog"
      :loading="loadingDelete"
      title="Konfirmasi Hapus"
      subtitle="Data member tier akan dihapus secara soft delete."
      question="Yakin ingin menghapus data member tier ini?"
      :item-title="selectedItem?.nama || '-'"
      warning-text="Data member tier akan dihapus secara soft delete."
      @confirm="confirmDelete"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import memberTierService from "@/services/master/memberTierService";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";

export default {
  name: "AllMemberTier",
  components: {
    ConfirmDeleteDialog,
  },
  data() {
    return {
      search: "",
      loading: false,
      loadingDelete: false,
      dialogDetail: false,
      deleteDialog: false,
      selectedItem: null,

      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      fetchTimer: null,

      itemsPerPageOptions: [
        { value: 10, title: "10" },
        { value: 25, title: "25" },
        { value: 50, title: "50" },
        { value: 100, title: "100" },
      ],

      breadcrumbs: [
        { title: "Master", disabled: true },
        {
          title: "Member Tier",
          disabled: false,
          to: "/master/member-tier",
        },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "KODE", key: "kode", width: "120px" },
        { title: "NAMA TIER", key: "nama" },
        {
          title: "MINIMAL SPENDING",
          key: "minimal_spending",
          align: "end",
          width: "180px",
        },
        {
          title: "DISKON",
          key: "diskon_persen",
          align: "end",
          width: "120px",
        },
        {
          title: "POINT RATE",
          key: "point_rate",
          align: "end",
          width: "140px",
        },
        {
          title: "URUTAN",
          key: "sort_order",
          align: "center",
          width: "100px",
        },
        {
          title: "STATUS",
          key: "is_active",
          align: "center",
          width: "120px",
        },
        {
          title: "ACTION",
          key: "action",
          sortable: false,
          align: "end",
          width: "240px",
        },
      ],

      items: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  mounted() {
    this.fetchData();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchData() {
      this.loading = true;

      try {
        const response = await memberTierService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.items = rows;
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.items = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data member tier"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueFetchData() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchData();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchData();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchData();
    },

    handleSearch() {
      this.page = 1;
      this.fetchData();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchData();
    },

    extractRows(response) {
      if (Array.isArray(response)) {
        return response;
      }

      if (Array.isArray(response?.data)) {
        return response.data;
      }

      if (Array.isArray(response?.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response?.items)) {
        return response.items;
      }

      return [];
    },

    extractMeta(response) {
      if (response?.meta) {
        return response.meta;
      }

      if (response?.data?.meta) {
        return response.data.meta;
      }

      if (
        response?.current_page ||
        response?.per_page ||
        response?.total ||
        response?.last_page
      ) {
        return {
          current_page: response.current_page,
          per_page: response.per_page,
          total: response.total,
          last_page: response.last_page,
        };
      }

      if (
        response?.data?.current_page ||
        response?.data?.per_page ||
        response?.data?.total ||
        response?.data?.last_page
      ) {
        return {
          current_page: response.data.current_page,
          per_page: response.data.per_page,
          total: response.data.total,
          last_page: response.data.last_page,
        };
      }

      return {
        current_page: this.page,
        per_page: this.itemsPerPage,
        total: 0,
        last_page: 1,
      };
    },

    rowNumber(index) {
      return (Number(this.page) - 1) * Number(this.itemsPerPage) + index + 1;
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    formatPercent(value) {
      return `${Number(value || 0).toFixed(2)}%`;
    },

    formatPointRate(value) {
      return Number(value || 0).toFixed(4);
    },

    getItemDescription(item) {
      return item?.catatan || item?.deskripsi || item?.keterangan || "";
    },

    openDeleteDialog(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedItem?.id) {
        this.showSnackbar("Data member tier tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        const response = await memberTierService.delete(this.selectedItem.id);

        this.showSnackbar(
          response?.message || "Data member tier berhasil dihapus",
          "success",
        );

        this.deleteDialog = false;
        this.selectedItem = null;

        await this.fetchData();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data member tier"),
          "error",
        );
      } finally {
        this.loadingDelete = false;
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },

    getErrorMessage(error, fallbackMessage) {
      const response = error?.response?.data;

      if (response?.message) return response.message;

      if (response?.error) return response.error;

      if (response?.errors) {
        const firstKey = Object.keys(response.errors)[0];

        if (firstKey && Array.isArray(response.errors[firstKey])) {
          return response.errors[firstKey][0];
        }
      }

      return fallbackMessage;
    },
  },
};
</script>
