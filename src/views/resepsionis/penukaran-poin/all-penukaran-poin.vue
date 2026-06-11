<template>
  <div>
    <v-card variant="tonal" color="primary" rounded="lg" class="mb-4">
      <v-card-text class="pa-4 pa-md-5">
        <div class="d-flex flex-column flex-md-row justify-space-between ga-4">
          <div>
            <div class="text-overline font-weight-bold">Resepsionis</div>
            <div class="text-h5 font-weight-bold">Penukaran Poin</div>
            <div class="text-body-2 mt-1">
              Pilih pasien, cek saldo poin, tentukan reward, lalu simpan
              penukaran dalam satu alur kerja.
            </div>
          </div>

          <div class="d-flex align-start justify-start justify-md-end">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-refresh"
              :loading="loadingPage"
              @click="reloadPage"
            >
              Muat Ulang
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="successMessage = ''"
    >
      {{ successMessage }}
    </v-alert>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card variant="outlined" rounded="lg" class="mb-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-4">
              <v-avatar color="primary" variant="tonal" rounded="lg" size="42">
                <v-icon icon="mdi-account-search" />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">Data Pasien</div>
                <div class="text-body-2 text-medium-emphasis">
                  Gunakan data reference pasien agar saldo poin sesuai ledger.
                </div>
              </div>
            </div>

            <v-row align="start">
              <v-col cols="12" md="8">
                <v-autocomplete
                  v-model="selectedPasienId"
                  v-model:search="pasienSearch"
                  :items="pasienOptions"
                  :loading="loadingPasien"
                  item-title="label"
                  item-value="id"
                  label="Cari pasien"
                  placeholder="Ketik nama, no RM, atau nomor HP"
                  prepend-inner-icon="mdi-account-search"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  clearable
                  no-filter
                  @update:search="onSearchPasien"
                  @update:model-value="onSelectPasien"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-avatar color="primary" variant="tonal" size="36">
                          <v-icon icon="mdi-account" />
                        </v-avatar>
                      </template>

                      <v-list-item-title class="font-weight-bold">
                        {{ pasienDisplayName(item) }}
                      </v-list-item-title>

                      <v-list-item-subtitle>
                        {{ pasienSubtitle(item) }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>

                  <template #selection="{ item }">
                    <span>{{ pasienSelectionLabel(item) }}</span>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.tanggal"
                  type="date"
                  label="Tanggal Penukaran"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  prepend-inner-icon="mdi-calendar"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card variant="outlined" rounded="lg" class="mb-4">
          <v-card-title class="pa-4">
            <div
              class="d-flex flex-column flex-sm-row justify-space-between ga-3"
            >
              <div class="d-flex align-center ga-3">
                <v-avatar
                  color="primary"
                  variant="tonal"
                  rounded="lg"
                  size="42"
                >
                  <v-icon icon="mdi-gift-outline" />
                </v-avatar>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Item Reward
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Pilih merchandise atau voucher yang akan ditukar.
                  </div>
                </div>
              </div>

              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-plus"
                :disabled="!selectedPasienId"
                @click="addRow"
              >
                Tambah Item
              </v-btn>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <v-alert
              v-if="!selectedPasienId"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-4"
            >
              Pilih pasien terlebih dahulu. Form reward akan aktif setelah saldo
              poin pasien berhasil dimuat.
            </v-alert>

            <v-alert
              v-else-if="sisaPoin < 0"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mb-4"
            >
              Total penukaran melebihi saldo pasien. Kurangi qty atau pilih
              reward lain.
            </v-alert>

            <v-card
              v-for="(row, index) in rows"
              :key="row.uid"
              variant="outlined"
              rounded="lg"
              class="mb-3"
            >
              <v-card-text class="pa-3 pa-md-4">
                <div
                  class="d-flex align-center justify-space-between ga-3 mb-3"
                >
                  <div class="d-flex align-center ga-3">
                    <v-avatar
                      color="primary"
                      variant="tonal"
                      rounded="lg"
                      size="36"
                    >
                      <v-icon :icon="rewardIcon(row.jenis_reward)" />
                    </v-avatar>

                    <div>
                      <div class="text-body-2 font-weight-bold">
                        Reward {{ index + 1 }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ row.nama || "Belum dipilih" }}
                      </div>
                    </div>
                  </div>

                  <v-btn
                    icon="mdi-delete-outline"
                    color="error"
                    variant="text"
                    density="comfortable"
                    :disabled="rows.length <= 1"
                    @click="removeRow(index)"
                  />
                </div>

                <v-row align="start" dense>
                  <v-col cols="12" md="6">
                    <v-autocomplete
                      v-model="row.merchandise_id"
                      :items="merchandiseOptions"
                      :loading="loadingMerchandise"
                      item-title="label"
                      item-value="id"
                      label="Reward"
                      placeholder="Pilih reward"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      :disabled="!selectedPasienId"
                      @update:model-value="onSelectMerchandise(index)"
                    >
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template #prepend>
                            <v-avatar color="primary" variant="tonal" size="34">
                              <v-icon
                                :icon="rewardIcon(slotRaw(item).jenis_reward)"
                              />
                            </v-avatar>
                          </template>

                          <v-list-item-title class="font-weight-bold">
                            {{ rewardDisplayName(item) }}
                          </v-list-item-title>

                          <v-list-item-subtitle>
                            {{ rewardDisplaySubtitle(item) }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="6" sm="3" md="2">
                    <v-text-field
                      v-model.number="row.qty"
                      type="number"
                      min="1"
                      :max="row.stok || 1"
                      label="Qty"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      :disabled="!row.merchandise_id"
                      @update:model-value="normalizeQty(index)"
                    />
                  </v-col>

                  <v-col cols="6" sm="3" md="2">
                    <v-text-field
                      :model-value="formatPoint(row.harga_poin)"
                      label="Poin/item"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      readonly
                    />
                  </v-col>

                  <v-col cols="12" md="2">
                    <v-sheet
                      border
                      rounded="lg"
                      class="pa-3 h-100 d-flex flex-column justify-center"
                    >
                      <div class="text-caption text-medium-emphasis">
                        Subtotal
                      </div>
                      <div class="text-subtitle-1 font-weight-bold">
                        {{ formatPoint(row.subtotal_poin) }} poin
                      </div>
                    </v-sheet>
                  </v-col>
                </v-row>

                <div
                  v-if="row.merchandise_id"
                  class="d-flex flex-wrap ga-2 mt-3"
                >
                  <v-chip size="small" color="primary" variant="tonal">
                    {{ rewardTypeLabel(row.jenis_reward) }}
                  </v-chip>

                  <v-chip
                    size="small"
                    :color="row.stok > 0 ? 'success' : 'error'"
                    variant="tonal"
                  >
                    Stok {{ row.stok }}
                  </v-chip>

                  <v-chip
                    v-if="row.nilai_diskon_nominal"
                    size="small"
                    color="success"
                    variant="tonal"
                  >
                    Diskon {{ formatCurrency(row.nilai_diskon_nominal) }}
                  </v-chip>

                  <v-chip
                    v-if="row.nilai_diskon_persen"
                    size="small"
                    color="indigo"
                    variant="tonal"
                  >
                    Diskon {{ row.nilai_diskon_persen }}%
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>

            <v-alert
              v-if="hasIncompleteRows"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="mt-2"
            >
              Ada item yang belum lengkap. Lengkapi reward dan qty sebelum
              menyimpan.
            </v-alert>

            <v-textarea
              v-model="form.catatan"
              label="Catatan"
              placeholder="Opsional, misalnya reward diserahkan langsung ke pasien"
              variant="outlined"
              density="comfortable"
              rows="2"
              auto-grow
              hide-details="auto"
              class="mt-4"
            />
          </v-card-text>
        </v-card>

        <v-card variant="outlined" rounded="lg">
          <v-card-title class="pa-4">
            <div class="d-flex align-center justify-space-between ga-3">
              <div class="d-flex align-center ga-3">
                <v-avatar
                  color="primary"
                  variant="tonal"
                  rounded="lg"
                  size="42"
                >
                  <v-icon icon="mdi-history" />
                </v-avatar>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Riwayat Poin
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Mutasi poin terakhir pasien.
                  </div>
                </div>
              </div>

              <v-chip
                v-if="historyItems.length"
                color="primary"
                variant="tonal"
              >
                {{ historyItems.length }} mutasi
              </v-chip>
            </div>
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="historyHeaders"
            :items="historyItems"
            :loading="loadingSaldo"
            density="compact"
            :items-per-page="8"
            class="text-no-wrap"
          >
            <template #item.tanggal="{ item }">
              <div class="font-weight-medium">
                {{ formatDate(item.tanggal) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ item.source_no || "-" }}
              </div>
            </template>

            <template #item.tipe_mutasi="{ item }">
              <v-chip
                size="small"
                :color="mutationColor(item.tipe_mutasi)"
                variant="tonal"
              >
                {{ mutationLabel(item.tipe_mutasi) }}
              </v-chip>
            </template>

            <template #item.poin="{ item }">
              <div
                v-if="Number(item.poin_masuk) > 0"
                class="text-success font-weight-bold"
              >
                +{{ formatPoint(item.poin_masuk) }}
              </div>
              <div v-else class="text-error font-weight-bold">
                -{{ formatPoint(item.poin_keluar) }}
              </div>
            </template>

            <template #item.saldo_setelah="{ item }">
              <span class="font-weight-bold">
                {{ formatPoint(item.saldo_setelah) }}
              </span>
            </template>

            <template #item.keterangan="{ item }">
              <div class="text-body-2">
                {{ item.keterangan || "-" }}
              </div>

              <div
                v-if="
                  item.redeem &&
                  item.redeem.details &&
                  item.redeem.details.length
                "
                class="text-caption text-medium-emphasis"
              >
                {{
                  item.redeem.details
                    .map((detail) => `${detail.nama} x${detail.qty}`)
                    .join(", ")
                }}
              </div>
            </template>

            <template #no-data>
              <div class="pa-8 text-center">
                <v-icon
                  icon="mdi-history"
                  size="42"
                  class="mb-2 text-medium-emphasis"
                />
                <div class="font-weight-bold">Belum ada riwayat poin</div>
                <div class="text-body-2 text-medium-emphasis">
                  Riwayat akan muncul setelah pasien memiliki mutasi poin.
                </div>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card variant="outlined" rounded="lg" class="mb-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-start ga-3 mb-4">
              <v-avatar color="primary" variant="tonal" rounded="lg" size="50">
                <v-icon icon="mdi-account-star" size="28" />
              </v-avatar>

              <div class="flex-grow-1">
                <div class="text-subtitle-1 font-weight-bold">
                  {{ selectedPasien?.nama || "Belum ada pasien" }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{
                    selectedPasien?.no_rm || "Pilih pasien untuk melihat data"
                  }}
                </div>
                <v-chip
                  v-if="memberInfo?.no_member"
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="mt-2"
                >
                  {{ memberInfo.no_member }}
                </v-chip>
              </div>
            </div>

            <v-sheet border rounded="lg" class="pa-4 mb-3">
              <div class="d-flex justify-space-between align-start ga-3 mb-3">
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Sisa Setelah Tukar
                  </div>
                  <div
                    class="text-h4 font-weight-bold"
                    :class="sisaPoin < 0 ? 'text-error' : 'text-success'"
                  >
                    {{ formatPoint(sisaPoin) }}
                  </div>
                </div>

                <v-avatar :color="pointStatusColor" variant="tonal" size="42">
                  <v-icon :icon="pointStatusIcon" />
                </v-avatar>
              </div>

              <v-progress-linear
                :model-value="pointUsagePercent"
                :color="pointStatusColor"
                height="8"
                rounded
              />

              <div class="d-flex justify-space-between mt-2 text-caption">
                <span class="text-medium-emphasis">Dipakai</span>
                <span class="font-weight-bold">
                  {{ formatPoint(totalPoinDitukar) }} /
                  {{ formatPoint(saldoPoin) }}
                </span>
              </div>
            </v-sheet>

            <v-row dense>
              <v-col cols="6">
                <v-sheet border rounded="lg" class="pa-3">
                  <div class="text-caption text-medium-emphasis">
                    Saldo Poin
                  </div>
                  <div class="text-h6 font-weight-bold">
                    {{ formatPoint(saldoPoin) }}
                  </div>
                </v-sheet>
              </v-col>

              <v-col cols="6">
                <v-sheet border rounded="lg" class="pa-3">
                  <div class="text-caption text-medium-emphasis">Total Qty</div>
                  <div class="text-h6 font-weight-bold">
                    {{ formatPoint(totalQtyDitukar) }}
                  </div>
                </v-sheet>
              </v-col>
            </v-row>

            <v-list density="compact" class="mt-3 bg-transparent">
              <v-list-item class="px-0">
                <v-list-item-title class="text-body-2 text-medium-emphasis">
                  Total Poin Ditukar
                </v-list-item-title>

                <template #append>
                  <span class="font-weight-bold">
                    {{ formatPoint(totalPoinDitukar) }}
                  </span>
                </template>
              </v-list-item>

              <v-list-item class="px-0">
                <v-list-item-title class="text-body-2 text-medium-emphasis">
                  Nilai Diskon Nominal
                </v-list-item-title>

                <template #append>
                  <span class="font-weight-bold">
                    {{ formatCurrency(totalDiskonNominal) }}
                  </span>
                </template>
              </v-list-item>
            </v-list>

            <v-alert
              :type="submitHintType"
              variant="tonal"
              density="comfortable"
              class="mt-3"
            >
              {{ submitHint }}
            </v-alert>

            <v-btn
              color="primary"
              size="large"
              block
              class="mt-4"
              prepend-icon="mdi-content-save"
              :loading="saving"
              :disabled="disableSubmit"
              @click="submitRedeem"
            >
              Simpan Penukaran
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card variant="outlined" rounded="lg">
          <v-card-title class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="tonal" rounded="lg" size="42">
                <v-icon icon="mdi-storefront-outline" />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Reward Tersedia
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Merchandise dan voucher aktif.
                </div>
              </div>
            </div>
          </v-card-title>

          <v-divider />

          <v-list density="comfortable" lines="two">
            <v-list-item
              v-for="item in merchandiseOptions.slice(0, 8)"
              :key="item.id"
            >
              <template #prepend>
                <v-avatar color="primary" variant="tonal" rounded="lg">
                  <v-icon :icon="rewardIcon(item.jenis_reward)" />
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">
                {{ item.nama }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ formatPoint(item.harga_poin) }} poin • Stok {{ item.stok }}
              </v-list-item-subtitle>

              <template #append>
                <v-chip
                  size="small"
                  :color="item.stok > 0 ? 'success' : 'error'"
                  variant="tonal"
                >
                  {{ item.stok > 0 ? "Aktif" : "Habis" }}
                </v-chip>
              </template>
            </v-list-item>

            <v-list-item v-if="loadingMerchandise">
              <template #prepend>
                <v-progress-circular indeterminate color="primary" size="24" />
              </template>
              <v-list-item-title class="text-medium-emphasis">
                Memuat reward...
              </v-list-item-title>
            </v-list-item>

            <v-list-item v-else-if="!merchandiseOptions.length">
              <v-list-item-title class="text-medium-emphasis">
                Belum ada reward aktif.
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import pasienService from "@/services/pasienService";
import referenceService from "@/services/referenceService";

