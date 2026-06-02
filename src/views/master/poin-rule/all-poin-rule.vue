<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Poin Rule</h1>
        <p class="page-subtitle">
          Kelola aturan perhitungan poin dari transaksi pelanggan.
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
            :to="'/master/poin-rule/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari nama rule atau keterangan..."
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
          loading-text="Memuat data poin rule..."
          no-data-text="Data poin rule belum tersedia"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #item.no="{ index }">
            {{ rowNumber(index) }}
          </template>

          <template #item.nama_rule="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.nama_rule || "-" }}
              </div>

              <div
                v-if="item.keterangan"
                class="text-caption text-medium-emphasis"
              >
                {{ item.keterangan }}
              </div>
            </div>
          </template>

          <template #item.nominal_per_poin="{ item }">
            <div class="text-right font-weight-medium">
              {{ formatCurrency(item.nominal_per_poin) }}
            </div>
          </template>

          <template #item.minimal_transaksi="{ item }">
            <div class="text-right font-weight-medium">
              {{ formatCurrency(item.minimal_transaksi) }}
            </div>
          </template>

          <template #item.periode="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ formatDate(item.berlaku_mulai) }}
              </div>

              <div class="text-caption text-medium-emphasis">
                sampai
                {{
                  item.berlaku_sampai
                    ? formatDate(item.berlaku_sampai)
                    : "Seterusnya"
                }}
              </div>
            </div>
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

          <template #item.action="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                :to="'/master/poin-rule/edit/' + item.id"
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
                Data poin rule belum tersedia
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan poin rule baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Hapus Poin Rule
        </v-card-title>

        <v-divider />

        <v-card-text>
          <p class="mb-2">Yakin ingin menghapus data poin rule ini?</p>

          <v-alert type="warning" rounded="lg">
            <strong>{{ selectedItem?.nama_rule || "-" }}</strong>
            <br />
            Data akan dihapus secara soft delete.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            :disabled="loadingDelete"
            @click="deleteDialog = false"
          >
            Batal
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            :loading="loadingDelete"
            @click="confirmDelete"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import poinRuleService from "@/services/master/poinRuleService";

export default {
  name: "AllPoinRule",

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
          title: "Poin Rule",
          disabled: false,
          to: "/master/poin-rule",
        },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "NAMA RULE", key: "nama_rule" },
        {
          title: "NOMINAL / POIN",
          key: "nominal_per_poin",
          align: "end",
          width: "170px",
        },
        {
          title: "MINIMAL TRANSAKSI",
          key: "minimal_transaksi",
          align: "end",
          width: "180px",
        },
        {
          title: "PERIODE",
          key: "periode",
          sortable: false,
          width: "220px",
        },
        {
          title: "KELIPATAN",
          key: "is_berlaku_kelipatan",
          align: "center",
          width: "130px",
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
        const response = await poinRuleService.getAll({
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
          this.getErrorMessage(error, "Gagal memuat data poin rule"),
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

    formatDate(value) {
      if (!value) return "-";

      const dateValue = String(value).slice(0, 10);
      const parts = dateValue.split("-");

      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);

        if (year && month && day) {
          return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(year, month - 1, day));
        }
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "-";
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    },

    openDeleteDialog(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedItem?.id) {
        this.showSnackbar("Data poin rule tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        const response = await poinRuleService.delete(this.selectedItem.id);

        this.showSnackbar(
          response?.message || "Data poin rule berhasil dihapus",
          "success",
        );

        this.deleteDialog = false;
        this.selectedItem = null;

        await this.fetchData();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data poin rule"),
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
