<template>
  <div class="mt-3">
    <v-alert type="info" density="comfortable" border="start" class="mb-4">
      FO cukup mengisi header kunjungan dan penanggung jawab awal yang relevan.
      Detail medis diisi pada tahap pelayanan.
    </v-alert>

    <v-row dense>
      <v-col cols="12" md="7">
        <v-card variant="flat" class="border h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-4">
              <v-avatar color="primary" size="42">
                <v-icon size="22">mdi-card-account-details-outline</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Data Registrasi
                </div>
                <div class="text-caption text-medium-emphasis">
                  Informasi utama untuk membuat visit / kunjungan pasien
                </div>
              </div>
            </div>

            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="form.tanggal"
                  label="Tanggal Registrasi"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar"
                  :rules="[rules.required]"
                  hide-details="auto"
                  @update:modelValue="updateField('tanggal', $event)"
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-autocomplete
                  :model-value="form.pasien_new_id"
                  :search="pasienSearch"
                  label="Pasien"
                  placeholder="Cari nama pasien, No. RM, No. HP, atau identitas"
                  :items="pasienOptions"
                  item-title="text"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-search"
                  :rules="[rules.required]"
                  :loading="loadingPasien"
                  clearable
                  no-filter
                  hide-details="auto"
                  menu-icon="mdi-chevron-down"
                  @update:search="handlePasienSearch"
                  @update:modelValue="onPatientSelected"
                  @click:clear="clearPatient"
                >
                  <template #message>
                    Data pasien diambil dari semua cabang.
                  </template>

                  <template #no-data>
                    <div class="pa-4">
                      <div class="d-flex align-center ga-3">
                        <v-avatar color="grey" size="38">
                          <v-icon size="20">mdi-account-search-outline</v-icon>
                        </v-avatar>

                        <div>
                          <div class="text-body-2 font-weight-medium">
                            Data pasien tidak ditemukan
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Ketik minimal 2 karakter untuk mencari.
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="d-flex align-start ga-3">
              <v-icon color="primary" size="20" class="mt-1">
                mdi-information-outline
              </v-icon>

              <div>
                <div class="text-body-2 font-weight-medium">
                  Pasien bisa berasal dari semua cabang
                </div>
                <div class="text-caption text-medium-emphasis">
                  Sistem hanya membutuhkan pasien dan tanggal registrasi untuk
                  membuat kunjungan awal.
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card variant="flat" class="border h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-4">
              <v-avatar color="success" size="42">
                <v-icon size="22">mdi-account-tie-outline</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Penanggung Jawab Awal
                </div>
                <div class="text-caption text-medium-emphasis">
                  Dokter dan perawat / beautician cabang aktif
                </div>
              </div>
            </div>

            <v-alert
              v-if="!activeTokoId"
              type="warning"
              density="compact"
              border="start"
              class="mb-4"
            >
              Cabang belum terpilih. Data dokter dan perawat akan muncul setelah
              cabang aktif tersedia.
            </v-alert>

            <v-row dense>
              <v-col cols="12">
                <v-autocomplete
                  :model-value="form.dokter_id"
                  label="Dokter Tujuan / Penanggung Jawab Awal"
                  :placeholder="
                    activeTokoId
                      ? 'Cari / pilih dokter'
                      : 'Pilih cabang terlebih dahulu'
                  "
                  :items="dokterOptions"
                  item-title="text"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-stethoscope"
                  :loading="loadingKaryawan"
                  :disabled="!activeTokoId"
                  clearable
                  hide-details="auto"
                  menu-icon="mdi-chevron-down"
                  @update:modelValue="onDokterSelected"
                >
                  <template #message>
                    Data dokter difilter berdasarkan cabang aktif.
                  </template>

                  <template #no-data>
                    <div class="pa-4 text-body-2 text-medium-emphasis">
                      Tidak ada dokter pada cabang aktif.
                    </div>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  :model-value="form.perawat_id"
                  label="Perawat / Beautician Tujuan"
                  :placeholder="
                    activeTokoId
                      ? 'Cari / pilih perawat atau beautician'
                      : 'Pilih cabang terlebih dahulu'
                  "
                  :items="perawatOptions"
                  item-title="text"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-heart-outline"
                  :loading="loadingKaryawan"
                  :disabled="!activeTokoId"
                  clearable
                  hide-details="auto"
                  menu-icon="mdi-chevron-down"
                  @update:modelValue="onPerawatSelected"
                >
                  <template #message>
                    Data perawat difilter berdasarkan cabang aktif.
                  </template>

                  <template #no-data>
                    <div class="pa-4 text-body-2 text-medium-emphasis">
                      Tidak ada perawat / beautician pada cabang aktif.
                    </div>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="d-flex align-start ga-3">
              <v-icon color="success" size="20" class="mt-1">
                mdi-check-circle-outline
              </v-icon>

              <div>
                <div class="text-body-2 font-weight-medium">
                  Penanggung jawab bisa disesuaikan nanti
                </div>
                <div class="text-caption text-medium-emphasis">
                  Tahap ini hanya menentukan jalur awal pasien setelah
                  registrasi.
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import referenceService from "@/services/referenceService";
import karyawanService from "@/services/master/karyawanService";