const loadingPage = ref(false);
const loadingPasien = ref(false);
const loadingSaldo = ref(false);
const loadingMerchandise = ref(false);
const saving = ref(false);

const errorMessage = ref("");
const successMessage = ref("");

const pasienSearch = ref("");
const selectedPasienId = ref(null);
const selectedPasien = ref(null);
const memberInfo = ref(null);
const saldoPoin = ref(0);

const pasienOptions = ref([]);
const merchandiseOptions = ref([]);
const historyItems = ref([]);

const form = reactive({
  tanggal: new Date().toISOString().slice(0, 10),
  catatan: "",
});

const rows = ref([]);

let searchTimer = null;

const historyHeaders = [
  { title: "Tanggal", key: "tanggal", sortable: false },
  { title: "Mutasi", key: "tipe_mutasi", sortable: false },
  { title: "Poin", key: "poin", sortable: false, align: "end" },
  { title: "Saldo", key: "saldo_setelah", sortable: false, align: "end" },
  { title: "Keterangan", key: "keterangan", sortable: false },
];

const totalPoinDitukar = computed(() =>
  rows.value.reduce((sum, row) => sum + Number(row.subtotal_poin || 0), 0),
);

const totalQtyDitukar = computed(() =>
  rows.value.reduce((sum, row) => {
    if (!row.merchandise_id) return sum;

    return sum + Number(row.qty || 0);
  }, 0),
);

