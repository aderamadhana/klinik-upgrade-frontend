<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
      <div>
        <div class="text-h6 font-weight-bold">Detail Registrasi Layanan</div>
        <div class="text-body-2 text-medium-emphasis">
          Detail kunjungan pasien, layanan, task, dan transaksi.
        </div>

        <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mt-2">
          <template #divider>
            <v-icon size="16">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </div>

      <div class="d-flex align-center flex-wrap ga-2">
        <v-btn
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          @click="goBack"
        >
          Kembali
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="fetchData"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      border="start"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-skeleton-loader v-if="loading" type="article, table-row@4, actions" />

    <template v-else-if="detail">
      <v-card color="primary" class="mb-4">
        <v-card-text class="pa-5">
          <v-row dense align="center">
            <v-col cols="12" md="6">
              <div class="d-flex align-start ga-4">
                <v-avatar color="primary" variant="flat" size="54">
                  <v-icon size="28">mdi-clipboard-text-outline</v-icon>
                </v-avatar>

                <div>
                  <div class="text-caption text-medium-emphasis">
                    No Registrasi
                  </div>

                  <div class="text-h5 font-weight-bold">
                    {{ detail.kode_registrasi || `REG-${detail.id || "-"}` }}
                  </div>

                  <div class="text-body-2 mt-1">
                    {{ getPasienName(detail) }}
                  </div>

                  <div class="d-flex align-center flex-wrap ga-2 mt-3">
                    <v-chip
                      size="small"
                      :color="statusMeta.color"
                      variant="flat"
                      :prepend-icon="statusMeta.icon"
                    >
                      {{ statusMeta.label }}
                    </v-chip>

                    <v-chip
                      size="small"
                      :color="taskMeta.color"
                      variant="flat"
                      :prepend-icon="taskMeta.icon"
                    >
                      {{ taskMeta.label }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="d-flex justify-start justify-md-end">
                <div class="text-md-right">
                  <div class="text-caption text-medium-emphasis">
                    Grand Total
                  </div>
                  <div class="text-h5 font-weight-bold">
                    Rp {{ formatNumber(detail.grand_total || 0) }}
                  </div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ formatDate(detail.tanggal_kunjungan || detail.tanggal) }}
                    •
                    {{ formatTime(detail.registered_at || detail.created_at) }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <div class="d-flex align-center flex-wrap ga-2">
            <v-chip
              v-if="hasConsultation"
              color="primary"
              variant="flat"
              size="small"
              prepend-icon="mdi-stethoscope"
            >
              {{ getConsultationLabel(detail) }}
            </v-chip>

            <v-chip
              v-if="hasTreatment"
              color="success"
              variant="flat"
              size="small"
              prepend-icon="mdi-face-woman-shimmer-outline"
            >
              Treatment
            </v-chip>

            <v-chip
              v-if="hasSales"
              color="info"
              variant="flat"
              size="small"
              prepend-icon="mdi-cart-outline"
            >
              Penjualan
            </v-chip>

            <v-chip
              v-if="isPembelianOnline"
              color="deep-purple"
              variant="flat"
              size="small"
              prepend-icon="mdi-web"
            >
              Pembelian Online
            </v-chip>
          </div>

          <v-spacer />

          <div class="d-flex align-center flex-wrap ga-2">
            <v-btn
              v-if="canProcess"
              color="primary"
              variant="flat"
              prepend-icon="mdi-play-circle-outline"
              :loading="actionLoading"
              @click="processCurrentTask"
            >
              Proses Task
            </v-btn>

            <v-btn
              v-if="canCancel"
              color="error"
              prepend-icon="mdi-close-circle-outline"
              :disabled="actionLoading"
              @click="confirmCancel"
            >
              Batalkan
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>

      <v-row dense class="mb-4">
        <v-col cols="12" md="3">
          <v-card variant="outlined">
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary">
                  <v-icon>mdi-store-outline</v-icon>
                </v-avatar>

                <div>
                  <div class="text-caption text-medium-emphasis">Cabang</div>
                  <div class="text-body-2 font-weight-bold">
                    {{ getTokoName(detail) }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card variant="outlined">
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary">
                  <v-icon>mdi-doctor</v-icon>
                </v-avatar>

                <div>
                  <div class="text-caption text-medium-emphasis">Dokter</div>
                  <div class="text-body-2 font-weight-bold">
                    {{ getDokterName(detail) }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card variant="outlined">
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3">
                <v-avatar color="success">
                  <v-icon>mdi-account-heart-outline</v-icon>
                </v-avatar>

                <div>
                  <div class="text-caption text-medium-emphasis">Perawat</div>
                  <div class="text-body-2 font-weight-bold">
                    {{ getPerawatName(detail) }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card variant="outlined">
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3">
                <v-avatar color="info">
                  <v-icon>mdi-cash-multiple</v-icon>
                </v-avatar>

                <div>
                  <div class="text-caption text-medium-emphasis">
                    Biaya Konsul
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    Rp {{ formatNumber(detail.total_konsultasi || 0) }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card variant="outlined">
        <v-tabs
          v-model="activeTab"
          color="primary"
          density="comfortable"
          show-arrows
        >
          <v-tab value="overview">
            <v-icon start>mdi-view-dashboard-outline</v-icon>
            Ringkasan
          </v-tab>

          <v-tab value="clinical">
            <v-icon start>mdi-clipboard-pulse-outline</v-icon>
            Klinis
          </v-tab>

          <v-tab value="items">
            <v-icon start>mdi-package-variant-closed</v-icon>
            Item Layanan
          </v-tab>

          <v-tab value="tasks">
            <v-icon start>mdi-timeline-clock-outline</v-icon>
            Task
          </v-tab>
        </v-tabs>

        <v-divider />

        <v-window v-model="activeTab">
          <v-window-item value="overview">
            <v-card-text class="pa-4">
              <v-row dense>
                <v-col cols="12" md="5">
                  <v-card>
                    <v-card-title class="text-subtitle-2 font-weight-bold">
                      Data Pasien & Registrasi
                    </v-card-title>

                    <v-divider />

                    <v-list density="compact">
                      <v-list-item
                        title="Nama Pasien"
                        :subtitle="getPasienName(detail)"
                        prepend-icon="mdi-account-outline"
                      />

                      <v-list-item
                        title="No. RM"
                        :subtitle="getPasienValue(detail, 'no_rm')"
                        prepend-icon="mdi-card-account-details-outline"
                      />

                      <v-list-item
                        title="No. HP"
                        :subtitle="getPasienValue(detail, 'no_hp')"
                        prepend-icon="mdi-phone-outline"
                      />

                      <v-list-item
                        title="Tanggal Kunjungan"
                        :subtitle="
                          formatDate(detail.tanggal_kunjungan || detail.tanggal)
                        "
                        prepend-icon="mdi-calendar"
                      />

                      <v-list-item
                        title="Jam Registrasi"
                        :subtitle="
                          formatTime(detail.registered_at || detail.created_at)
                        "
                        prepend-icon="mdi-clock-outline"
                      />

                      <v-list-item
                        title="Catatan Registrasi"
                        :subtitle="detail.catatan_registrasi || '-'"
                        prepend-icon="mdi-note-text-outline"
                      />
                    </v-list>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card>
                    <v-card-title class="text-subtitle-2 font-weight-bold">
                      Ringkasan Biaya
                    </v-card-title>

                    <v-divider />

                    <v-list density="compact">
                      <v-list-item
                        title="Konsultasi"
                        :subtitle="`Rp ${formatNumber(detail.total_konsultasi || 0)}`"
                      />

                      <v-list-item
                        title="Treatment"
                        :subtitle="`Rp ${formatNumber(detail.total_treatment || 0)}`"
                      />

                      <v-list-item
                        title="Penjualan"
                        :subtitle="`Rp ${formatNumber(detail.total_penjualan || 0)}`"
                      />

                      <v-divider class="my-2" />

                      <v-list-item>
                        <v-list-item-title class="font-weight-bold">
                          Grand Total
                        </v-list-item-title>
                        <v-list-item-subtitle
                          class="text-primary font-weight-bold"
                        >
                          Rp {{ formatNumber(detail.grand_total || 0) }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item
                        title="Rule Biaya Konsultasi"
                        :subtitle="
                          getRuleBiayaKonsultasiLabel(
                            detail.rule_biaya_konsultasi,
                          )
                        "
                      />
                    </v-list>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3">
                  <v-card>
                    <v-card-title class="text-subtitle-2 font-weight-bold">
                      Accurate Mapping
                    </v-card-title>

                    <v-divider />

                    <v-card-text class="pa-4">
                      <div v-if="hasConsultation" class="mb-4">
                        <div class="text-caption text-medium-emphasis mb-2">
                          Konsultasi
                        </div>

                        <div class="d-flex flex-wrap ga-2 mb-2">
                          <v-chip size="x-small" color="primary">
                            {{ consultationMapping.source_code || "-" }}
                          </v-chip>

                          <v-chip
                            size="x-small"
                            :color="
                              consultationMapping.kode_accurate
                                ? 'success'
                                : 'warning'
                            "
                          >
                            {{
                              consultationMapping.kode_accurate ||
                              "Belum ada kode"
                            }}
                          </v-chip>
                        </div>

                        <div class="text-body-2">
                          {{ consultationMapping.source_name || "-" }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ getConsultationChannelLabel(detail) }}
                        </div>
                      </div>

                      <div v-if="isPembelianOnline">
                        <div class="text-caption text-medium-emphasis mb-2">
                          Pembelian Online
                        </div>

                        <div class="d-flex flex-wrap ga-2 mb-2">
                          <v-chip size="x-small" color="deep-purple">
                            {{
                              pembelianOnlineMapping.source_code ||
                              "PEMBELIAN_ONLINE"
                            }}
                          </v-chip>

                          <v-chip
                            size="x-small"
                            :color="
                              pembelianOnlineMapping.kode_accurate
                                ? 'success'
                                : 'warning'
                            "
                          >
                            {{
                              pembelianOnlineMapping.kode_accurate ||
                              "Belum ada kode"
                            }}
                          </v-chip>
                        </div>

                        <div class="text-body-2">
                          {{
                            pembelianOnlineMapping.source_name ||
                            "Pembelian Online"
                          }}
                        </div>
                      </div>

                      <v-alert
                        v-if="!hasConsultation && !isPembelianOnline"
                        type="info"
                        density="compact"
                      >
                        Tidak ada mapping tambahan.
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-window-item>

          <v-window-item value="clinical">
            <v-card-text class="pa-4">
              <v-card>
                <v-card-title class="d-flex align-center ga-3">
                  <v-avatar color="primary" variant="flat">
                    <v-icon>
                      {{
                        isConsultationOnline
                          ? "mdi-video-outline"
                          : "mdi-note-text-outline"
                      }}
                    </v-icon>
                  </v-avatar>

                  <div>
                    <div class="text-subtitle-2 font-weight-bold">
                      Detail Konsultasi
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{
                        isConsultationOnline
                          ? "Konsultasi online"
                          : "Konsultasi offline"
                      }}
                    </div>
                  </div>
                </v-card-title>

                <v-divider />

                <v-card-text>
                  <template v-if="hasConsultation">
                    <v-row dense>
                      <template v-if="isConsultationOnline">
                        <v-col cols="12" md="6">
                          <v-textarea
                            :model-value="getOnlineValue('keluhan')"
                            label="Keluhan"
                            variant="outlined"
                            density="compact"
                            readonly
                            rows="3"
                            hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-textarea
                            :model-value="getOnlineValue('alergi')"
                            label="Alergi"
                            variant="outlined"
                            density="compact"
                            readonly
                            rows="3"
                            hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-text-field
                            :model-value="getOnlineValue('sedang_hamil')"
                            label="Sedang Hamil"
                            variant="outlined"
                            density="compact"
                            readonly
                            hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-text-field
                            :model-value="getOnlineValue('sedang_menyusui')"
                            label="Sedang Menyusui"
                            variant="outlined"
                            density="compact"
                            readonly
                            hide-details
                          />
                        </v-col>
                      </template>

                      <template v-else>
                        <v-col cols="12" md="6">
                          <v-textarea
                            :model-value="getOfflineValue('keluhan_awal')"
                            label="Keluhan Awal"
                            variant="outlined"
                            density="compact"
                            readonly
                            rows="3"
                            hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-textarea
                            :model-value="getOfflineValue('catatan')"
                            label="Catatan"
                            variant="outlined"
                            density="compact"
                            readonly
                            rows="3"
                            hide-details
                          />
                        </v-col>
                      </template>
                    </v-row>
                  </template>

                  <v-alert v-else type="info">
                    Tidak ada data konsultasi.
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-window-item>

          <v-window-item value="items">
            <v-card-text class="pa-4">
              <v-row dense>
                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center ga-3">
                      <v-avatar color="success">
                        <v-icon>mdi-face-woman-shimmer-outline</v-icon>
                      </v-avatar>

                      <div>
                        <div class="text-subtitle-2 font-weight-bold">
                          Detail Treatment
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Item treatment dalam registrasi
                        </div>
                      </div>
                    </v-card-title>

                    <v-divider />

                    <v-card-text class="pa-0">
                      <v-table v-if="treatmentItems.length" density="compact">
                        <thead>
                          <tr>
                            <th>Treatment</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Harga</th>
                            <th class="text-right">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr
                            v-for="(item, index) in treatmentItems"
                            :key="item.id || index"
                          >
                            <td>{{ getTreatmentName(item) }}</td>
                            <td class="text-right">
                              {{ item.jumlah || item.qty || 1 }}
                            </td>
                            <td class="text-right">
                              Rp {{ formatNumber(getItemPrice(item)) }}
                            </td>
                            <td class="text-right">
                              Rp {{ formatNumber(getItemTotal(item)) }}
                            </td>
                          </tr>
                        </tbody>
                      </v-table>

                      <div v-else class="pa-4">
                        <v-alert type="info" density="compact">
                          Detail treatment belum tersedia.
                        </v-alert>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center ga-3">
                      <v-avatar color="info">
                        <v-icon>mdi-cart-outline</v-icon>
                      </v-avatar>

                      <div>
                        <div class="text-subtitle-2 font-weight-bold">
                          Detail Penjualan Produk
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Item produk atau obat dalam registrasi
                        </div>
                      </div>
                    </v-card-title>

                    <v-divider />

                    <v-card-text class="pa-0">
                      <v-table v-if="penjualanItems.length" density="compact">
                        <thead>
                          <tr>
                            <th>Produk</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Harga</th>
                            <th class="text-right">Diskon</th>
                            <th class="text-right">Subtotal</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr
                            v-for="(item, index) in penjualanItems"
                            :key="item.id || index"
                          >
                            <td>{{ getProdukName(item) }}</td>
                            <td class="text-right">
                              {{ item.jumlah || item.qty || 1 }}
                            </td>
                            <td class="text-right">
                              Rp {{ formatNumber(getItemPrice(item)) }}
                            </td>
                            <td class="text-right">
                              Rp {{ formatNumber(getItemDiscount(item)) }}
                            </td>
                            <td class="text-right">
                              Rp {{ formatNumber(getItemTotal(item)) }}
                            </td>
                          </tr>
                        </tbody>
                      </v-table>

                      <div v-else class="pa-4">
                        <v-alert type="info" density="compact">
                          Detail penjualan belum tersedia.
                        </v-alert>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-window-item>

          <v-window-item value="tasks">
            <v-card-text class="pa-4">
              <v-card variant="outlined">
                <v-card-title class="d-flex align-center ga-3">
                  <v-avatar color="primary">
                    <v-icon>mdi-timeline-clock-outline</v-icon>
                  </v-avatar>

                  <div>
                    <div class="text-subtitle-2 font-weight-bold">
                      Alur Task
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Riwayat task registrasi
                    </div>
                  </div>
                </v-card-title>

                <v-divider />

                <v-card-text class="pa-0">
                  <v-table v-if="taskItems.length" density="compact">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Mulai</th>
                        <th>Selesai</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="task in taskItems"
                        :key="task.id || task.task_order || task.task_type"
                      >
                        <td>
                          {{
                            task.task_label ||
                            task.nama_task ||
                            getTaskLabel(task.task_type || task.current_task)
                          }}
                        </td>
                        <td>
                          {{
                            task.status_label || getTaskStatusLabel(task.status)
                          }}
                        </td>
                        <td>{{ formatDateTime(task.started_at) }}</td>
                        <td>{{ formatDateTime(task.finished_at) }}</td>
                      </tr>
                    </tbody>
                  </v-table>

                  <div v-else class="pa-4">
                    <v-alert type="info" density="compact">
                      Task belum tersedia.
                    </v-alert>
                  </div>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card>
    </template>

    <v-alert v-else type="warning" border="start">
      Data registrasi tidak ditemukan.
    </v-alert>

    <v-dialog v-model="cancelDialog.show" max-width="460">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold pa-4">
          Batalkan Registrasi?
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <div class="text-body-2 mb-3">
            Data registrasi
            <strong>{{
              detail?.kode_registrasi || `REG-${detail?.id || "-"}`
            }}</strong>
            akan dibatalkan.
          </div>

          <v-alert type="warning" density="compact">
            Pastikan registrasi memang tidak dilanjutkan sebelum membatalkan.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            :disabled="cancelDialog.loading"
            @click="cancelDialog.show = false"
          >
            Tutup
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            :loading="cancelDialog.loading"
            @click="cancelRegistrasi"
          >
            Batalkan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
      timeout="2500"
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import registrasiLayananService from "@/services/registrasi/registrasiLayananService";

export default {
  name: "DetailRegistrasiLayanan",

  data() {
    return {
      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        {
          title: "Registrasi Layanan",
          disabled: false,
          to: "/resepsionis/registrasi-layanan",
        },
        { title: "Detail", disabled: true },
      ],

      activeTab: "overview",
      loading: false,
      actionLoading: false,
      errorMessage: "",
      detail: null,

      cancelDialog: {
        show: false,
        loading: false,
      },

      snackbar: {
        show: false,
        color: "success",
        text: "",
      },
    };
  },

  computed: {
    registrasiId() {
      return this.$route.params.id;
    },

    hasConsultation() {
      const item = this.detail || {};
      return (
        this.toBoolean(item.is_konsultasi) ||
        this.toBoolean(item.layanan?.ada_konsultasi) ||
        Boolean(item.konsultasi_source_code) ||
        Boolean(item.layanan?.konsultasi_source_code) ||
        Boolean(item.channel_konsultasi)
      );
    },

    hasTreatment() {
      const item = this.detail || {};
      return (
        this.toBoolean(item.is_treatment) ||
        this.toBoolean(item.layanan?.ada_treatment) ||
        this.treatmentItems.length > 0
      );
    },

    hasSales() {
      const item = this.detail || {};
      return (
        this.toBoolean(item.is_penjualan) ||
        this.toBoolean(item.layanan?.ada_penjualan) ||
        this.penjualanItems.length > 0
      );
    },

    isPembelianOnline() {
      const item = this.detail || {};
      return (
        this.toBoolean(item.is_pembelian_online) ||
        this.toBoolean(item.layanan?.is_pembelian_online)
      );
    },

    isConsultationOnline() {
      const sourceCode = String(
        this.detail?.konsultasi_source_code ||
          this.detail?.layanan?.konsultasi_source_code ||
          "",
      ).toUpperCase();

      const channel = String(
        this.detail?.channel_konsultasi ||
          this.detail?.layanan?.channel_konsultasi ||
          "",
      ).toLowerCase();

      return (
        channel === "online" || channel === "2" || sourceCode.includes("ONLINE")
      );
    },

    consultationMapping() {
      const item = this.detail || {};
      const mapping =
        item.layanan?.konsultasi_mapping ||
        item.konsultasi_mapping ||
        item.konsultasiMapping ||
        {};

      return {
        id: mapping.id || item.konsultasi_mapping_id || null,
        source_code:
          mapping.source_code ||
          item.konsultasi_source_code ||
          item.layanan?.konsultasi_source_code ||
          "-",
        source_name:
          mapping.source_name ||
          item.konsultasi_source_name ||
          item.layanan?.konsultasi_source_name ||
          "-",
        kode_accurate:
          mapping.kode_accurate ||
          item.konsultasi_kode_accurate ||
          item.kode_accurate_konsultasi ||
          null,
        nama_accurate:
          mapping.nama_accurate ||
          item.konsultasi_nama_accurate ||
          item.nama_accurate_konsultasi ||
          null,
        default_harga: mapping.default_harga || item.total_konsultasi || 0,
        is_billable: mapping.is_billable ?? null,
        is_send_to_accurate: mapping.is_send_to_accurate ?? null,
        send_when_zero: mapping.send_when_zero ?? null,
      };
    },

    pembelianOnlineMapping() {
      const item = this.detail || {};
      const mapping =
        item.layanan?.pembelian_online_mapping ||
        item.pembelian_online_mapping ||
        item.pembelianOnlineMapping ||
        {};

      return {
        id: mapping.id || item.pembelian_online_mapping_id || null,
        source_code:
          mapping.source_code ||
          item.pembelian_online_source_code ||
          item.layanan?.pembelian_online_source_code ||
          "PEMBELIAN_ONLINE",
        source_name:
          mapping.source_name ||
          item.pembelian_online_source_name ||
          item.layanan?.pembelian_online_source_name ||
          "Pembelian Online",
        kode_accurate:
          mapping.kode_accurate || item.pembelian_online_kode_accurate || null,
        nama_accurate:
          mapping.nama_accurate || item.pembelian_online_nama_accurate || null,
        is_billable: mapping.is_billable ?? null,
        is_send_to_accurate: mapping.is_send_to_accurate ?? null,
        send_when_zero: mapping.send_when_zero ?? null,
      };
    },

    statusMeta() {
      if (
        this.detail?.status_label &&
        typeof this.detail.status_label === "object"
      ) {
        return this.detail.status_label;
      }

      const status = Number(this.detail?.status || 0);

      if (status === 1) {
        return {
          label: "Aktif",
          color: "primary",
          icon: "mdi-progress-clock",
        };
      }

      if (status === 2) {
        return {
          label: "Selesai",
          color: "success",
          icon: "mdi-check-circle-outline",
        };
      }

      if (status === 9) {
        return {
          label: "Batal",
          color: "error",
          icon: "mdi-close-circle-outline",
        };
      }

      return {
        label: "Draft",
        color: "grey",
        icon: "mdi-file-outline",
      };
    },

    taskMeta() {
      if (
        this.detail?.current_task_label &&
        typeof this.detail.current_task_label === "object"
      ) {
        return this.detail.current_task_label;
      }

      const task = Number(this.detail?.current_task || 0);

      if (task === 1) {
        return {
          label: "Konsultasi",
          color: "primary",
          icon: "mdi-stethoscope",
        };
      }

      if (task === 2) {
        return {
          label: "Treatment",
          color: "success",
          icon: "mdi-face-woman-shimmer-outline",
        };
      }

      if (task === 3) {
        return {
          label: "Nurse Station",
          color: "teal",
          icon: "mdi-account-heart-outline",
        };
      }

      if (task === 4) {
        return {
          label: "Pembayaran",
          color: "info",
          icon: "mdi-cash-register",
        };
      }

      if (task === 5) {
        return {
          label: "Selesai",
          color: "success",
          icon: "mdi-check-all",
        };
      }

      return {
        label: "Draft",
        color: "grey",
        icon: "mdi-file-outline",
      };
    },

    canProcess() {
      return (
        Number(this.detail?.status || 0) === 1 &&
        Number(this.detail?.current_task || 0) > 0 &&
        Number(this.detail?.current_task || 0) < 5
      );
    },

    canCancel() {
      return Number(this.detail?.status || 0) === 1;
    },

    treatmentItems() {
      return this.asArray(
        this.detail?.treatment_details ||
          this.detail?.treatmentDetails ||
          this.detail?.treatment_items ||
          this.detail?.treatment?.items ||
          [],
      );
    },

    penjualanItems() {
      return this.asArray(
        this.detail?.penjualan_details ||
          this.detail?.penjualanDetails ||
          this.detail?.penjualan_items ||
          this.detail?.penjualan?.items ||
          [],
      );
    },

    taskItems() {
      return this.asArray(
        this.detail?.tasks ||
          this.detail?.task_details ||
          this.detail?.registrasi_tasks ||
          [],
      );
    },
  },

  created() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await registrasiLayananService.getById(
          this.registrasiId,
        );
        this.detail = this.extractDetail(response);
      } catch (error) {
        this.detail = null;
        this.errorMessage = this.getErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },

    extractDetail(response) {
      if (!response) return null;

      if (response.data?.data) return response.data.data;
      if (response.data) return response.data;
      return response;
    },

    async processCurrentTask() {
      if (!this.detail?.id) return;

      this.actionLoading = true;

      try {
        await registrasiLayananService.startCurrentTask(this.detail.id);
        this.showSnackbar("Task berhasil diproses", "success");
        await this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.actionLoading = false;
      }
    },

    confirmCancel() {
      this.cancelDialog.show = true;
    },

    async cancelRegistrasi() {
      if (!this.detail?.id) return;

      this.cancelDialog.loading = true;

      try {
        await registrasiLayananService.cancel(this.detail.id);
        this.cancelDialog.show = false;
        this.showSnackbar("Registrasi berhasil dibatalkan", "success");
        await this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.cancelDialog.loading = false;
      }
    },

    goBack() {
      this.$router.push("/resepsionis/registrasi-layanan");
    },

    asArray(value) {
      return Array.isArray(value) ? value : [];
    },

    toBoolean(value) {
      return (
        value === true ||
        value === 1 ||
        value === "1" ||
        String(value).toLowerCase() === "true"
      );
    },

    getPasienName(item) {
      return (
        item?.pasien?.nama || item?.pasien_nama || item?.nama_pasien || "-"
      );
    },

    getPasienValue(item, key) {
      return (
        item?.pasien?.[key] || item?.[`pasien_${key}`] || item?.[key] || "-"
      );
    },

    getDokterName(item) {
      return (
        item?.dokter_awal?.nama ||
        item?.dokterAwal?.nama ||
        item?.dokter?.nama ||
        item?.dokter_nama ||
        item?.nama_dokter ||
        "-"
      );
    },

    getPerawatName(item) {
      return (
        item?.perawat_awal?.nama ||
        item?.perawatAwal?.nama ||
        item?.perawat?.nama ||
        item?.perawat_nama ||
        item?.nama_perawat ||
        "-"
      );
    },

    getTokoName(item) {
      return (
        item?.toko?.nama_toko ||
        item?.toko?.nama ||
        item?.toko_nama ||
        item?.nama_toko ||
        "-"
      );
    },

    getConsultationLabel(item) {
      return (
        item?.layanan?.konsultasi_mapping?.source_name ||
        item?.konsultasi_mapping?.source_name ||
        item?.konsultasi_source_name ||
        item?.layanan?.konsultasi_source_name ||
        item?.channel_konsultasi_label ||
        item?.layanan?.channel_label ||
        "Konsultasi"
      );
    },

    getConsultationChannelLabel(item) {
      return (
        item?.channel_konsultasi_label ||
        item?.layanan?.channel_label ||
        (this.isConsultationOnline ? "Konsultasi Online" : "Konsultasi Offline")
      );
    },

    getRuleBiayaKonsultasiLabel(value) {
      const rule = Number(value || 0);
      if (rule === 1) return "Berbayar";
      if (rule === 2) return "Gratis karena ada treatment";
      if (rule === 3) return "Gratis / tidak ditagihkan";
      return "-";
    },

    getOnlineValue(key) {
      return (
        this.detail?.konsultasi_online?.[key] ||
        this.detail?.konsultasiOnline?.[key] ||
        this.detail?.[key] ||
        "-"
      );
    },

    getOfflineValue(key) {
      return (
        this.detail?.konsultasi_offline?.[key] ||
        this.detail?.konsultasiOffline?.[key] ||
        this.detail?.[key] ||
        "-"
      );
    },

    getTreatmentName(item) {
      return (
        item?.nama_treatment ||
        item?.treatment_nama ||
        item?.nama_tindakan ||
        item?.tindakan_nama ||
        item?.treatment?.nama ||
        item?.treatment?.nama_treatment ||
        item?.nama ||
        "-"
      );
    },

    getProdukName(item) {
      return (
        item?.nama_produk ||
        item?.produk_nama ||
        item?.nama_obat_bahan ||
        item?.obat_nama ||
        item?.produk?.nama ||
        item?.produk?.nama_produk ||
        item?.nama ||
        "-"
      );
    },

    getItemPrice(item) {
      return Number(
        item?.harga ||
          item?.harga_jual ||
          item?.harga_treatment ||
          item?.treatment_harga ||
          item?.price ||
          0,
      );
    },

    getItemDiscount(item) {
      return Number(
        item?.diskon_nilai ||
          item?.diskon_value ||
          item?.diskon ||
          item?.discount ||
          0,
      );
    },

    getItemTotal(item) {
      return Number(
        item?.subtotal ||
          item?.total ||
          item?.total_harga ||
          this.getItemPrice(item) * Number(item?.jumlah || item?.qty || 1),
      );
    },

    getTaskLabel(value) {
      const task = Number(value || 0);
      if (task === 1) return "Konsultasi";
      if (task === 2) return "Treatment";
      if (task === 3) return "Nurse Station";
      if (task === 4) return "Pembayaran";
      if (task === 5) return "Selesai";
      return "-";
    },

    getTaskStatusLabel(value) {
      const status = Number(value || 0);
      if (status === 1) return "Aktif";
      if (status === 2) return "Selesai";
      if (status === 9) return "Batal";
      return "-";
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    formatDate(value) {
      if (!value) return "-";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatTime(value) {
      if (!value) return "-";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "-";

      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatDateTime(value) {
      if (!value) return "-";
      return `${this.formatDate(value)} ${this.formatTime(value)}`;
    },

    getErrorMessage(error) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Terjadi kesalahan"
      );
    },

    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>
