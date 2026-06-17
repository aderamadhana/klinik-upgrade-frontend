<template>
  <div class="mt-3">
    <v-alert type="info" density="compact" border="start" class="mb-4">
      Nurse / beautician bersifat opsional dan dipilih untuk setiap treatment.
    </v-alert>

    <v-expand-transition>
      <v-card
        v-if="!layananState.ada_treatment"
        variant="flat"
        class="border mb-4"
        rounded="lg"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="warning" variant="tonal" size="40">
              <v-icon size="21">mdi-alert-outline</v-icon>
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Treatment belum diaktifkan
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Aktifkan layanan treatment pada tahap pilih layanan untuk mulai
                menambahkan tindakan.
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <template v-if="layananState.ada_treatment">
      <v-card variant="flat" class="border mb-4" rounded="lg">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div>
              <div class="text-h6 font-weight-bold">Daftar Treatment</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                {{ treatmentCount }} treatment dipilih · Atur tindakan,
                pelaksana, dan jumlah pada setiap baris.
              </div>
            </div>

            <v-btn
              color="success"
              variant="flat"
              prepend-icon="mdi-plus"
              class="text-none"
              :disabled="!activeTokoId"
              @click="addItem"
            >
              Tambah Treatment
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-alert
        v-if="!activeTokoId"
        type="warning"
        density="comfortable"
        border="start"
        class="mb-4"
      >
        Cabang belum terpilih. Treatment dan nurse / beautician akan tersedia
        setelah cabang aktif dipilih.
      </v-alert>

      <v-alert
        v-if="errorMessage"
        type="error"
        density="comfortable"
        border="start"
        class="mb-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-card
        v-for="(item, index) in localTreatment.items"
        :key="item.__key"
        variant="outlined"
        rounded="lg"
        class="mb-4"
      >
        <v-card-item class="px-4 py-3">
          <template #prepend>
            <v-avatar color="success" variant="tonal" size="38">
              <span class="text-subtitle-2 font-weight-bold">
                {{ index + 1 }}
              </span>
            </v-avatar>
          </template>

          <v-card-title class="text-subtitle-1 font-weight-bold">
            {{ item.nama_tindakan || `Treatment ${index + 1}` }}
          </v-card-title>

          <v-card-subtitle class="text-body-2 mt-1">
            <template v-if="item.perawat_nama">
              Pelaksana: {{ item.perawat_nama }}
            </template>
            <template v-else> Pilih tindakan dan pelaksana treatment </template>
          </v-card-subtitle>

          <template #append>
            <v-tooltip
              :text="
                localTreatment.items.length === 1
                  ? 'Minimal satu baris treatment'
                  : 'Hapus treatment'
              "
              location="top"
            >
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  color="error"
                  variant="text"
                  icon="mdi-delete-outline"
                  size="small"
                  :disabled="localTreatment.items.length === 1"
                  @click="removeItem(index)"
                />
              </template>
            </v-tooltip>
          </template>
        </v-card-item>

        <v-divider />

        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" lg="6">
              <v-autocomplete
                :model-value="item.treatment_toko_id || item.tindakan_id"
                label="Nama Tindakan"
                :placeholder="
                  activeTokoId
                    ? 'Cari atau pilih treatment'
                    : 'Pilih cabang terlebih dahulu'
                "
                :items="tindakanOptions"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-format-list-bulleted"
                :loading="loadingTreatment"
                :disabled="!activeTokoId"
                clearable
                hide-details="auto"
                menu-icon="mdi-chevron-down"
                @update:model-value="onTindakanChange(index, $event)"
              >
                <template #message>
                  Data treatment difilter berdasarkan cabang aktif.
                </template>

                <template #no-data>
                  <div class="pa-4 text-body-2 text-medium-emphasis">
                    Tidak ada treatment pada cabang aktif.
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12" md="8" lg="4">
              <v-autocomplete
                :model-value="item.perawat_id"
                label="Nurse / Beautician (Opsional)"
                :placeholder="
                  item.tindakan_id
                    ? 'Pilih pelaksana treatment'
                    : 'Pilih treatment terlebih dahulu'
                "
                :items="staffOptions"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-heart-outline"
                :loading="loadingStaff"
                :disabled="!activeTokoId || !item.tindakan_id"
                clearable
                hide-details="auto"
                menu-icon="mdi-chevron-down"
                @update:model-value="onStaffChange(index, $event)"
              >
                <template #item="{ props: itemProps, item: option }">
                  <v-list-item
                    v-bind="itemProps"
                    :title="getStaffItemTitle(option)"
                    :subtitle="getStaffItemSubtitle(option)"
                  />
                </template>

                <template #no-data>
                  <div class="pa-4 text-body-2 text-medium-emphasis">
                    Tidak ada nurse / beautician aktif di cabang ini.
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12" md="4" lg="2">
              <v-text-field
                :model-value="item.jumlah"
                label="Jumlah"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-counter"
                hide-details="auto"
                @update:model-value="updateItemField(index, 'jumlah', $event)"
              />
            </v-col>
          </v-row>

          <v-row dense class="mt-2">
            <v-col cols="12" sm="6">
              <v-sheet
                color="grey-lighten-5"
                border
                rounded="lg"
                class="pa-3 h-100"
              >
                <div class="d-flex align-center ga-3">
                  <v-avatar color="grey" variant="tonal" size="36">
                    <v-icon size="20">mdi-cash</v-icon>
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Harga Satuan
                    </div>
                    <div class="text-subtitle-1 font-weight-bold mt-1">
                      {{ formatRupiah(item.harga) }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6">
              <v-sheet
                color="green-lighten-5"
                border
                rounded="lg"
                class="pa-3 h-100"
              >
                <div class="d-flex align-center justify-space-between ga-3">
                  <div class="d-flex align-center ga-3">
                    <v-avatar color="success" variant="tonal" size="36">
                      <v-icon size="20">mdi-calculator-variant-outline</v-icon>
                    </v-avatar>

                    <div>
                      <div class="text-caption text-medium-emphasis">
                        Subtotal
                      </div>
                      <div class="text-h6 font-weight-bold text-success mt-1">
                        {{ formatRupiah(item.total) }}
                      </div>
                    </div>
                  </div>

                  <v-chip
                    v-if="item.tindakan_id"
                    color="success"
                    variant="tonal"
                    size="small"
                  >
                    {{ item.jumlah }} × {{ formatRupiah(item.harga) }}
                  </v-chip>
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card color="success" variant="tonal" rounded="lg" class="mt-4">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div class="d-flex align-center ga-3">
              <v-avatar color="success" variant="flat" size="42">
                <v-icon size="22">mdi-cash-multiple</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Total Treatment
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Akumulasi {{ treatmentCount }} treatment yang dipilih
                </div>
              </div>
            </div>

            <div class="text-h5 font-weight-bold text-success">
              Rp {{ formatCurrency(totalTreatment) }}
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-expand-transition>
        <v-card
          v-if="validationMessages.length"
          variant="flat"
          class="border mt-4"
          rounded="lg"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="error" variant="tonal" size="38">
                <v-icon size="20">mdi-alert-circle-outline</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-2 font-weight-bold text-error">
                  Data treatment belum lengkap
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Lengkapi informasi berikut sebelum melanjutkan.
                </div>
              </div>
            </div>

            <div class="d-flex flex-column ga-2">
              <v-alert
                v-for="(message, messageIndex) in validationMessages"
                :key="messageIndex"
                type="warning"
                density="compact"
                border="start"
              >
                {{ message }}
              </v-alert>
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
    </template>
  </div>
</template>

<script>
import referenceService from "@/services/referenceService";

export default {
  name: "TreatmentSection",

  props: {
    form: {
      type: Object,
      required: true,
    },
    tindakanList: {
      type: Array,
      default: () => [],
    },
    formatNumber: {
      type: Function,
      required: false,
      default: null,
    },
  },

  emits: ["update-treatment"],

  data() {
    return {
      loadingTreatment: false,
      loadingStaff: false,
      errorMessage: "",
      apiTreatmentList: [],
      staffOptions: [],
      localTreatment: this.normalizeTreatmentState(this.form?.treatment),
      fetchTimer: null,
      isHydrating: false,
    };
  },

  computed: {
    activeTokoId() {
      return (
        this.form?.toko_id ||
        this.form?.tokoId ||
        localStorage.getItem("selected_toko_id") ||
        null
      );
    },

    activeDate() {
      return (
        this.form?.tanggal_kunjungan ||
        this.form?.tanggal ||
        new Date().toISOString().slice(0, 10)
      );
    },

    layananState() {
      return {
        ada_konsultasi: false,
        channel_konsultasi: "",
        ada_treatment: false,
        ada_penjualan: false,
        route_treatment: "",
        ...(this.form?.layanan || {}),
      };
    },

    rawTreatmentList() {
      return this.apiTreatmentList.length
        ? this.apiTreatmentList
        : this.tindakanList;
    },

    tindakanOptions() {
      return this.rawTreatmentList.map((item) => this.mapTreatmentOption(item));
    },

    selectedItems() {
      return (this.localTreatment.items || []).filter(
        (item) => item.tindakan_id,
      );
    },

    totalTreatment() {
      return (this.localTreatment.items || []).reduce(
        (sum, item) => sum + Number(item.total || 0),
        0,
      );
    },

    treatmentCount() {
      return this.selectedItems.length;
    },

    needNurseStation() {
      return this.selectedItems.some((item) => item.perlu_tindakan_perawat);
    },

    routeTreatment() {
      if (!this.treatmentCount) return "";
      return this.needNurseStation ? "nurse_station" : "dokter";
    },

    validationMessages() {
      const messages = [];

      if (!this.layananState.ada_treatment) return messages;

      if (!this.selectedItems.length) {
        messages.push("Minimal satu treatment harus dipilih.");
      }

      (this.localTreatment.items || []).forEach((item, index) => {
        if (!item.tindakan_id) return;

        if (Number(item.harga || 0) < 0) {
          messages.push(
            `Harga pada baris ${index + 1} tidak boleh kurang dari 0.`,
          );
        }

        if (Number(item.jumlah || 0) <= 0) {
          messages.push(`Jumlah pada baris ${index + 1} harus lebih dari 0.`);
        }
      });

      return messages;
    },
  },

  watch: {
    "form.treatment": {
      immediate: true,
      deep: true,
      handler(value) {
        if (this.isHydrating) return;
        this.localTreatment = this.normalizeTreatmentState(value);
      },
    },

    activeTokoId: {
      immediate: true,
      handler(value, oldValue) {
        if (
          String(value || "") === String(oldValue || "") &&
          oldValue !== undefined
        ) {
          return;
        }

        if (!value) {
          this.apiTreatmentList = [];
          this.staffOptions = [];
          this.clearSelectedTreatment();
          return;
        }

        this.queueFetchReferences();
      },
    },

    activeDate(value, oldValue) {
      if (String(value || "") !== String(oldValue || "") && this.activeTokoId) {
        this.queueFetchReferences();
      }
    },
  },

  beforeUnmount() {
    if (this.fetchTimer) clearTimeout(this.fetchTimer);
  },

  methods: {
    getDefaultItem() {
      return {
        __key: this.generateKey(),
        treatment_toko_id: null,
        tindakan_id: null,
        treatment_id: null,
        nama_tindakan: "",
        treatment_nama: "",
        harga: 0,
        jumlah: 1,
        total: 0,
        perawat_id: null,
        perawat_nama: "",
        perawat_jabatan_kode: "",
        perawat_jabatan_nama: "",
        perlu_tindakan_perawat: false,
        route_treatment: "",
      };
    },

    normalizeTreatmentState(value) {
      const source = value || {};
      const items =
        Array.isArray(source.items) && source.items.length
          ? source.items.map((item) => this.normalizeItem(item))
          : [this.getDefaultItem()];

      return {
        perlu_tindakan_perawat: Boolean(source.perlu_tindakan_perawat),
        route_treatment: source.route_treatment || "",
        total: Number(source.total || 0),
        items,
      };
    },

    normalizeItem(item = {}) {
      const normalized = {
        __key: item.__key || this.generateKey(),
        treatment_toko_id:
          item.treatment_toko_id ??
          item.master_treatment_toko_id ??
          item.tindakan_toko_id ??
          item.toko_treatment_id ??
          null,
        tindakan_id:
          item.tindakan_id ??
          item.treatment_id ??
          item.master_treatment_id ??
          null,
        treatment_id:
          item.treatment_id ??
          item.tindakan_id ??
          item.master_treatment_id ??
          null,
        nama_tindakan:
          item.nama_tindakan ||
          item.tindakan_nama ||
          item.treatment_nama ||
          item.nama_treatment ||
          item.nama ||
          "",
        treatment_nama:
          item.treatment_nama ||
          item.nama_tindakan ||
          item.tindakan_nama ||
          item.nama_treatment ||
          item.nama ||
          "",
        harga: this.toNumber(item.harga || item.harga_treatment || 0),
        jumlah: Math.max(this.toNumber(item.jumlah || item.qty || 1), 1),
        total: 0,
        perawat_id:
          item.perawat_id ??
          item.beautician_id ??
          item.nurse_id ??
          item.pelaksana_id ??
          null,
        perawat_nama:
          item.perawat_nama ||
          item.beautician_nama ||
          item.nurse_nama ||
          item.pelaksana_nama ||
          item.beautician ||
          "",
        perawat_jabatan_kode:
          item.perawat_jabatan_kode || item.kode_jabatan || "",
        perawat_jabatan_nama:
          item.perawat_jabatan_nama || item.nama_jabatan || "",
        perlu_tindakan_perawat: Boolean(
          item.perlu_tindakan_perawat ||
          item.is_tindakan_perawat ||
          item.perlu_perawat ||
          item.route_treatment === "nurse_station",
        ),
        route_treatment: item.route_treatment || "",
      };

      normalized.total = normalized.harga * normalized.jumlah;
      return normalized;
    },

    generateKey() {
      return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    },

    queueFetchReferences() {
      if (this.fetchTimer) clearTimeout(this.fetchTimer);
      this.fetchTimer = setTimeout(() => this.fetchReferences(), 150);
    },

    async fetchReferences() {
      if (!this.activeTokoId) return;

      this.loadingTreatment = true;
      this.loadingStaff = true;
      this.errorMessage = "";

      const params = {
        toko_id: this.activeTokoId,
        tanggal: this.activeDate,
      };

      const [treatmentResult, staffResult] = await Promise.allSettled([
        referenceService.treatmentByToko({ toko_id: this.activeTokoId }),
        referenceService.nurseBeautician(params),
      ]);

      if (treatmentResult.status === "fulfilled") {
        this.apiTreatmentList = Array.isArray(treatmentResult.value)
          ? treatmentResult.value
          : [];
      } else {
        this.apiTreatmentList = [];
        this.errorMessage =
          treatmentResult.reason?.response?.data?.message ||
          "Gagal mengambil data treatment berdasarkan cabang.";
      }

      if (staffResult.status === "fulfilled") {
        this.staffOptions = this.normalizeStaffOptions(staffResult.value);
      } else {
        this.staffOptions = [];
        this.errorMessage =
          staffResult.reason?.response?.data?.message ||
          "Gagal mengambil data nurse / beautician berdasarkan cabang.";
      }

      this.clearUnavailableTreatment();
      this.clearUnavailableStaff();
      this.loadingTreatment = false;
      this.loadingStaff = false;
    },

    normalizeStaffOptions(rows) {
      const data = Array.isArray(rows) ? rows : [];

      return data
        .map((item) => {
          const id = item.value ?? item.id ?? item.karyawan_id ?? null;
          const nama = item.nama || item.nama_karyawan || item.title || "-";
          const kodeJabatan = item.kode_jabatan || "";
          const namaJabatan = item.nama_jabatan || item.jabatan || "";

          return {
            ...item,
            value: id,
            title: namaJabatan ? `${nama} - ${namaJabatan}` : nama,
            nama,
            kode_jabatan: kodeJabatan,
            nama_jabatan: namaJabatan,
          };
        })
        .filter((item) => item.value);
    },

    mapTreatmentOption(item) {
      const treatmentTokoId =
        item.treatment_toko_id ??
        item.master_treatment_toko_id ??
        item.tindakan_toko_id ??
        item.toko_treatment_id ??
        item.id ??
        null;
      const treatmentId =
        item.treatment_id ??
        item.master_treatment_id ??
        item.treatment?.id ??
        item.master_treatment?.id ??
        item.new_id ??
        item.id ??
        null;
      const nama =
        item.title ||
        item.label ||
        item.nama_treatment ||
        item.nama ||
        item.treatment_nama ||
        item.nama_tindakan ||
        item.text ||
        "-";
      const harga = this.toNumber(
        item.harga ??
          item.harga_jual ??
          item.harga_treatment ??
          item.tarif ??
          item.price ??
          item.harga_toko ??
          0,
      );
      const perluPerawat = Boolean(
        item.perlu_tindakan_perawat ||
        item.is_tindakan_perawat ||
        item.perlu_perawat ||
        item.route_treatment === "nurse_station",
      );

      return {
        ...item,
        value: treatmentTokoId,
        title: nama,
        treatment_toko_id: treatmentTokoId,
        treatment_id: treatmentId,
        harga,
        perlu_tindakan_perawat: perluPerawat,
        route_treatment: perluPerawat ? "nurse_station" : "dokter",
      };
    },

    findTreatmentOption(id) {
      return this.tindakanOptions.find(
        (item) => String(item.value) === String(id),
      );
    },

    findStaffOption(id) {
      return this.staffOptions.find(
        (item) => String(item.value) === String(id),
      );
    },

    getStaffRawOption(option) {
      return option?.raw || option || {};
    },

    getStaffItemTitle(option) {
      const raw = this.getStaffRawOption(option);

      return raw.nama || raw.nama_karyawan || raw.title || option?.title || "-";
    },

    getStaffItemSubtitle(option) {
      const raw = this.getStaffRawOption(option);

      return raw.nama_jabatan || raw.kode_jabatan || "";
    },

    onTindakanChange(index, treatmentValue) {
      const selected = treatmentValue
        ? this.findTreatmentOption(treatmentValue)
        : null;
      const currentItem =
        this.localTreatment.items[index] || this.getDefaultItem();

      if (!selected) {
        this.localTreatment.items.splice(index, 1, this.getDefaultItem());
        this.emitTreatment();
        return;
      }

      const updated = {
        ...currentItem,
        treatment_toko_id: selected.treatment_toko_id || selected.value || null,
        tindakan_id: selected.treatment_id || null,
        treatment_id: selected.treatment_id || null,
        nama_tindakan: selected.title,
        treatment_nama: selected.title,
        harga: this.toNumber(selected.harga),
        jumlah: Math.max(Number(currentItem.jumlah || 1), 1),
        perlu_tindakan_perawat: Boolean(selected.perlu_tindakan_perawat),
        route_treatment: selected.route_treatment || "",
      };

      updated.total = updated.harga * updated.jumlah;
      this.localTreatment.items.splice(index, 1, updated);
      this.emitTreatment();
    },

    onStaffChange(index, staffValue) {
      const item = this.localTreatment.items[index];

      if (!item) return;

      const raw = staffValue?.raw || staffValue || null;
      const rawId =
        raw && typeof raw === "object"
          ? (raw.value ?? raw.id ?? raw.karyawan_id ?? null)
          : raw;

      // Hanya kosongkan ketika user benar-benar menekan clear.
      if (rawId === null || rawId === undefined || rawId === "") {
        item.perawat_id = null;
        item.perawat_nama = "";
        item.perawat_jabatan_kode = "";
        item.perawat_jabatan_nama = "";
        this.emitTreatment();
        return;
      }

      const perawatId = Number(rawId);

      if (!Number.isFinite(perawatId) || perawatId <= 0) {
        this.errorMessage = "ID Nurse / Beautician tidak valid.";
        return;
      }

      // ID dari event adalah sumber utama. Jangan dibuat null hanya karena
      // option belum ditemukan saat reference sedang reload.
      item.perawat_id = perawatId;

      const selected =
        this.findStaffOption(perawatId) ||
        (raw && typeof raw === "object" ? raw : null);

      item.perawat_nama =
        selected?.nama || selected?.nama_karyawan || item.perawat_nama || "";
      item.perawat_jabatan_kode =
        selected?.kode_jabatan || item.perawat_jabatan_kode || "";
      item.perawat_jabatan_nama =
        selected?.nama_jabatan || item.perawat_jabatan_nama || "";

      this.emitTreatment();
    },

    updateItemField(index, field, value) {
      const currentItem = this.localTreatment.items[index];
      if (!currentItem || field === "harga") return;

      if (field === "jumlah") {
        currentItem.jumlah = Math.max(this.toNumber(value), 1);
        currentItem.total =
          this.toNumber(currentItem.harga) * currentItem.jumlah;
      } else {
        currentItem[field] = value;
      }

      this.emitTreatment();
    },

    addItem() {
      this.localTreatment.items.push(this.getDefaultItem());
      this.emitTreatment();
    },

    removeItem(index) {
      if (this.localTreatment.items.length <= 1) {
        this.localTreatment.items = [this.getDefaultItem()];
      } else {
        this.localTreatment.items.splice(index, 1);
      }
      this.emitTreatment();
    },

    clearSelectedTreatment() {
      this.localTreatment.items = [this.getDefaultItem()];
      this.emitTreatment();
    },

    clearUnavailableTreatment() {
      if (!this.apiTreatmentList.length) return;

      let changed = false;
      this.localTreatment.items = this.localTreatment.items.map((item) => {
        if (!item.tindakan_id) return item;

        const selectedValue = item.treatment_toko_id || item.tindakan_id;
        const exists = this.tindakanOptions.some(
          (treatment) => String(treatment.value) === String(selectedValue),
        );

        if (exists) return item;
        changed = true;
        return this.getDefaultItem();
      });

      if (changed) this.emitTreatment();
    },

    clearUnavailableStaff() {
      if (!this.staffOptions.length) return;

      let changed = false;

      this.localTreatment.items.forEach((item) => {
        if (!item.perawat_id) return;

        const selected = this.findStaffOption(item.perawat_id);

        // Jangan menghapus ID existing hanya karena reference tidak memuatnya.
        // Hal itu sebelumnya membuat pilihan user berubah menjadi null.
        if (!selected) return;

        const nama = selected.nama || selected.nama_karyawan || "";
        const kodeJabatan = selected.kode_jabatan || "";
        const namaJabatan = selected.nama_jabatan || "";

        if (
          item.perawat_nama !== nama ||
          item.perawat_jabatan_kode !== kodeJabatan ||
          item.perawat_jabatan_nama !== namaJabatan
        ) {
          item.perawat_nama = nama;
          item.perawat_jabatan_kode = kodeJabatan;
          item.perawat_jabatan_nama = namaJabatan;
          changed = true;
        }
      });

      if (changed) this.emitTreatment();
    },

    emitTreatment() {
      const payload = {
        perlu_tindakan_perawat: this.needNurseStation,
        route_treatment: this.routeTreatment,
        total: this.totalTreatment,

        items: this.localTreatment.items.map((item) => ({
          treatment_toko_id: item.treatment_toko_id || null,

          tindakan_id: item.tindakan_id || null,
          treatment_id: item.treatment_id || item.tindakan_id || null,

          nama_tindakan: item.nama_tindakan || "",
          nama_treatment:
            item.nama_treatment ||
            item.treatment_nama ||
            item.nama_tindakan ||
            "",
          tindakan_nama: item.nama_tindakan || "",
          treatment_nama: item.treatment_nama || item.nama_tindakan || "",

          harga: Number(item.harga || 0),
          jumlah: Number(item.jumlah || 1),
          total: Number(item.total || 0),

          // Pelaksana opsional dan disimpan pada masing-masing item treatment.
          perawat_id:
            Number.isFinite(Number(item.perawat_id)) &&
            Number(item.perawat_id) > 0
              ? Number(item.perawat_id)
              : null,

          perawat_nama: item.perawat_nama || "",
          perawat_jabatan_kode: item.perawat_jabatan_kode || "",
          perawat_jabatan_nama: item.perawat_jabatan_nama || "",

          perlu_tindakan_perawat: Boolean(item.perlu_tindakan_perawat),

          route_treatment: item.route_treatment || "",

          is_deposit_claim: item.is_deposit_claim ? 1 : 0,
          deposit_treatment_id: item.deposit_treatment_id || null,
          deposit_claim_id: item.deposit_claim_id || null,
          catatan: item.catatan || "",
        })),
      };

      this.isHydrating = true;
      this.$emit("update-treatment", payload);

      this.$nextTick(() => {
        this.isHydrating = false;
      });
    },

    toNumber(value) {
      if (typeof value === "number") return value;
      if (value === null || value === undefined || value === "") return 0;
      return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
    },

    formatCurrency(value) {
      if (typeof this.formatNumber === "function") {
        return this.formatNumber(value || 0);
      }
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    formatRupiah(value) {
      return `Rp ${this.formatCurrency(value || 0)}`;
    },
  },
};
</script>