const totalDiskonNominal = computed(() =>
  rows.value.reduce((sum, row) => {
    if (row.jenis_reward !== "diskon_nominal") return sum;

    return sum + Number(row.nilai_diskon_nominal || 0) * Number(row.qty || 0);
  }, 0),
);

const sisaPoin = computed(
  () => Number(saldoPoin.value || 0) - totalPoinDitukar.value,
);

const pointUsagePercent = computed(() => {
  const saldo = Number(saldoPoin.value || 0);
  const used = Number(totalPoinDitukar.value || 0);

  if (saldo <= 0 && used > 0) return 100;
  if (saldo <= 0) return 0;

  return Math.min(Math.round((used / saldo) * 100), 100);
});

const pointStatusColor = computed(() => {
  if (!selectedPasienId.value) return "grey";
  if (sisaPoin.value < 0) return "error";
  if (totalPoinDitukar.value > 0) return "success";

  return "primary";
});

const pointStatusIcon = computed(() => {
  if (!selectedPasienId.value) return "mdi-account-search";
  if (sisaPoin.value < 0) return "mdi-alert-circle";
  if (totalPoinDitukar.value > 0) return "mdi-check-circle";

  return "mdi-gift-outline";
});

const hasIncompleteRows = computed(() =>
  rows.value.some((row) => !row.merchandise_id || Number(row.qty || 0) <= 0),
);

