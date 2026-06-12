<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Booking Layanan</h1>
        <p class="page-subtitle">
          Daftar booking layanan pasien berdasarkan tanggal, status, dan cabang.
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0">
        <template #divider>
          <v-icon size="16">mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>
    </div>

    <v-card variant="flat" class="main-card">
      <div class="section-body">
        <v-row dense align="center">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="filters.search"
              placeholder="Cari kode booking, pasien, no HP, no RM..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="applyFilters"
              @click:clear="onClearSearch"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.tanggal"
              label="Tanggal"
              type="date"
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <div class="d-flex align-center justify-end ga-2 flex-wrap">
              <v-chip
                color="secondary"
                variant="tonal"
                size="small"
                class="font-weight-bold"
              >
                <v-icon icon="mdi-store-outline" start />
                {{ activeTokoId ? "Cabang aktif" : "Cabang belum dipilih" }}
              </v-chip>

              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-refresh"
                class="toolbar-btn"
                :loading="loading"
                @click="fetchData"
              >
                Refresh
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-alert
          v-if="!activeTokoId"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          Cabang aktif belum terpilih. Data booking akan lebih akurat jika
          cabang sudah dipilih dari header.
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          closable
          class="mt-4"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
      </div>

      <v-divider />

      <div class="px-4">
        <v-tabs
          v-model="activeTab"
          color="primary"
          align-tabs="start"
          slider-size="2"
          show-arrows
          class="queue-status-tabs"
          @update:model-value="onTabChange"
        >
          <v-tab
            v-for="tab in statusTabs"
            :key="tab.value"
            :value="tab.value"
            class="queue-status-tab text-none"
          >
            <div class="d-flex align-center ga-2">
              <v-icon :icon="tab.icon" size="18" />
              <span>{{ tab.label }}</span>
              <v-chip size="x-small" color="primary" variant="flat">
                {{ tab.count }}
              </v-chip>
            </div>
          </v-tab>
        </v-tabs>
      </div>

      <v-divider />

      <div class="section-body">
        <template v-if="loading">
          <div class="queue-card-list">
            <v-card
              v-for="index in 4"
              :key="`loading-${index}`"
              variant="flat"
              class="queue-item-card"
            >
              <v-card-text class="pa-4">
                <v-skeleton-loader type="article" />
              </v-card-text>
            </v-card>
          </div>
        </template>

        <template v-else-if="rows.length">
          <div class="queue-card-list">
            <v-card
              v-for="item in rows"
              :key="getCardKey(item)"
              variant="flat"
              class="queue-item-card"
            >
              <v-card-text class="pa-4">
                <div class="queue-card-layout">
                  <div class="queue-card-ticket">
                    <div class="ticket-number">
                      {{ getDisplayBookingNumber(item) }}
                    </div>
                    <div class="ticket-label">Booking</div>
                  </div>

                  <div class="queue-card-main">
                    <div class="queue-card-top">
                      <div class="queue-card-identity">
                        <div class="patient-name">
                          {{ getPasienName(item) }}
                        </div>

                        <div class="queue-meta-line">
                          <span>{{ getPasienMeta(item) }}</span>
                          <span>•</span>
                          <span>{{ getBookingCode(item) }}</span>
                        </div>
                      </div>

                      <div class="queue-card-status-inline">
                        <v-chip
                          size="small"
                          :color="statusMeta(item.status).color"
                          :prepend-icon="statusMeta(item.status).icon"
                          variant="flat"
                          class="font-weight-bold"
                        >
                          {{ statusMeta(item.status).text }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="queue-card-info">
                      <div class="queue-info-row">
                        <div class="queue-info-label">Jadwal</div>
                        <div class="queue-info-value">
                          {{ formatDate(getAppointmentDate(item)) }}
                          <span class="text-medium-emphasis">|</span>
                          {{ formatTime(getAppointmentTime(item)) }}
                          <span class="text-medium-emphasis">|</span>
                          <span :class="getScheduleTextClass(item)">
                            {{ getScheduleLabel(item) }}
                          </span>
                        </div>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Layanan</div>
                        <div class="queue-info-value">
                          {{ getLayananSummary(item) }}
                        </div>
                      </div>

                      <div class="queue-chip-row">
                        <v-chip
                          v-if="item.kategori?.nama"
                          size="small"
                          color="primary"
                          prepend-icon="mdi-shape-outline"
                          variant="tonal"
                          class="service-chip"
                        >
                          {{ item.kategori.nama }}
                        </v-chip>

                        <v-chip
                          v-if="item.dokter?.nama"
                          size="small"
                          color="success"
                          prepend-icon="mdi-stethoscope"
                          variant="tonal"
                          class="service-chip"
                        >
                          {{ item.dokter.nama }}
                        </v-chip>

                        <v-chip
                          v-if="item.treatment?.nama"
                          size="small"
                          color="info"
                          prepend-icon="mdi-face-woman-shimmer-outline"
                          variant="tonal"
                          class="service-chip"
                        >
                          Treatment
                        </v-chip>

                        <v-chip
                          v-if="item.source"
                          size="small"
                          color="secondary"
                          prepend-icon="mdi-source-branch"
                          variant="tonal"
                          class="service-chip"
                        >
                          {{ item.source }}
                        </v-chip>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Dokter</div>
                        <div class="queue-info-value">
                          {{ item.dokter?.nama || "Belum ditentukan" }}
                        </div>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Update</div>
                        <div class="queue-info-value">
                          {{ getStatusTimeLabel(item) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="queue-card-actions">
                    <v-btn
                      color="primary"
                      variant="flat"
                      prepend-icon="mdi-eye-outline"
                      class="text-none font-weight-bold"
                      @click="openDetail(item)"
                    >
                      Detail
                    </v-btn>

                    <v-menu location="bottom end">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          color="secondary"
                          variant="outlined"
                          prepend-icon="mdi-dots-horizontal"
                          class="text-none font-weight-bold"
                        >
                          Lainnya
                        </v-btn>
                      </template>

                      <v-list density="compact">
                        <v-list-item
                          prepend-icon="mdi-eye-outline"
                          title="Lihat Detail"
                          @click="openDetail(item)"
                        />

                        <v-divider
                          v-if="
                            canMarkLate(item) ||
                            canNoShow(item) ||
                            canCancel(item)
                          "
                        />

                        <v-list-item
                          v-if="canMarkLate(item)"
                          prepend-icon="mdi-clock-alert-outline"
                          title="Tandai Late"
                          base-color="warning"
                          :disabled="actionLoadingId !== null"
                          @click="confirmAction(item, 'late')"
                        />

                        <v-list-item
                          v-if="canNoShow(item)"
                          prepend-icon="mdi-account-off-outline"
                          title="Tandai No Show"
                          base-color="deep-orange"
                          :disabled="actionLoadingId !== null"
                          @click="confirmAction(item, 'no-show')"
                        />

                        <v-list-item
                          v-if="canCancel(item)"
                          prepend-icon="mdi-close-circle-outline"
                          title="Cancel Booking"
                          base-color="error"
                          :disabled="actionLoadingId !== null"
                          @click="confirmAction(item, 'cancel')"
                        />
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </template>

        <template v-else>
          <div class="empty-state">
            <v-avatar color="grey-lighten-3" size="64">
              <v-icon
                icon="mdi-calendar-remove-outline"
                size="34"
                color="grey"
              />
            </v-avatar>

            <div class="empty-title">Belum ada data booking</div>

            <div class="empty-description">
              Data booking akan muncul sesuai tanggal, status, dan cabang aktif.
            </div>

            <div class="empty-description">
              Coba ubah filter pencarian, tanggal, atau tab status.
            </div>
          </div>
        </template>
      </div>

      <v-divider />

      <div class="table-footer">
        <div class="footer-count">
          Total data:
          <strong>{{ pagination.total }}</strong>
        </div>

        <div class="footer-actions">
          <v-select
            v-model="pagination.perPage"
            class="per-page-field"
            :items="[10, 15, 25, 50, 100]"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="onPerPageChange"
          />

          <v-pagination
            v-model="pagination.page"
            :length="pagination.lastPage || 1"
            density="compact"
            total-visible="5"
            @update:model-value="fetchData"
          />
        </div>
      </div>
    </v-card>

    <v-dialog v-model="detailDialog.show" max-width="1180" scrollable>
      <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
        <v-sheet color="primary" class="pa-4">
          <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar size="44" color="white" rounded="lg">
                <v-icon
                  icon="mdi-calendar-check-outline"
                  color="primary"
                  size="26"
                />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold text-white">
                  Detail Booking
                </div>
                <div class="text-body-2 text-white">
                  {{ getBookingCode(detailDialog.item) }}
                </div>
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                v-if="detailDialog.item"
                size="small"
                color="white"
                variant="flat"
                class="font-weight-medium"
              >
                {{ statusMeta(detailDialog.item.status).text }}
              </v-chip>

              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                @click="detailDialog.show = false"
              />
            </div>
          </div>
        </v-sheet>

        <v-card-text v-if="detailDialog.item" class="pa-4">
          <v-row dense class="mb-4">
            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon icon="mdi-barcode-scan" color="primary" size="19" />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Kode Booking
                    </div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ getBookingCode(detailDialog.item) }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon
                      :icon="statusMeta(detailDialog.item.status).icon"
                      color="primary"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">Status</div>
                    <v-chip
                      size="small"
                      :color="statusMeta(detailDialog.item.status).color"
                      :prepend-icon="statusMeta(detailDialog.item.status).icon"
                      variant="tonal"
                      class="font-weight-bold mt-1"
                    >
                      {{ statusMeta(detailDialog.item.status).text }}
                    </v-chip>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon
                      icon="mdi-account-outline"
                      color="primary"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Nama Pasien
                    </div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ getPasienName(detailDialog.item) }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon icon="mdi-cellphone" color="primary" size="19" />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">No HP</div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ getPasienPhone(detailDialog.item) }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon
                      icon="mdi-calendar-clock"
                      color="primary"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">Jadwal</div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ formatDate(getAppointmentDate(detailDialog.item)) }}
                      ·
                      {{ formatTime(getAppointmentTime(detailDialog.item)) }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon icon="mdi-tag-outline" color="primary" size="19" />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Kategori
                    </div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ detailDialog.item.kategori?.nama || "-" }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon icon="mdi-doctor" color="primary" size="19" />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">Dokter</div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ detailDialog.item.dokter?.nama || "Belum ditentukan" }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon icon="mdi-stethoscope" color="primary" size="19" />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Treatment
                    </div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ detailDialog.item.treatment?.nama || "-" }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon
                      icon="mdi-source-branch"
                      color="primary"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">Source</div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ detailDialog.item.source || "-" }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="green-lighten-5">
                    <v-icon
                      icon="mdi-clock-outline"
                      color="success"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Status Time
                    </div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ getStatusTimeLabel(detailDialog.item) }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <v-card class="rounded-lg border" elevation="0">
            <v-card-text class="pa-4">
              <div class="d-flex align-start ga-3">
                <v-avatar size="34" color="blue-lighten-5">
                  <v-icon
                    icon="mdi-note-text-outline"
                    color="primary"
                    size="19"
                  />
                </v-avatar>

                <div>
                  <div class="text-caption text-medium-emphasis">Catatan</div>
                  <div class="text-body-2 text-high-emphasis mt-1">
                    {{
                      detailDialog.item.notes ||
                      detailDialog.item.catatan ||
                      "-"
                    }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 justify-end">
          <v-btn
            color="secondary"
            variant="outlined"
            prepend-icon="mdi-close"
            @click="detailDialog.show = false"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDialog.show" max-width="680" scrollable>
      <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
        <v-sheet :color="confirmColor || 'primary'" class="pa-4">
          <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar size="44" color="white" rounded="lg">
                <v-icon
                  icon="mdi-alert-circle-outline"
                  :color="confirmColor || 'primary'"
                  size="26"
                />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold text-white">
                  {{ confirmTitle }}
                </div>
                <div class="text-body-2 text-white">
                  {{ getBookingCode(confirmDialog.item) }}
                </div>
              </div>
            </div>

            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              :disabled="actionLoadingId !== null"
              @click="closeConfirmDialog"
            />
          </div>
        </v-sheet>

        <v-card-text class="pa-4">
          <v-alert
            type="warning"
            variant="tonal"
            border="start"
            rounded="lg"
            class="mb-4"
          >
            {{ confirmMessage }}
          </v-alert>

          <v-card class="rounded-lg border" elevation="0">
            <v-card-text class="pa-4">
              <div class="d-flex align-start ga-3">
                <v-avatar size="38" color="blue-lighten-5">
                  <v-icon
                    icon="mdi-calendar-check-outline"
                    color="primary"
                    size="22"
                  />
                </v-avatar>

                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    {{ getBookingCode(confirmDialog.item) }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis mt-1">
                    {{ getPasienName(confirmDialog.item) }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 justify-end">
          <v-btn
            color="secondary"
            variant="outlined"
            :disabled="actionLoadingId !== null"
            @click="closeConfirmDialog"
          >
            Tutup
          </v-btn>

          <v-btn
            :color="confirmColor"
            variant="flat"
            :loading="actionLoadingId !== null"
            :disabled="actionLoadingId !== null"
            @click="executeAction"
          >
            Proses
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
import bookingLayananService from "@/services/antrian/bookingLayananService";

export default {
  name: "AllBooking",

  data() {
    return {
      breadcrumbs: [
        {
          title: "Booking",
          disabled: true,
        },
        {
          title: "Booking Layanan",
          disabled: true,
        },
      ],

      loading: false,
      errorMessage: "",
      activeTab: "all",

      filters: {
        search: "",
        tanggal: this.getToday(),
        status: null,
      },

      rows: [],
      countRows: [],
      summaryData: {},

      pagination: {
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
      },

      statusOptions: [
        {
          label: "Semua",
          value: "all",
          icon: "mdi-format-list-bulleted",
        },
        {
          label: "Booked",
          value: "booked",
          icon: "mdi-calendar-outline",
        },
        {
          label: "Confirmed",
          value: "confirmed",
          icon: "mdi-calendar-check-outline",
        },
        {
          label: "Checked In",
          value: "checked_in",
          icon: "mdi-account-check-outline",
        },
        {
          label: "In Queue",
          value: "in_queue",
          icon: "mdi-account-clock-outline",
        },
        {
          label: "Called",
          value: "called",
          icon: "mdi-bullhorn-outline",
        },
        {
          label: "Serving",
          value: "serving",
          icon: "mdi-progress-clock",
        },
        {
          label: "Completed",
          value: "completed",
          icon: "mdi-check-circle-outline",
        },
        {
          label: "Late",
          value: "late",
          icon: "mdi-clock-alert-outline",
        },
        {
          label: "No Show",
          value: "no_show",
          icon: "mdi-account-off-outline",
        },
        {
          label: "Cancelled",
          value: "cancelled",
          icon: "mdi-close-circle-outline",
        },
        {
          label: "Rescheduled",
          value: "rescheduled",
          icon: "mdi-calendar-sync-outline",
        },
      ],

      detailDialog: {
        show: false,
        item: null,
      },

      confirmDialog: {
        show: false,
        item: null,
        type: "",
      },

      actionLoadingId: null,

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
    },

    statusTabs() {
      return this.statusOptions.map((status) => ({
        ...status,
        count: this.getTabCount(status.value),
      }));
    },

    confirmTitle() {
      if (this.confirmDialog.type === "cancel") return "Batalkan Booking?";
      if (this.confirmDialog.type === "no-show") return "Tandai No Show?";
      if (this.confirmDialog.type === "late") return "Tandai Terlambat?";

      return "Konfirmasi";
    },

    confirmMessage() {
      if (this.confirmDialog.type === "cancel") {
        return "Booking akan dibatalkan. Tindakan ini tidak menghapus data, hanya mengubah status menjadi cancelled.";
      }

      if (this.confirmDialog.type === "no-show") {
        return "Booking akan ditandai sebagai no-show karena pasien tidak datang.";
      }

      if (this.confirmDialog.type === "late") {
        return "Booking akan ditandai sebagai late karena pasien terlambat.";
      }

      return "Yakin ingin memproses data ini?";
    },

    confirmColor() {
      if (this.confirmDialog.type === "cancel") return "error";
      if (this.confirmDialog.type === "no-show") return "deep-orange";
      if (this.confirmDialog.type === "late") return "warning";

      return "primary";
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    getToday() {
      const date = new Date();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();

      return `${year}-${month}-${day}`;
    },

    async fetchData() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const params = {
          page: this.pagination.page,
          per_page: this.pagination.perPage,
          keyword: this.filters.search || undefined,
          tanggal: this.filters.tanggal || undefined,
          status: this.filters.status || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await bookingLayananService.getAll(params);
        const payload = response?.data || response;

        this.rows = this.extractRows(payload);
        this.summaryData = this.extractSummary(payload);
        this.applyPagination(payload);
        await this.fetchTabCounts();
      } catch (error) {
        this.rows = [];
        this.countRows = [];
        this.summaryData = {};
        this.pagination.total = 0;
        this.pagination.lastPage = 1;
        this.errorMessage = this.getErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },

    async fetchTabCounts() {
      try {
        const params = {
          page: 1,
          per_page: 1000,
          keyword: this.filters.search || undefined,
          tanggal: this.filters.tanggal || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await bookingLayananService.getAll(params);
        const payload = response?.data || response;

        this.countRows = this.extractRows(payload);
      } catch (error) {
        this.countRows = [...this.rows];
      }
    },

    extractRows(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.data?.data)) return payload.data.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.rows)) return payload.rows;

      return [];
    },

    extractSummary(payload) {
      return (
        payload?.summary ||
        payload?.data?.summary ||
        payload?.meta?.summary ||
        payload?.data?.meta?.summary ||
        {}
      );
    },

    applyPagination(payload) {
      const meta =
        payload?.meta || payload?.pagination || payload?.data?.meta || {};

      const total = Number(
        payload?.total ||
          meta?.total ||
          payload?.data?.total ||
          this.rows.length ||
          0,
      );

      const perPage = Number(
        payload?.per_page ||
          meta?.per_page ||
          meta?.perPage ||
          payload?.data?.per_page ||
          this.pagination.perPage ||
          15,
      );

      const currentPage = Number(
        payload?.current_page ||
          meta?.current_page ||
          meta?.currentPage ||
          payload?.data?.current_page ||
          this.pagination.page ||
          1,
      );

      const lastPage = Number(
        payload?.last_page ||
          meta?.last_page ||
          meta?.lastPage ||
          payload?.data?.last_page ||
          Math.ceil(total / perPage) ||
          1,
      );

      this.pagination.total = total;
      this.pagination.perPage = perPage;
      this.pagination.page = currentPage;
      this.pagination.lastPage = lastPage || 1;
    },

    applyFilters() {
      this.pagination.page = 1;
      this.fetchData();
    },

    onPerPageChange() {
      this.pagination.page = 1;
      this.fetchData();
    },

    onClearSearch() {
      this.filters.search = "";
      this.pagination.page = 1;
      this.fetchData();
    },

    onTabChange(value) {
      this.activeTab = value;
      this.pagination.page = 1;
      this.filters.status = value === "all" ? null : value;
      this.fetchData();
    },

    getTabCount(status) {
      const sourceRows = this.countRows.length ? this.countRows : this.rows;

      if (status === "all") {
        return sourceRows.length;
      }

      return sourceRows.filter(
        (item) => this.normalizeStatus(item.status) === status,
      ).length;
    },

    getCardKey(item) {
      return (
        item?.id ||
        item?.booking_code ||
        `${this.getPasienName(item)}-${this.getAppointmentDate(item)}`
      );
    },

    getBookingCode(item) {
      return (
        item?.booking_code || item?.kode_booking || `BOOK-${item?.id || "-"}`
      );
    },

    getDisplayBookingNumber(item) {
      const code = String(this.getBookingCode(item) || "");
      const numbers = code.match(/\d+/g);

      if (numbers && numbers.length) {
        const lastNumber = numbers[numbers.length - 1];
        return lastNumber.length > 3
          ? lastNumber.slice(-3)
          : lastNumber.padStart(3, "0");
      }

      if (item?.id) {
        return String(item.id).padStart(3, "0").slice(-3);
      }

      return "-";
    },

    getPasienName(item) {
      if (!item) return "-";

      return (
        item?.nama_pasien ||
        item?.pasien?.nama ||
        item?.pasien?.nama_pasien ||
        item?.nama_pelanggan ||
        "-"
      );
    },

    getPasienPhone(item) {
      if (!item) return "-";

      return (
        item?.no_hp ||
        item?.no_wa ||
        item?.pasien?.no_hp ||
        item?.pasien?.no_wa ||
        "-"
      );
    },

    getPasienMeta(item) {
      if (!item) return "-";

      return (
        [
          item?.pasien?.no_rm || item?.no_rm || "RM -",
          this.getPasienPhone(item),
        ]
          .filter(Boolean)
          .join(" • ") || "-"
      );
    },

    getAppointmentDate(item) {
      return (
        item?.appointment_at ||
        item?.booking_date ||
        item?.tanggal ||
        item?.created_at ||
        null
      );
    },

    getAppointmentTime(item) {
      return (
        item?.appointment_at ||
        item?.booking_time ||
        item?.jam ||
        item?.created_at ||
        null
      );
    },

    getLayananSummary(item) {
      const labels = [];

      if (item?.kategori?.nama) labels.push(item.kategori.nama);
      if (item?.treatment?.nama) labels.push(item.treatment.nama);
      if (item?.dokter?.nama) labels.push(`Dokter ${item.dokter.nama}`);

      return labels.length ? labels.join(" • ") : "-";
    },

    normalizeStatus(status) {
      const value = String(status || "booked").toLowerCase();

      if (["booking", "booked"].includes(value)) return "booked";
      if (["confirm", "confirmed"].includes(value)) return "confirmed";
      if (["checkin", "checked_in", "checked-in"].includes(value))
        return "checked_in";
      if (["queue", "in_queue", "in-queue"].includes(value)) return "in_queue";
      if (["call", "called"].includes(value)) return "called";
      if (["serve", "serving", "process", "processing"].includes(value))
        return "serving";
      if (
        ["done", "finish", "finished", "complete", "completed"].includes(value)
      )
        return "completed";
      if (["cancel", "cancelled", "canceled"].includes(value))
        return "cancelled";
      if (["no_show", "no-show", "noshow"].includes(value)) return "no_show";
      if (["reschedule", "rescheduled"].includes(value)) return "rescheduled";
      if (["late", "terlambat"].includes(value)) return "late";

      return value;
    },

    statusMeta(status) {
      const normalized = this.normalizeStatus(status);

      const meta = {
        booked: {
          text: "Booked",
          color: "blue-grey",
          icon: "mdi-calendar-outline",
        },
        confirmed: {
          text: "Confirmed",
          color: "primary",
          icon: "mdi-calendar-check-outline",
        },
        checked_in: {
          text: "Checked In",
          color: "info",
          icon: "mdi-account-check-outline",
        },
        in_queue: {
          text: "In Queue",
          color: "warning",
          icon: "mdi-account-clock-outline",
        },
        called: {
          text: "Called",
          color: "purple",
          icon: "mdi-bullhorn-outline",
        },
        serving: {
          text: "Serving",
          color: "success",
          icon: "mdi-progress-clock",
        },
        completed: {
          text: "Completed",
          color: "grey",
          icon: "mdi-check-circle-outline",
        },
        cancelled: {
          text: "Cancelled",
          color: "error",
          icon: "mdi-close-circle-outline",
        },
        no_show: {
          text: "No Show",
          color: "deep-orange",
          icon: "mdi-account-off-outline",
        },
        rescheduled: {
          text: "Rescheduled",
          color: "indigo",
          icon: "mdi-calendar-sync-outline",
        },
        late: {
          text: "Late",
          color: "warning",
          icon: "mdi-clock-alert-outline",
        },
      };

      return (
        meta[normalized] || {
          text: status || "-",
          color: "grey",
          icon: "mdi-information-outline",
        }
      );
    },

    getStatusTimeLabel(item) {
      if (!item) return "-";

      if (item.checked_in_at)
        return `Check-in ${this.formatDateTime(item.checked_in_at)}`;
      if (item.cancelled_at)
        return `Batal ${this.formatDateTime(item.cancelled_at)}`;
      if (item.completed_at)
        return `Selesai ${this.formatDateTime(item.completed_at)}`;
      if (item.updated_at)
        return `Update ${this.formatDateTime(item.updated_at)}`;

      return "-";
    },

    getScheduleLabel(item) {
      const appointment = this.parseDateTime(
        item?.appointment_at ||
          `${item?.booking_date || ""} ${item?.booking_time || ""}`,
      );

      if (!appointment) return "-";

      const now = new Date();
      const diffMinutes = Math.floor(
        (appointment.getTime() - now.getTime()) / 60000,
      );

      if (this.normalizeStatus(item.status) === "completed") return "Selesai";
      if (this.normalizeStatus(item.status) === "cancelled") return "Batal";
      if (this.normalizeStatus(item.status) === "no_show") return "No Show";

      if (diffMinutes > 60) {
        const hours = Math.floor(diffMinutes / 60);
        return `${hours} jam lagi`;
      }

      if (diffMinutes > 0) return `${diffMinutes} menit lagi`;
      if (diffMinutes > -60) return `Lewat ${Math.abs(diffMinutes)} menit`;

      const lateHours = Math.floor(Math.abs(diffMinutes) / 60);
      return `Lewat ${lateHours} jam`;
    },

    getScheduleTextClass(item) {
      const status = this.normalizeStatus(item?.status);

      if (["completed", "checked_in", "serving"].includes(status))
        return "text-success";
      if (["cancelled", "no_show"].includes(status)) return "text-error";
      if (status === "late") return "text-warning";

      const appointment = this.parseDateTime(
        item?.appointment_at ||
          `${item?.booking_date || ""} ${item?.booking_time || ""}`,
      );

      if (!appointment) return "";

      const diffMinutes = Math.floor(
        (appointment.getTime() - new Date().getTime()) / 60000,
      );

      if (diffMinutes < 0) return "text-warning";

      return "text-success";
    },

    openDetail(item) {
      this.detailDialog.item = item;
      this.detailDialog.show = true;
    },

    confirmAction(item, type) {
      this.confirmDialog.item = item;
      this.confirmDialog.type = type;
      this.confirmDialog.show = true;
    },

    closeConfirmDialog() {
      this.confirmDialog.show = false;
      this.confirmDialog.item = null;
      this.confirmDialog.type = "";
    },

    async executeAction() {
      const item = this.confirmDialog.item;
      const type = this.confirmDialog.type;

      if (!item?.id || !type) {
        this.showSnackbar("Data booking tidak valid", "error");
        return;
      }

      this.actionLoadingId = item.id;

      try {
        if (type === "cancel") {
          await bookingLayananService.cancel(item.id);
          this.showSnackbar("Booking berhasil dibatalkan", "success");
        }

        if (type === "no-show") {
          await bookingLayananService.noShow(item.id);
          this.showSnackbar("Booking berhasil ditandai no-show", "success");
        }

        if (type === "late") {
          await bookingLayananService.markLate(item.id);
          this.showSnackbar("Booking berhasil ditandai terlambat", "success");
        }

        this.closeConfirmDialog();
        await this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.actionLoadingId = null;
      }
    },

    canCancel(item) {
      const status = this.normalizeStatus(item?.status);
      return !["completed", "cancelled", "no_show"].includes(status);
    },

    canNoShow(item) {
      const status = this.normalizeStatus(item?.status);
      return ["booked", "confirmed", "late"].includes(status);
    },

    canMarkLate(item) {
      const status = this.normalizeStatus(item?.status);
      return ["booked", "confirmed"].includes(status);
    },

    parseDateTime(value) {
      if (!value) return null;

      const text = String(value).trim();

      if (!text) return null;

      const normalized = text.replace(" ", "T");
      const date = new Date(normalized);

      return Number.isNaN(date.getTime()) ? null : date;
    },

    formatDateTime(value) {
      if (!value) return "-";

      return `${this.formatDate(value)} ${this.formatTime(value)}`;
    },

    formatDate(value) {
      if (!value) return "-";

      const text = String(value);
      const datePart = text.split("T")[0].split(" ")[0];

      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [year, month, day] = datePart.split("-").map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatTime(value) {
      if (!value) return "-";

      if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
        return value.slice(0, 5);
      }

      const text = String(value);
      const timePart = text.includes("T")
        ? text.split("T")[1]
        : text.includes(" ")
          ? text.split(" ")[1]
          : "";

      if (timePart && /^\d{2}:\d{2}/.test(timePart)) {
        return timePart.slice(0, 5);
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "-";
      }

      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");

      return `${hour}:${minute}`;
    },

    getErrorMessage(error) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Terjadi kesalahan saat memuat data booking."
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