export default {
  name: "InformasiRegistrasi",

  props: {
    form: {
      type: Object,
      required: true,
    },
    rules: {
      type: Object,
      required: true,
    },
    pasienList: {
      type: Array,
      default: () => [],
    },
    dokterList: {
      type: Array,
      default: () => [],
    },
    perawatList: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["update-field", "patient-change"],

  data() {
    return {
      apiPasienList: [],
      apiKaryawanList: [],

      loadingPasien: false,
      loadingKaryawan: false,

      pasienSearch: "",
      pasienSearchTimer: null,
      karyawanFetchTimer: null,

      selectedPasienOption: null,
      suppressPasienSearch: false,
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

    rawPasienList() {
      return this.apiPasienList.length ? this.apiPasienList : this.pasienList;
    },

    rawDokterList() {
      if (this.apiKaryawanList.length) {
        return this.apiKaryawanList.filter((item) => this.isDokter(item));
      }

      return this.dokterList;
    },

    rawPerawatList() {
      if (this.apiKaryawanList.length) {
        return this.apiKaryawanList.filter((item) => this.isPerawat(item));
      }

      return this.perawatList;
    },

    pasienOptions() {
      const rows = this.rawPasienList.map((item) => this.mapPasien(item));
      const selected = this.getSelectedPasienForOptions();

      if (
        selected &&
        selected.id &&
        !rows.some((item) => String(item.id) === String(selected.id))
      ) {
        rows.unshift(selected);
      }

      return rows;
    },

    dokterOptions() {
      return this.rawDokterList.map((item) => this.mapPetugas(item));
    },

    perawatOptions() {
      return this.rawPerawatList.map((item) => this.mapPetugas(item));
    },
  },

  watch: {
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
          this.apiKaryawanList = [];
          this.clearPetugasValue();
          return;
        }

        this.queueFetchKaryawan();
      },
    },
  },

  mounted() {
    this.clearInvalidInitialValue();
    this.syncSelectedPasienFromForm();
    this.fetchPasien("", true);
  },

  beforeUnmount() {
    if (this.pasienSearchTimer) {
      clearTimeout(this.pasienSearchTimer);
    }

    if (this.karyawanFetchTimer) {
      clearTimeout(this.karyawanFetchTimer);
    }
  },

  methods: {
    updateField(field, value) {
      this.$emit("update-field", { field, value });
    },

    onPatientSelected(value) {
      if (!value) {
        this.clearPatient(false);
        return;
      }

      const selected =
        this.pasienOptions.find((item) => String(item.id) === String(value)) ||
        this.selectedPasienOption;

      const mappedSelected = selected ? this.mapPasien(selected) : null;

      this.selectedPasienOption = mappedSelected;

      this.suppressPasienSearch = true;

      if (mappedSelected?.text) {
        this.pasienSearch = mappedSelected.text;
      }

      if (this.pasienSearchTimer) {
        clearTimeout(this.pasienSearchTimer);
      }

      this.updateField("pasien_new_id", value);
      this.updateField("pasien", mappedSelected);
      this.updateField(
        "pasien_nama",
        mappedSelected?.nama || mappedSelected?.text || "",
      );

      this.$emit("patient-change", value);

      this.$nextTick(() => {
        this.suppressPasienSearch = false;
      });
    },

    clearPatient(fetchDefault = true) {
      if (this.pasienSearchTimer) {
        clearTimeout(this.pasienSearchTimer);
      }

      this.suppressPasienSearch = true;
      this.pasienSearch = "";
      this.selectedPasienOption = null;

      this.updateField("pasien_new_id", null);
      this.updateField("pasien", null);
      this.updateField("pasien_nama", "");

      this.$emit("patient-change", null);

      this.$nextTick(() => {
        this.suppressPasienSearch = false;
      });

      if (fetchDefault) {
        this.fetchPasien("", true);
      }
    },

    handlePasienSearch(keyword) {
      const search = String(keyword || "").trim();
      this.pasienSearch = keyword || "";

      if (this.suppressPasienSearch) {
        return;
      }

      const selected = this.getSelectedPasienForOptions();

      if (this.isSameAsSelectedPasienSearch(search, selected)) {
        return;
      }

      if (this.pasienSearchTimer) {
        clearTimeout(this.pasienSearchTimer);
      }

      this.pasienSearchTimer = setTimeout(() => {
        if (this.suppressPasienSearch) {
          return;
        }

        if (search.length === 0) {
          if (this.form.pasien_new_id) {
            return;
          }

          this.fetchPasien("", true);
          return;
        }

        if (search.length >= 2) {
          this.fetchPasien(search, true);
        }
      }, 350);
    },

    isSameAsSelectedPasienSearch(search, selected) {
      if (!search || !selected) {
        return false;
      }

      const normalizedSearch = this.normalizeText(search);

      const selectedValues = [
        selected.id,
        selected.text,
        selected.nama,
        selected.no_rm,
        selected.no_hp,
        selected.no_identitas,
      ]
        .filter(Boolean)
        .map((value) => this.normalizeText(value));

      return selectedValues.includes(normalizedSearch);
    },

    getSelectedPasienForOptions() {
      if (this.selectedPasienOption) {
        return this.mapPasien(this.selectedPasienOption);
      }

      if (this.form?.pasien && this.form?.pasien_new_id) {
        return this.mapPasien(this.form.pasien);
      }

      if (this.form?.pasien_new_id && this.form?.pasien_nama) {
        return this.mapPasien({
          id: this.form.pasien_new_id,
          pasien_new_id: this.form.pasien_new_id,
          nama: this.form.pasien_nama,
          text: this.form.pasien_nama,
        });
      }

      return null;
    },

    syncSelectedPasienFromForm() {
      const selected = this.getSelectedPasienForOptions();

      if (!selected) {
        return;
      }

      this.selectedPasienOption = selected;
      this.pasienSearch = selected.text || selected.nama || "";
    },

    async fetchPasien(search = "", force = false) {
      if (!force && search.length < 2) return;

      this.loadingPasien = true;

      try {
        const rows = await referenceService.pasien({
          search,
          limit: 30,
        });

        this.apiPasienList = Array.isArray(rows) ? rows : [];
      } catch (error) {
        this.apiPasienList = [];
      } finally {
        this.loadingPasien = false;
      }
    },

    onDokterSelected(value) {
      const selected = this.dokterOptions.find(
        (item) => String(item.id) === String(value),
      );

      this.updateField("dokter_id", value);
      this.updateField("dokter", selected || null);
      this.updateField("dokter_nama", selected?.nama || selected?.text || "");
    },

    onPerawatSelected(value) {
      const selected = this.perawatOptions.find(
        (item) => String(item.id) === String(value),
      );

      this.updateField("perawat_id", value);
      this.updateField("perawat", selected || null);
      this.updateField("perawat_nama", selected?.nama || selected?.text || "");
    },

    clearPetugasValue() {
      if (this.form.dokter_id) {
        this.updateField("dokter_id", null);
      }

      if (this.form.perawat_id) {
        this.updateField("perawat_id", null);
      }
    },

    clearInvalidInitialValue() {
      const isInvalidDropdownValue = (value) => {
        if (value === null || value === undefined || value === "") return false;
        return !/^\d+$/.test(String(value));
      };

      if (isInvalidDropdownValue(this.form.pasien_new_id)) {
        this.updateField("pasien_new_id", null);
        this.$emit("patient-change", null);
      }

      if (isInvalidDropdownValue(this.form.dokter_id)) {
        this.updateField("dokter_id", null);
      }

      if (isInvalidDropdownValue(this.form.perawat_id)) {
        this.updateField("perawat_id", null);
      }
    },

    queueFetchKaryawan() {
      if (this.karyawanFetchTimer) {
        clearTimeout(this.karyawanFetchTimer);
      }

      this.karyawanFetchTimer = setTimeout(() => {
        this.fetchKaryawanByToko();
      }, 150);
    },

    async fetchKaryawanByToko() {
      if (!this.activeTokoId) {
        this.apiKaryawanList = [];
        return;
      }

      this.loadingKaryawan = true;

      try {
        const response = await karyawanService.getAll({
          toko_id: this.activeTokoId,
          per_page: 100,
        });

        this.apiKaryawanList = this.extractRows(response);
        this.clearUnavailablePetugas();
      } catch (error) {
        this.apiKaryawanList = [];
      } finally {
        this.loadingKaryawan = false;
      }
    },

    clearUnavailablePetugas() {
      if (
        this.form.dokter_id &&
        !this.dokterOptions.some(
          (item) => String(item.id) === String(this.form.dokter_id),
        )
      ) {
        this.updateField("dokter_id", null);
      }

      if (
        this.form.perawat_id &&
        !this.perawatOptions.some(
          (item) => String(item.id) === String(this.form.perawat_id),
        )
      ) {
        this.updateField("perawat_id", null);
      }
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

    mapPasien(item) {
      const id = item.id || item.value || item.pasien_new_id;
      const nama = item.nama || item.nama_pasien || item.name || "-";
      const noRm = item.no_rm || item.no_rekam_medis || "";
      const noHp = item.no_hp || item.hp || "";
      const noIdentitas = item.no_identitas || item.nik || "";

      return {
        ...item,
        id,
        nama,
        no_rm: noRm,
        no_hp: noHp,
        no_identitas: noIdentitas,
        text:
          item.text ||
          item.label ||
          [noRm, nama, noHp || noIdentitas].filter(Boolean).join(" - "),
      };
    },

    mapPetugas(item) {
      const penempatanAktif = this.getPenempatanAktif(item);
      const jabatanText = this.getJabatanText(item);

      const id = item.id || item.value || item.karyawan_id;
      const nama =
        item.nama || item.nama_karyawan || item.label || item.text || "-";

      const kode = item.kode || item.kode_karyawan || "";
      const namaToko =
        penempatanAktif?.toko?.nama_toko ||
        item.nama_toko ||
        item.toko?.nama_toko ||
        "";

      const jabatanTitle = this.toTitleCase(jabatanText);

      return {
        ...item,
        id,
        nama,
        kode,
        jabatan_text: jabatanTitle,
        toko_id: penempatanAktif?.toko_id || item.toko_id || null,
        nama_toko: namaToko,
        text: [nama, jabatanTitle, namaToko || kode]
          .filter(Boolean)
          .join(" - "),
      };
    },

    getPenempatanAktif(item) {
      if (!Array.isArray(item?.penempatan)) return null;

      const tokoId = String(this.activeTokoId || "");

      return (
        item.penempatan.find((row) => {
          const isDeleted = Number(row.is_delete || 0) === 1;

          if (isDeleted) return false;

          return (
            String(row.toko_id) === tokoId || String(row.toko?.id) === tokoId
          );
        }) || null
      );
    },

    getJabatanText(item) {
      return String(
        item?.jabatan?.nama_jabatan ||
          item?.jabatan?.nama ||
          item?.master_jabatan?.nama_jabatan ||
          item?.master_jabatan?.nama ||
          item?.jabatan_text ||
          item?.jabatan ||
          "",
      ).toLowerCase();
    },

    isDokter(item) {
      const jabatan = this.getJabatanText(item);

      return (
        jabatan.includes("dokter") ||
        jabatan.includes("doctor") ||
        jabatan.includes("dr")
      );
    },

    isPerawat(item) {
      const jabatan = this.getJabatanText(item);

      return (
        jabatan.includes("perawat") ||
        jabatan.includes("nurse") ||
        jabatan.includes("beautician") ||
        jabatan.includes("terapis") ||
        jabatan.includes("therapist")
      );
    },

    normalizeText(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    },

    toTitleCase(value) {
      return String(value || "")
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
  },
};
</script>