const submitHint = computed(() => {
  if (!selectedPasienId.value) return "Pilih pasien terlebih dahulu.";
  if (loadingSaldo.value) return "Saldo poin pasien sedang dimuat.";
  if (hasIncompleteRows.value) return "Lengkapi reward dan qty sebelum simpan.";
  if (totalPoinDitukar.value <= 0) return "Pilih minimal satu reward.";
  if (sisaPoin.value < 0) return "Saldo poin tidak cukup untuk penukaran ini.";

  return "Transaksi siap disimpan.";
});

const submitHintType = computed(() => {
  if (!selectedPasienId.value || loadingSaldo.value) return "info";
  if (disableSubmit.value) return "warning";

  return "success";
});

const disableSubmit = computed(() => {
  if (!selectedPasienId.value) return true;
  if (saving.value) return true;
  if (loadingSaldo.value) return true;
  if (hasIncompleteRows.value) return true;
  if (totalPoinDitukar.value <= 0) return true;
  if (sisaPoin.value < 0) return true;

  return false;
});

onMounted(async () => {
  addRow();
  await Promise.all([fetchPasien(), fetchMerchandise()]);
});

function createEmptyRow() {
  return {
    uid: `${Date.now()}-${Math.random()}`,
    merchandise_id: null,
    kode: "",
    nama: "",
    jenis_reward: "",
    harga_poin: 0,
    nilai_diskon_persen: null,
    nilai_diskon_nominal: null,
    stok: 0,
    qty: 1,
    subtotal_poin: 0,
  };
}

function addRow() {
  rows.value.push(createEmptyRow());
}

function removeRow(index) {
  if (rows.value.length <= 1) return;

  rows.value.splice(index, 1);
}

function onSearchPasien(value) {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    fetchPasien(value);
  }, 350);
}

async function fetchPasien(search = pasienSearch.value) {
  loadingPasien.value = true;

  try {
    const response = await referenceService.pasien({
      search: search || "",
      limit: 20,
    });

    pasienOptions.value = unwrapArray(response).map((item) =>
      normalizePasienOption(item),
    );
  } catch (error) {
    showError(error, "Gagal mengambil data pasien.");
  } finally {
    loadingPasien.value = false;
  }
}

async function fetchMerchandise() {
  loadingMerchandise.value = true;

  try {
    const response = await referenceService.merchandise({
      q: "",
      limit: 100,
    });

    merchandiseOptions.value = unwrapArray(response)
      .filter((item) => Number(item.harga_poin || 0) > 0)
      .map((item) => normalizeMerchandiseOption(item));
  } catch (error) {
    showError(error, "Gagal mengambil data reward.");
  } finally {
    loadingMerchandise.value = false;
  }
}

async function onSelectPasien(id) {
  selectedPasien.value =
    pasienOptions.value.find((item) => Number(item.id) === Number(id)) || null;

  memberInfo.value = null;
  saldoPoin.value = 0;
  historyItems.value = [];
  rows.value = [createEmptyRow()];

  if (!id) return;

  await fetchSaldoPoin(id);
}

async function fetchSaldoPoin(id = selectedPasienId.value) {
  if (!id) return;

  loadingSaldo.value = true;

  try {
    const response = await pasienService.getSaldoPoin(id);
    const data = unwrapData(response);

    selectedPasien.value = data.pasien
      ? normalizePasienOption(data.pasien)
      : selectedPasien.value;

    memberInfo.value = data.member || null;
    saldoPoin.value = Number(data.saldo_poin || 0);
    historyItems.value = Array.isArray(data.riwayat) ? data.riwayat : [];
  } catch (error) {
    showError(error, "Gagal mengambil saldo poin pasien.");
  } finally {
    loadingSaldo.value = false;
  }
}

function onSelectMerchandise(index) {
  const row = rows.value[index];

  const merchandise = merchandiseOptions.value.find(
    (item) => Number(item.id) === Number(row.merchandise_id),
  );

  if (!merchandise) {
    rows.value[index] = createEmptyRow();
    return;
  }

  row.kode = merchandise.kode || "";
  row.nama = merchandise.nama || "";
  row.jenis_reward = merchandise.jenis_reward || "";
  row.harga_poin = Number(merchandise.harga_poin || 0);
  row.nilai_diskon_persen = merchandise.nilai_diskon_persen;
  row.nilai_diskon_nominal = merchandise.nilai_diskon_nominal;
  row.stok = Number(merchandise.stok || 0);
  row.qty = Math.min(Math.max(Number(row.qty || 1), 1), Math.max(row.stok, 1));
  row.subtotal_poin = row.harga_poin * row.qty;
}

function normalizeQty(index) {
  const row = rows.value[index];

  let qty = Number(row.qty || 0);

  if (qty < 1) qty = 1;
  if (row.stok > 0 && qty > row.stok) qty = row.stok;

  row.qty = qty;
  row.subtotal_poin = Number(row.harga_poin || 0) * qty;
}

async function submitRedeem() {
  if (disableSubmit.value) return;

  errorMessage.value = "";
  successMessage.value = "";
  saving.value = true;

  try {
    const payload = {
      tanggal: form.tanggal,
      catatan: form.catatan,
      items: rows.value.map((row) => ({
        merchandise_id: row.merchandise_id,
        qty: Number(row.qty || 0),
      })),
    };

    const response = await pasienService.redeemPoin(
      selectedPasienId.value,
      payload,
    );

    const data = unwrapData(response);

    successMessage.value =
      response?.message ||
      `Penukaran poin berhasil disimpan${
        data.kode_redeem ? ` (${data.kode_redeem})` : ""
      }.`;

    rows.value = [createEmptyRow()];
    form.catatan = "";

    await Promise.all([fetchSaldoPoin(), fetchMerchandise()]);
  } catch (error) {
    showError(error, "Gagal menyimpan penukaran poin.");
  } finally {
    saving.value = false;
  }
}

async function reloadPage() {
  loadingPage.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await Promise.all([
      fetchPasien(),
      fetchMerchandise(),
      selectedPasienId.value
        ? fetchSaldoPoin(selectedPasienId.value)
        : Promise.resolve(),
    ]);
  } finally {
    loadingPage.value = false;
  }
}

function normalizePasienOption(item = {}) {
  const nama = item.nama || item.nama_pasien || item.name || "-";
  const noRm = item.no_rm || item.no_rekam_medis || "";
  const phone = item.no_hp || item.no_wa || item.nomor_hp || "";

  return {
    ...item,
    id: item.id || item.pasien_id,
    nama,
    no_rm: noRm,
    no_hp: item.no_hp || phone,
    no_wa: item.no_wa || "",
    label:
      item.label ||
      [noRm || "Tanpa No RM", nama, phone].filter(Boolean).join(" • "),
  };
}

function normalizeMerchandiseOption(item = {}) {
  const nama = item.nama || item.title || item.text || "-";
  const kode = item.kode || "";
  const label =
    item.label ||
    item.title ||
    item.text ||
    `${kode ? `${kode} - ` : ""}${nama} (${formatPoint(item.harga_poin)} poin)`;

  return {
    ...item,
    id: item.id || item.value,
    kode,
    nama,
    label,
    jenis_reward: item.jenis_reward || "",
    nilai_diskon_persen:
      item.nilai_diskon_persen !== undefined
        ? Number(item.nilai_diskon_persen)
        : null,
    nilai_diskon_nominal:
      item.nilai_diskon_nominal !== undefined
        ? Number(item.nilai_diskon_nominal)
        : null,
    harga_poin: Number(item.harga_poin || 0),
    stok: Number(item.stok || 0),
  };
}

function slotRaw(item) {
  return item?.raw || item || {};
}

function pasienDisplayName(item) {
  const raw = normalizePasienOption(slotRaw(item));

  return raw.nama || "-";
}

function pasienSubtitle(item) {
  const raw = normalizePasienOption(slotRaw(item));
  const meta = [
    raw.no_rm || "Tanpa No RM",
    raw.no_hp || raw.no_wa || "",
  ].filter(Boolean);

  return meta.join(" • ");
}

function pasienSelectionLabel(item) {
  return normalizePasienOption(slotRaw(item)).label || pasienDisplayName(item);
}

function rewardDisplayName(item) {
  const raw = normalizeMerchandiseOption(slotRaw(item));

  return raw.nama || "-";
}

function rewardDisplaySubtitle(item) {
  const raw = normalizeMerchandiseOption(slotRaw(item));

  return `${formatPoint(raw.harga_poin)} poin • Stok ${raw.stok}`;
}

function unwrapData(response) {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;

  return response || {};
}

function unwrapArray(response) {
  const data = unwrapData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.rows)) return data.rows;

  return [];
}

function showError(error, fallback) {
  const errors = error?.response?.data?.errors;

  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const firstMessage = Array.isArray(errors[firstKey])
      ? errors[firstKey][0]
      : errors[firstKey];

    errorMessage.value = firstMessage || fallback;
    return;
  }

  errorMessage.value =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;
}

function formatPoint(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function rewardTypeLabel(type) {
  const labels = {
    diskon_persen: "Diskon Persen",
    diskon_nominal: "Diskon Nominal",
    merchandise: "Merchandise",
  };

  return labels[type] || type || "-";
}

function rewardIcon(type) {
  const icons = {
    diskon_persen: "mdi-percent",
    diskon_nominal: "mdi-ticket-percent",
    merchandise: "mdi-gift",
  };

  return icons[type] || "mdi-gift-outline";
}

function mutationLabel(type) {
  const labels = {
    earn: "Poin Masuk",
    redeem: "Penukaran",
    void_redeem: "Void Penukaran",
    adjustment_plus: "Adjustment +",
    adjustment_minus: "Adjustment -",
    expired: "Expired",
  };

  return labels[type] || type || "-";
}

function mutationColor(type) {
  const colors = {
    earn: "success",
    redeem: "error",
    void_redeem: "info",
    adjustment_plus: "success",
    adjustment_minus: "warning",
    expired: "grey",
  };

  return colors[type] || "primary";
}
</script>
