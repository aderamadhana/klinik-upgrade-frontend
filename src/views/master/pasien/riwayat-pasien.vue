<template>
  <div>
    <div
      class="d-flex flex-column flex-lg-row justify-space-between align-start ga-3 mb-4"
    >
      <div>
        <div class="d-flex align-center ga-2 mb-2">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            size="small"
            :to="{ name: 'Master Pasien' }"
          />
          <span class="text-caption text-medium-emphasis">Master Pasien</span>
        </div>
        <h1 class="text-h5 text-md-h4 font-weight-bold mb-1">Riwayat Pasien</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Profil pasien, validasi identitas, membership, saldo, dan riwayat
          klinik dalam satu tampilan ringkas.
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" class="pa-0" />
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      closable
      class="mb-4"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-if="importantWarnings.length"
      type="warning"
      variant="tonal"
      border="start"
      density="compact"
      class="mb-4"
    >
      <div
        class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3"
      >
        <div>
          <div class="font-weight-bold">Data pasien perlu dilengkapi</div>
          <div class="text-body-2 mt-1">
            {{ importantWarnings.join(" • ") }}
          </div>
        </div>
        <v-chip color="warning" variant="flat" size="small">
          Prioritas administrasi
        </v-chip>
      </div>
    </v-alert>

    <v-card variant="outlined" class="mb-4 overflow-hidden">
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-sheet :class="['tier-gem-header', tierGemHeaderClass, 'pa-4 pa-md-5']">
        <v-row dense align="center" class="ga-lg-2">
          <v-col cols="12" lg="8">
            <div class="d-flex flex-column flex-sm-row align-start ga-4">
              <v-avatar size="72" :class="tierGemAvatarClass">
                <span class="text-h6 font-weight-bold">{{
                  patientInitial
                }}</span>
              </v-avatar>

              <div class="flex-grow-1">
                <div class="d-flex flex-wrap align-center ga-2 mb-2">
                  <v-chip
                    size="small"
                    class="tier-gem-meta-chip"
                    variant="flat"
                  >
                    {{ patient.noRm }}
                  </v-chip>
                  <v-chip
                    size="small"
                    class="tier-gem-meta-chip"
                    variant="flat"
                  >
                    {{ patient.gender }}
                  </v-chip>
                  <v-chip
                    size="small"
                    class="tier-gem-meta-chip"
                    variant="flat"
                  >
                    {{ patient.member.isMember ? "Member" : "Non Member" }}
                  </v-chip>

                  <v-chip
                    size="small"
                    class="tier-gem-meta-chip"
                    variant="flat"
                  >
                    KTP {{ patient.nik }}
                  </v-chip>

                  <v-chip
                    size="small"
                    class="tier-gem-meta-chip"
                    variant="flat"
                  >
                    IHS {{ patient.ihsNumber || "Belum tersedia" }}
                  </v-chip>
                  <v-chip
                    v-if="currentTierName !== '-'"
                    size="small"
                    class="tier-gem-tier-chip"
                    variant="flat"
                    prepend-icon="mdi-crown-outline"
                  >
                    {{ currentTierName }}
                  </v-chip>
                  <v-chip
                    v-if="tierState.member?.tier_mode"
                    size="small"
                    class="tier-gem-mode-chip"
                    variant="flat"
                  >
                    {{ tierState.member?.tier_mode_text || "Otomatis" }}
                  </v-chip>
                </div>

                <div
                  class="text-h5 text-md-h4 font-weight-bold text-high-emphasis"
                >
                  {{ patient.name }}
                </div>

                <div class="text-body-2 text-medium-emphasis mt-1">
                  {{ patient.birthPlace }}, {{ formatDate(patient.birthDate) }}
                  <span v-if="patient.age !== '-'">
                    • {{ patient.age }} tahun</span
                  >
                </div>

                <div class="d-flex flex-wrap align-center ga-2 mt-3">
                  <v-chip
                    size="small"
                    class="tier-gem-contact-chip"
                    variant="flat"
                    prepend-icon="mdi-phone-outline"
                  >
                    {{ patient.phone }}
                  </v-chip>
                  <v-chip
                    size="small"
                    class="tier-gem-contact-chip"
                    variant="flat"
                    prepend-icon="mdi-whatsapp"
                  >
                    {{ patient.whatsapp }}
                  </v-chip>
                  <v-chip
                    size="small"
                    class="tier-gem-contact-chip"
                    variant="flat"
                    prepend-icon="mdi-map-marker-outline"
                  >
                    {{ patient.address }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="4">
            <div class="d-flex flex-column ga-2">
              <div class="d-flex align-center justify-space-between ga-2">
                <div class="text-caption text-medium-emphasis font-weight-bold">
                  AKSI PASIEN
                </div>
                <v-chip
                  size="x-small"
                  :color="importantWarnings.length ? 'warning' : 'success'"
                  variant="flat"
                >
                  {{
                    importantWarnings.length ? "Perlu validasi" : "Data aman"
                  }}
                </v-chip>
              </div>

              <v-row dense>
                <v-col cols="12" sm="6" lg="6">
                  <v-btn
                    block
                    :color="isDiamondTier ? 'primary' : 'white'"
                    :variant="isDiamondTier ? 'flat' : 'tonal'"
                    prepend-icon="mdi-clipboard-text-outline"
                    :to="{
                      name: 'Pengkajian Pasien',
                      params: { id: patient.id },
                    }"
                  >
                    Pengkajian Awal
                  </v-btn>
                </v-col>

                <v-col cols="12" sm="6" lg="6">
                  <v-btn
                    block
                    :color="isDiamondTier ? 'primary' : 'white'"
                    variant="outlined"
                    prepend-icon="mdi-wallet-outline"
                    :to="{ name: 'Saldo Deposit', params: { id: patient.id } }"
                  >
                    Saldo Deposit
                  </v-btn>
                </v-col>

                <v-col cols="12" sm="6" lg="6">
                  <v-btn
                    block
                    :color="isDiamondTier ? 'deep-purple' : 'white'"
                    variant="tonal"
                    prepend-icon="mdi-image-multiple-outline"
                    @click="openBeforeAfterDialog"
                  >
                    Foto Before After
                  </v-btn>
                </v-col>

                <v-col cols="12" sm="6" lg="6">
                  <v-menu location="bottom end">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        block
                        :color="isDiamondTier ? undefined : 'white'"
                        variant="tonal"
                        prepend-icon="mdi-dots-horizontal"
                      >
                        Lainnya
                      </v-btn>
                    </template>

                    <v-list density="comfortable" min-width="260">
                      <v-list-item
                        prepend-icon="mdi-card-account-details"
                        title="Kartu Member Depan"
                        @click="openMemberCard('front')"
                      />
                      <v-list-item
                        prepend-icon="mdi-card-account-details-outline"
                        title="Kartu Member Belakang"
                        @click="openMemberCard('back')"
                      />
                      <v-list-item
                        prepend-icon="mdi-printer-outline"
                        title="Cetak Label Rekam Medis"
                        @click="printRmLabel"
                      />
                      <v-list-item
                        prepend-icon="mdi-face-recognition"
                        title="Skin Analyzer"
                        @click="openSkinAnalyzer"
                      />
                      <v-list-item
                        prepend-icon="mdi-map-marker-outline"
                        title="Alamat Pengiriman"
                        @click="shippingAddressDialog = true"
                      />
                    </v-list>
                  </v-menu>
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </v-sheet>

      <v-card-text class="pa-4 bg-grey-lighten-5">
        <v-row dense>
          <v-col cols="12" sm="6" lg="4" xl="2">
            <v-sheet rounded="lg" class="pa-3 bg-white h-100 border">
              <div class="d-flex align-center justify-space-between ga-3 mb-2">
                <div class="text-caption text-medium-emphasis font-weight-bold">
                  TOTAL KUNJUNGAN
                </div>
                <v-icon icon="mdi-calendar-check-outline" color="primary" />
              </div>
              <div class="text-h6 font-weight-bold">
                {{ formatNumber(summary.totalKunjungan) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Seluruh registrasi
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" sm="6" lg="4" xl="2">
            <v-sheet rounded="lg" class="pa-3 bg-white h-100 border">
              <div class="d-flex align-center justify-space-between ga-3 mb-2">
                <div class="text-caption text-medium-emphasis font-weight-bold">
                  TOTAL TRANSAKSI
                </div>
                <v-icon icon="mdi-cash-multiple" color="success" />
              </div>
              <div class="text-h6 font-weight-bold">
                {{ formatCurrency(summary.totalTransaksi) }}
              </div>
              <div class="text-caption text-medium-emphasis">Invoice lunas</div>
            </v-sheet>
          </v-col>

          <v-col cols="12" sm="6" lg="4" xl="2">
            <v-sheet rounded="lg" class="pa-3 bg-white h-100 border">
              <div class="d-flex align-center justify-space-between ga-3 mb-2">
                <div class="text-caption text-medium-emphasis font-weight-bold">
                  POIN PASIEN
                </div>
                <v-icon icon="mdi-star-circle-outline" color="amber-darken-2" />
              </div>
              <div class="text-h6 font-weight-bold">
                {{ formatNumber(patient.points) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Nilai {{ formatCurrency(patient.pointsValue) }}
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" sm="6" lg="4" xl="2">
            <v-sheet rounded="lg" class="pa-3 bg-white h-100 border">
              <div class="d-flex align-center justify-space-between ga-3 mb-2">
                <div class="text-caption text-medium-emphasis font-weight-bold">
                  SALDO DEPOSIT
                </div>
                <v-icon icon="mdi-wallet-outline" color="deep-purple" />
              </div>
              <div class="text-h6 font-weight-bold">
                {{ formatCurrency(summary.depositBalance) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatQty(summary.depositQty) }} treatment tersisa
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" sm="6" lg="4" xl="2">
            <v-sheet rounded="lg" class="pa-3 bg-white h-100 border">
              <div class="d-flex align-center justify-space-between ga-3 mb-2">
                <div class="text-caption text-medium-emphasis font-weight-bold">
                  TRANSAKSI HARI INI
                </div>
                <v-icon icon="mdi-calendar-today-outline" color="info" />
              </div>
              <div class="text-h6 font-weight-bold">
                {{ formatCurrency(todayTransactionValue) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ todayTransactions.length }} transaksi
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" sm="6" lg="4" xl="2">
            <v-sheet rounded="lg" class="pa-3 bg-white h-100 border">
              <div class="d-flex align-center justify-space-between ga-3 mb-2">
                <div class="text-caption text-medium-emphasis font-weight-bold">
                  KUNJUNGAN TERAKHIR
                </div>
                <v-icon icon="mdi-clock-outline" color="orange-darken-2" />
              </div>
              <div class="text-body-1 font-weight-bold">
                {{ formatDate(summary.lastVisitDate) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ summary.lastVisitAt || "Belum ada waktu" }}
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row dense class="mb-4 align-start">
      <v-col cols="12" lg="4">
        <v-card variant="outlined" height="100%">
          <v-card-title
            class="d-flex align-center justify-space-between ga-2 py-4"
          >
            <span
              class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
            >
              <v-icon icon="mdi-crown-outline" size="21" />
              Membership & Tier
            </span>
            <v-btn
              variant="outline"
              color="primary"
              prepend-icon="mdi-history"
              :disabled="tierLoading"
              @click="tierHistoryDialog = true"
            >
              Riwayat
            </v-btn>
          </v-card-title>
          <v-divider />

          <v-progress-linear v-if="tierLoading" indeterminate color="primary" />

          <v-alert
            v-if="tierError"
            type="error"
            variant="tonal"
            density="compact"
            border="start"
            class="ma-4 mb-0"
          >
            {{ tierError }}
          </v-alert>

          <template v-if="patient.member.isMember">
            <v-card-text class="pa-4">
              <v-sheet
                rounded="xl"
                :class="['tier-gem-panel', tierGemPanelClass, 'pa-4 mb-4']"
              >
                <div class="d-flex align-start justify-space-between ga-3">
                  <div>
                    <div class="text-caption tier-gem-eyebrow">
                      TIER SAAT INI
                    </div>
                    <div class="text-h4 font-weight-bold mt-1">
                      {{ currentTierName }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis mt-1">
                      Berdasarkan spending:
                      <strong>{{
                        tierState.automatic_tier?.name || "-"
                      }}</strong>
                    </div>
                  </div>
                  <v-chip
                    size="small"
                    class="tier-gem-mode-chip"
                    variant="flat"
                  >
                    {{ tierState.member?.tier_mode_text || "Otomatis" }}
                  </v-chip>
                </div>
              </v-sheet>

              <v-sheet rounded="xl" class="pa-3 mb-4 bg-white">
                <div
                  class="d-flex flex-column flex-sm-row justify-space-between align-start ga-2 mb-3"
                >
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">
                      Manajemen Tier Manual
                    </div>
                    <div class="text-caption text-medium-emphasis mt-1">
                      Gunakan untuk mengubah tier pasien secara manual.
                    </div>
                  </div>
                  <v-chip
                    size="small"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-shield-account-outline"
                  >
                    Aksi Admin
                  </v-chip>
                </div>

                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="warning"
                      variant="flat"
                      prepend-icon="mdi-arrow-up-bold"
                      block
                      :disabled="
                        !tierState.next_tier || tierLoading || tierActionLoading
                      "
                      @click="openTierAction('upgrade')"
                    >
                      {{
                        tierState.next_tier
                          ? "Upgrade ke " + tierState.next_tier.name
                          : "Upgrade Tier"
                      }}
                    </v-btn>
                    <div
                      v-if="!tierState.next_tier"
                      class="text-caption text-medium-emphasis mt-1"
                    >
                      Pasien sudah berada di tier tertinggi.
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-btn
                      color="grey-darken-1"
                      variant="tonal"
                      prepend-icon="mdi-arrow-down-bold"
                      block
                      :disabled="
                        !tierState.previous_tier ||
                        tierLoading ||
                        tierActionLoading
                      "
                      @click="openTierAction('downgrade')"
                    >
                      {{
                        tierState.previous_tier
                          ? "Downgrade ke " + tierState.previous_tier.name
                          : "Downgrade Tier"
                      }}
                    </v-btn>
                    <div
                      v-if="!tierState.previous_tier"
                      class="text-caption text-medium-emphasis mt-1"
                    >
                      Pasien sudah berada di tier terendah.
                    </div>
                  </v-col>

                  <v-col v-if="tierState.can_reset_automatic" cols="12">
                    <v-btn
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-sync"
                      block
                      :disabled="tierLoading || tierActionLoading"
                      @click="openTierAction('automatic')"
                    >
                      Aktifkan Mode Otomatis
                    </v-btn>
                  </v-col>
                </v-row>
              </v-sheet>

              <v-row dense>
                <v-col cols="6">
                  <v-sheet rounded="lg" class="pa-3 bg-grey-lighten-5 h-100">
                    <div class="text-caption text-medium-emphasis">
                      Nomor Member
                    </div>
                    <div class="text-body-2 font-weight-bold mt-1">
                      {{ patient.member.noMember }}
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="6">
                  <v-sheet rounded="lg" class="pa-3 bg-grey-lighten-5 h-100">
                    <div class="text-caption text-medium-emphasis">Status</div>
                    <div class="text-body-2 font-weight-bold mt-1">
                      {{ patient.member.statusText }}
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="6">
                  <v-sheet rounded="lg" class="pa-3 bg-grey-lighten-5 h-100">
                    <div class="text-caption text-medium-emphasis">
                      Tanggal Daftar
                    </div>
                    <div class="text-body-2 font-weight-bold mt-1">
                      {{ formatDate(patient.member.registeredAt) }}
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="6">
                  <v-sheet rounded="lg" class="pa-3 bg-grey-lighten-5 h-100">
                    <div class="text-caption text-medium-emphasis">
                      Kedaluwarsa
                    </div>
                    <div class="text-body-2 font-weight-bold mt-1">
                      {{ formatDate(patient.member.expiredAt) }}
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="12">
                  <v-sheet rounded="lg" class="pa-3 bg-grey-lighten-5">
                    <div class="d-flex align-center justify-space-between ga-3">
                      <div>
                        <div class="text-caption text-medium-emphasis">
                          Total Spending
                        </div>
                        <div class="text-h6 font-weight-bold mt-1">
                          {{ formatCurrency(patient.member.totalSpending) }}
                        </div>
                      </div>
                      <v-icon
                        v-if="tierState.automatic_tier"
                        :icon="
                          tierState.is_automatic_match
                            ? 'mdi-check-circle-outline'
                            : 'mdi-alert-circle-outline'
                        "
                        :color="
                          tierState.is_automatic_match ? 'success' : 'warning'
                        "
                        size="26"
                      />
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>

              <v-alert
                v-if="tierState.member?.tier_mode === 'manual'"
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-4"
                border="start"
              >
                Tier dikunci manual. Pembayaran tidak akan mengubah tier sampai
                mode otomatis diaktifkan kembali.
              </v-alert>
            </v-card-text>
          </template>

          <v-card-text v-else>
            <v-alert type="info" variant="tonal" border="start">
              Pasien belum terdaftar sebagai member. Upgrade atau downgrade tier
              belum dapat dilakukan.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card variant="outlined" rounded="lg">
          <v-card-title
            class="d-flex align-center justify-space-between ga-2 py-4"
          >
            <span
              class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
            >
              <v-icon icon="mdi-history" size="21" />
              Riwayat Kunjungan Klinik
            </span>
            <v-chip
              v-if="filteredRiwayat.length"
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-format-list-bulleted"
            >
              {{ filteredRiwayat.length }} kunjungan
            </v-chip>
          </v-card-title>

          <v-divider />

          <v-progress-linear v-if="tierLoading" indeterminate color="primary" />
          <v-card-text class="pa-4 pa-md-5">
            <div class="mb-4">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="search"
                    label="Cari riwayat"
                    placeholder="Dokter, treatment, obat, catatan, invoice"
                    prepend-inner-icon="mdi-magnify"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @update:model-value="resetPage"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="transactionFilter"
                    :items="transactionOptions"
                    label="Jenis transaksi"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @update:model-value="resetPage"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="clinicFilter"
                    :items="clinicOptions"
                    label="Klinik"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @update:model-value="resetPage"
                  />
                </v-col>
              </v-row>
            </div>

            <v-skeleton-loader
              v-if="loading"
              type="list-item-two-line, list-item-two-line, list-item-two-line"
            />

            <template v-else>
              <v-expansion-panels
                v-if="paginatedRiwayat.length"
                variant="accordion"
              >
                <v-expansion-panel
                  v-for="item in paginatedRiwayat"
                  :key="item.id"
                  rounded="lg"
                  class="mb-3 border"
                >
                  <v-expansion-panel-title class="py-4">
                    <div
                      class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3 w-100 pr-3"
                    >
                      <div class="d-flex align-start ga-3">
                        <v-avatar
                          color="primary"
                          variant="tonal"
                          rounded="lg"
                          size="52"
                        >
                          <div class="text-center">
                            <div class="text-subtitle-2 font-weight-bold">
                              {{ formatDay(item.date) }}
                            </div>
                            <div class="text-caption">
                              {{ formatMonth(item.date) }}
                            </div>
                          </div>
                        </v-avatar>

                        <div>
                          <div class="d-flex flex-wrap align-center ga-2 mb-1">
                            <span class="font-weight-bold text-body-1">{{
                              item.clinic
                            }}</span>
                            <v-chip
                              size="x-small"
                              color="primary"
                              variant="tonal"
                            >
                              {{ item.transactionType }}
                            </v-chip>
                            <v-chip
                              size="x-small"
                              :color="item.status.color"
                              variant="tonal"
                            >
                              {{ item.status.text }}
                            </v-chip>
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ item.registrationCode }} •
                            {{ item.payment.invoiceNumber }}
                          </div>
                          <div
                            class="d-flex flex-wrap ga-3 mt-2 text-caption text-medium-emphasis"
                          >
                            <span class="d-flex align-center ga-1">
                              <v-icon icon="mdi-doctor" size="15" />
                              {{ item.doctor }}
                            </span>
                            <span class="d-flex align-center ga-1">
                              <v-icon
                                icon="mdi-account-heart-outline"
                                size="15"
                              />
                              {{ item.nurseNames.join(", ") || "-" }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="text-left text-md-right">
                        <div class="font-weight-bold">
                          {{ formatCurrency(item.payment.grandTotal) }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ formatDate(item.date) }}
                          {{ item.time ? `• ${item.time}` : "" }}
                        </div>
                        <div class="text-caption text-medium-emphasis mt-1">
                          {{ item.treatments.length }} treatment •
                          {{ item.products.length }} obat/produk
                        </div>
                      </div>
                    </div>
                  </v-expansion-panel-title>

                  <v-expansion-panel-text>
                    <div class="d-flex flex-wrap ga-2 mb-3">
                      <v-chip
                        v-for="service in item.services"
                        :key="service"
                        size="x-small"
                        variant="tonal"
                        color="primary"
                      >
                        {{ service }}
                      </v-chip>
                    </div>

                    <v-card variant="outlined" rounded="lg" class="mb-4">
                      <v-card-title class="px-3 py-2">
                        <div
                          class="d-flex align-center justify-space-between ga-2 w-100"
                        >
                          <div class="d-flex align-center ga-2">
                            <v-icon
                              icon="mdi-format-list-bulleted"
                              size="18"
                              color="primary"
                            />
                            <span
                              class="d-flex align-center ga-2 font-weight-bold"
                            >
                              Detail Item Kunjungan
                            </span>
                          </div>

                          <v-chip
                            size="x-small"
                            color="primary"
                            variant="tonal"
                          >
                            {{ item.treatments.length + item.products.length }}
                            item
                          </v-chip>
                        </div>
                      </v-card-title>

                      <v-divider />

                      <v-table density="compact">
                        <thead>
                          <tr>
                            <th class="text-caption font-weight-bold">Jenis</th>
                            <th class="text-caption font-weight-bold">Item</th>
                            <th
                              class="text-caption font-weight-bold text-center"
                            >
                              Qty
                            </th>
                            <th class="text-caption font-weight-bold">
                              Keterangan
                            </th>
                            <th class="text-caption font-weight-bold text-end">
                              Subtotal
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <template
                            v-for="treatment in item.treatments"
                            :key="`treatment-${treatment.id}`"
                          >
                            <tr>
                              <td>
                                <v-chip
                                  size="x-small"
                                  color="primary"
                                  variant="tonal"
                                >
                                  Treatment
                                </v-chip>
                              </td>

                              <td>
                                <div class="text-body-2 font-weight-bold">
                                  {{ treatment.name }}
                                </div>
                              </td>

                              <td class="text-center">
                                <v-chip size="x-small" variant="outlined">
                                  x{{ formatQty(treatment.qty) }}
                                </v-chip>
                              </td>

                              <td>
                                <div class="text-caption text-medium-emphasis">
                                  Pelaksana: {{ treatment.staff }}
                                </div>
                              </td>

                              <td class="text-end">
                                <div class="text-body-2 font-weight-bold">
                                  {{ formatCurrency(treatment.subtotal) }}
                                </div>
                              </td>
                            </tr>
                          </template>

                          <template
                            v-for="product in item.products"
                            :key="`product-${product.id}`"
                          >
                            <tr>
                              <td>
                                <v-chip
                                  size="x-small"
                                  color="success"
                                  variant="tonal"
                                >
                                  Obat / Produk
                                </v-chip>
                              </td>

                              <td>
                                <div class="text-body-2 font-weight-bold">
                                  {{ product.name }}
                                </div>
                              </td>

                              <td class="text-center">
                                <v-chip size="x-small" variant="outlined">
                                  x{{ formatQty(product.qty) }}
                                </v-chip>
                              </td>

                              <td>
                                <div class="text-caption text-medium-emphasis">
                                  <div v-if="product.unit">
                                    Satuan: {{ product.unit }}
                                  </div>
                                  <div v-if="product.usage">
                                    Aturan pakai: {{ product.usage }}
                                  </div>
                                  <div v-if="product.expiredAt">
                                    Expired: {{ formatDate(product.expiredAt) }}
                                  </div>
                                  <div
                                    v-if="
                                      !product.unit &&
                                      !product.usage &&
                                      !product.expiredAt
                                    "
                                  >
                                    -
                                  </div>
                                </div>
                              </td>

                              <td class="text-end">
                                <div class="text-body-2 font-weight-bold">
                                  {{ formatCurrency(product.subtotal) }}
                                </div>
                              </td>
                            </tr>
                          </template>

                          <tr
                            v-if="
                              !item.treatments.length && !item.products.length
                            "
                          >
                            <td colspan="5" class="text-center py-6">
                              <v-icon
                                icon="mdi-package-variant-closed-remove"
                                size="28"
                                color="grey"
                              />
                              <div class="text-body-2 font-weight-bold mt-2">
                                Tidak ada item treatment atau produk
                              </div>
                              <div
                                class="text-caption text-medium-emphasis mt-1"
                              >
                                Kunjungan ini belum memiliki detail item.
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-card>

                    <v-expansion-panels
                      multiple
                      variant="accordion"
                      class="mt-4"
                    >
                      <v-expansion-panel
                        v-if="item.intake"
                        rounded="lg"
                        class="mb-2 border"
                      >
                        <v-expansion-panel-title>
                          <span
                            class="d-flex align-center ga-2 font-weight-bold"
                          >
                            <v-icon
                              icon="mdi-clipboard-text-outline"
                              color="info"
                            />
                            Pengkajian Awal
                          </span>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <v-row dense>
                            <v-col cols="12" md="6">
                              <v-list density="compact" lines="two">
                                <v-list-item
                                  title="Jenis Konsultasi"
                                  :subtitle="item.intake.consultationType"
                                />
                                <v-list-item
                                  title="Dokter yang Diminta"
                                  :subtitle="item.intake.requestDoctor"
                                />
                                <v-list-item
                                  title="Keluhan Utama"
                                  :subtitle="item.intake.mainComplaint"
                                />
                                <v-list-item
                                  title="Keluhan Awal"
                                  :subtitle="item.intake.initialComplaint"
                                />
                              </v-list>
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-list density="compact" lines="two">
                                <v-list-item
                                  title="Alergi"
                                  :subtitle="item.intake.allergy"
                                />
                                <v-list-item
                                  title="Produk / Obat Sebelumnya"
                                  :subtitle="item.intake.previousProduct"
                                />
                                <v-list-item
                                  title="Hamil / Menyusui"
                                  :subtitle="`${item.intake.pregnant} / ${item.intake.breastfeeding}`"
                                />
                                <v-list-item
                                  title="Catatan Awal / CS"
                                  :subtitle="item.intake.notes"
                                />
                              </v-list>
                            </v-col>
                          </v-row>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <v-expansion-panel
                        v-if="item.soap"
                        rounded="lg"
                        class="mb-2 border"
                      >
                        <v-expansion-panel-title>
                          <span
                            class="d-flex align-center ga-2 font-weight-bold"
                          >
                            <v-icon icon="mdi-stethoscope" color="primary" />
                            SOAP Dokter
                          </span>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="d-flex flex-wrap align-center ga-2 mb-3">
                            <v-chip
                              size="small"
                              color="primary"
                              variant="tonal"
                              prepend-icon="mdi-doctor"
                            >
                              {{ item.soap.doctor }}
                            </v-chip>
                            <v-chip
                              size="small"
                              :color="item.soap.statusColor"
                              variant="tonal"
                            >
                              {{ item.soap.statusText }}
                            </v-chip>
                            <v-chip
                              v-if="item.soap.nextConsultationDate"
                              size="small"
                              variant="outlined"
                              prepend-icon="mdi-calendar-clock"
                            >
                              Kontrol
                              {{ formatDate(item.soap.nextConsultationDate) }}
                            </v-chip>
                          </div>

                          <v-row dense>
                            <v-col cols="12" md="6">
                              <v-card
                                variant="outlined"
                                rounded="lg"
                                height="100%"
                              >
                                <v-card-title
                                  class="text-subtitle-2 font-weight-bold"
                                  >Subjective</v-card-title
                                >
                                <v-card-text class="text-body-2">
                                  <div
                                    v-if="item.soap.subjective.length"
                                    class="d-flex flex-wrap ga-2"
                                  >
                                    <v-chip
                                      v-for="subjective in item.soap.subjective"
                                      :key="subjective"
                                      size="small"
                                      variant="tonal"
                                    >
                                      {{ subjective }}
                                    </v-chip>
                                  </div>
                                  <span v-else>-</span>
                                </v-card-text>
                              </v-card>
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-card
                                variant="outlined"
                                rounded="lg"
                                height="100%"
                              >
                                <v-card-title
                                  class="text-subtitle-2 font-weight-bold"
                                  >Objective</v-card-title
                                >
                                <v-card-text class="text-body-2">{{
                                  item.soap.objective
                                }}</v-card-text>
                              </v-card>
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-card
                                variant="outlined"
                                rounded="lg"
                                height="100%"
                              >
                                <v-card-title
                                  class="text-subtitle-2 font-weight-bold"
                                  >Assessment / Diagnosa</v-card-title
                                >
                                <v-card-text class="text-body-2">
                                  <div
                                    v-if="item.soap.assessment.length"
                                    class="d-flex flex-wrap ga-2 mb-2"
                                  >
                                    <v-chip
                                      v-for="assessment in item.soap.assessment"
                                      :key="assessment"
                                      size="small"
                                      color="warning"
                                      variant="tonal"
                                    >
                                      {{ assessment }}
                                    </v-chip>
                                  </div>
                                  <div>{{ item.soap.otherAssessment }}</div>
                                </v-card-text>
                              </v-card>
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-card
                                variant="outlined"
                                rounded="lg"
                                height="100%"
                              >
                                <v-card-title
                                  class="text-subtitle-2 font-weight-bold"
                                  >Plan</v-card-title
                                >
                                <v-card-text class="text-body-2">{{
                                  item.soap.plan
                                }}</v-card-text>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <v-expansion-panel
                        v-if="item.cppt.length"
                        rounded="lg"
                        class="mb-2 border"
                      >
                        <v-expansion-panel-title>
                          <span
                            class="d-flex align-center ga-2 font-weight-bold"
                          >
                            <v-icon
                              icon="mdi-notebook-heart-outline"
                              color="deep-purple"
                            />
                            CPPT Perawat ({{ item.cppt.length }})
                          </span>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <v-timeline
                            side="end"
                            density="compact"
                            truncate-line="both"
                          >
                            <v-timeline-item
                              v-for="cppt in item.cppt"
                              :key="cppt.id"
                              dot-color="deep-purple"
                              size="small"
                            >
                              <v-card variant="outlined" rounded="lg">
                                <v-card-title
                                  class="d-flex flex-wrap align-center justify-space-between ga-2 text-subtitle-2"
                                >
                                  <span class="font-weight-bold">{{
                                    cppt.nurse
                                  }}</span>
                                  <span
                                    class="text-caption text-medium-emphasis"
                                    >{{ cppt.date }}</span
                                  >
                                </v-card-title>
                                <v-card-text>
                                  <v-row dense>
                                    <v-col cols="12" sm="6"
                                      ><strong>S:</strong>
                                      {{ cppt.subjective }}</v-col
                                    >
                                    <v-col cols="12" sm="6"
                                      ><strong>O:</strong>
                                      {{ cppt.objective }}</v-col
                                    >
                                    <v-col cols="12" sm="6"
                                      ><strong>A:</strong>
                                      {{ cppt.assessment }}</v-col
                                    >
                                    <v-col cols="12" sm="6"
                                      ><strong>P:</strong>
                                      {{ cppt.plan }}</v-col
                                    >
                                    <v-col cols="12"
                                      ><strong>Tindakan/Evaluasi:</strong>
                                      {{ cppt.action }}</v-col
                                    >
                                  </v-row>
                                </v-card-text>
                              </v-card>
                            </v-timeline-item>
                          </v-timeline>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <v-expansion-panel rounded="lg" class="mb-2 border">
                        <v-expansion-panel-title>
                          <span
                            class="d-flex align-center ga-2 font-weight-bold"
                          >
                            <v-icon icon="mdi-cash-register" color="success" />
                            Detail Pembayaran
                          </span>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <v-row dense>
                            <v-col cols="12" md="7">
                              <v-table density="compact">
                                <thead>
                                  <tr>
                                    <th>Komponen</th>
                                    <th class="text-end">Nominal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>Subtotal Treatment</td>
                                    <td class="text-end">
                                      {{
                                        formatCurrency(
                                          item.payment.subtotalTreatment,
                                        )
                                      }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Subtotal Obat / Produk</td>
                                    <td class="text-end">
                                      {{
                                        formatCurrency(
                                          item.payment.subtotalProduct,
                                        )
                                      }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Subtotal Konsultasi</td>
                                    <td class="text-end">
                                      {{
                                        formatCurrency(
                                          item.payment.subtotalConsultation,
                                        )
                                      }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Diskon Item</td>
                                    <td class="text-end">
                                      -
                                      {{
                                        formatCurrency(
                                          item.payment.itemDiscount,
                                        )
                                      }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Diskon Subtotal</td>
                                    <td class="text-end">
                                      -
                                      {{
                                        formatCurrency(
                                          item.payment.subtotalDiscount,
                                        )
                                      }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Promo</td>
                                    <td class="text-end">
                                      -
                                      {{
                                        formatCurrency(
                                          item.payment.promoDiscount,
                                        )
                                      }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Diskon Member</td>
                                    <td class="text-end">
                                      -
                                      {{
                                        formatCurrency(
                                          item.payment.memberDiscount,
                                        )
                                      }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Redeem Poin</td>
                                    <td class="text-end">
                                      -
                                      {{
                                        formatCurrency(
                                          item.payment.pointRedeemValue,
                                        )
                                      }}
                                    </td>
                                  </tr>
                                </tbody>
                              </v-table>
                            </v-col>
                            <v-col cols="12" md="5">
                              <v-card
                                color="primary"
                                variant="tonal"
                                rounded="lg"
                              >
                                <v-card-text>
                                  <div class="text-caption font-weight-bold">
                                    GRAND TOTAL
                                  </div>
                                  <div class="text-h5 font-weight-bold mt-1">
                                    {{
                                      formatCurrency(item.payment.grandTotal)
                                    }}
                                  </div>
                                  <v-divider class="my-3" />
                                  <div
                                    class="d-flex justify-space-between text-body-2 mb-2"
                                  >
                                    <span>Total Bayar</span
                                    ><strong>{{
                                      formatCurrency(item.payment.totalPaid)
                                    }}</strong>
                                  </div>
                                  <div
                                    class="d-flex justify-space-between text-body-2 mb-2"
                                  >
                                    <span>Kembalian</span
                                    ><strong>{{
                                      formatCurrency(item.payment.change)
                                    }}</strong>
                                  </div>
                                  <div
                                    class="d-flex justify-space-between text-body-2 mb-2"
                                  >
                                    <span>Poin Diperoleh</span
                                    ><strong>{{
                                      formatQty(item.payment.pointEarned)
                                    }}</strong>
                                  </div>
                                  <div
                                    class="d-flex justify-space-between text-body-2"
                                  >
                                    <span>Tanggal Lunas</span
                                    ><strong>{{ item.payment.paidAt }}</strong>
                                  </div>
                                </v-card-text>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <v-expansion-panel rounded="lg" class="border">
                        <v-expansion-panel-title>
                          <span
                            class="d-flex align-center ga-2 font-weight-bold"
                          >
                            <v-icon
                              icon="mdi-note-text-outline"
                              color="orange-darken-2"
                            />
                            Catatan Kunjungan
                          </span>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <v-alert type="info" variant="tonal" border="start">
                            {{ item.notes }}
                          </v-alert>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-empty-state
                v-else
                icon="mdi-file-search-outline"
                title="Riwayat tidak ditemukan"
                text="Ubah kata kunci atau filter untuk melihat riwayat lainnya."
              />

              <div
                v-if="filteredRiwayat.length"
                class="d-flex flex-column flex-md-row justify-space-between align-center ga-3 mt-4"
              >
                <div class="text-body-2 text-medium-emphasis">
                  Menampilkan {{ paginationLabel.start }}–{{
                    paginationLabel.end
                  }}
                  dari {{ filteredRiwayat.length }} kunjungan
                </div>
                <v-pagination
                  v-model="page"
                  :length="pageCount"
                  :total-visible="6"
                  density="comfortable"
                />
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="skinAnalyzerDialog" max-width="960" scrollable>
      <v-card rounded="lg">
        <v-card-title
          class="d-flex align-start justify-space-between ga-4 px-5 py-4"
        >
          <div>
            <div class="text-h6 font-weight-bold">Skin Analyzer</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Simpan dan buka kembali tautan hasil analisis kulit pasien.
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="skinAnalyzerSaving"
            @click="closeSkinAnalyzer"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <v-alert
            type="info"
            variant="tonal"
            border="start"
            icon="mdi-qrcode-scan"
            class="mb-4"
          >
            Scan QR dari perangkat Skin Analyzer atau tempel link hasil analisis
            pada kolom berikut.
          </v-alert>

          <v-form ref="skinAnalyzerForm" @submit.prevent="saveSkinAnalyzer">
            <v-row dense align="start">
              <v-col cols="12" md="9">
                <v-text-field
                  v-model.trim="skinAnalyzerLink"
                  label="Link hasil Skin Analyzer"
                  placeholder="https://..."
                  prepend-inner-icon="mdi-link-variant"
                  variant="outlined"
                  density="comfortable"
                  :rules="skinAnalyzerLinkRules"
                  :disabled="skinAnalyzerSaving"
                  maxlength="2048"
                  counter
                  clearable
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-btn
                  type="submit"
                  block
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-content-save-outline"
                  height="48"
                  :loading="skinAnalyzerSaving"
                  :disabled="skinAnalyzerSaving"
                >
                  Simpan
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <v-alert
            v-if="skinAnalyzerError"
            type="error"
            variant="tonal"
            border="start"
            class="mb-4"
            closable
            @click:close="skinAnalyzerError = ''"
          >
            {{ skinAnalyzerError }}
          </v-alert>

          <div class="border rounded-lg overflow-hidden">
            <v-progress-linear
              v-if="skinAnalyzerLoading"
              indeterminate
              color="primary"
            />

            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Tanggal & Waktu</th>
                  <th class="text-left">Dioperasikan Oleh</th>
                  <th class="text-left">Cabang</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                <template v-if="skinAnalyzerLoading">
                  <tr
                    v-for="index in 3"
                    :key="`skin-analyzer-loading-${index}`"
                  >
                    <td colspan="5" class="py-3">
                      <v-skeleton-loader type="text" />
                    </td>
                  </tr>
                </template>

                <template v-else-if="skinAnalyzerItems.length">
                  <tr v-for="(item, index) in skinAnalyzerItems" :key="item.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ formatDateTime(item.created_at) }}</td>
                    <td class="font-weight-medium">
                      {{ item.operate_by || "-" }}
                    </td>
                    <td>{{ item.branch || "-" }}</td>
                    <td class="text-right">
                      <v-btn
                        color="primary"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-open-in-new"
                        @click="openSkinAnalyzerResult(item)"
                      >
                        Lihat Hasil
                      </v-btn>
                    </td>
                  </tr>
                </template>

                <tr v-else>
                  <td colspan="5" class="pa-0">
                    <div
                      class="d-flex flex-column align-center justify-center py-10 px-4 text-center"
                    >
                      <v-icon
                        icon="mdi-face-recognition"
                        size="42"
                        color="grey-lighten-1"
                        class="mb-2"
                      />
                      <div class="text-subtitle-2 font-weight-bold">
                        Belum ada hasil Skin Analyzer
                      </div>
                      <div class="text-body-2 text-medium-emphasis mt-1">
                        Tambahkan link hasil analisis pertama pasien melalui
                        form di atas.
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-5 py-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="secondary"
            :disabled="skinAnalyzerSaving"
            @click="closeSkinAnalyzer"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="shippingAddressDialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="font-weight-bold">Alamat Pengiriman</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="shippingAddressDialog = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-alert
            type="success"
            variant="tonal"
            border="start"
            icon="mdi-map-marker-outline"
          >
            {{ patient.shippingAddress }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="outlined" @click="shippingAddressDialog = false"
            >Tutup</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="tierHistoryDialog" max-width="1180" scrollable>
      <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
        <v-sheet color="primary" class="pa-4">
          <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar size="44" color="white" rounded="lg">
                <v-icon icon="mdi-crown-outline" color="primary" size="26" />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold text-white">
                  Riwayat Tier Pasien
                </div>
                <div class="text-body-2 text-white">
                  Audit perubahan tier otomatis dan manual.
                </div>
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                v-if="tierHistory?.length"
                size="small"
                color="white"
                variant="flat"
                class="font-weight-medium"
              >
                {{ tierHistory.length }} riwayat
              </v-chip>

              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                @click="tierHistoryDialog = false"
              />
            </div>
          </div>
        </v-sheet>

        <v-progress-linear v-if="tierLoading" indeterminate color="primary" />

        <v-card-text class="pa-4">
          <v-card
            v-if="tierHistory.length"
            class="rounded-lg border"
            elevation="0"
          >
            <v-card-text class="pa-4">
              <div
                class="d-flex align-start justify-space-between ga-3 flex-wrap mb-4"
              >
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Timeline Perubahan Tier
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Menampilkan perubahan tier, sumber perubahan, alasan,
                    spending snapshot, dan pembuat audit.
                  </div>
                </div>

                <v-chip color="primary" variant="tonal" size="small">
                  {{ tierHistory.length }} data
                </v-chip>
              </div>

              <v-timeline side="end" density="compact" truncate-line="both">
                <v-timeline-item
                  v-for="entry in tierHistory"
                  :key="entry.id"
                  :dot-color="tierHistoryColor(entry.action)"
                  size="small"
                >
                  <v-card variant="outlined" rounded="lg">
                    <v-card-text class="pa-4">
                      <div
                        class="d-flex flex-column flex-sm-row justify-space-between align-start ga-3"
                      >
                        <div class="flex-grow-1">
                          <div class="d-flex align-center flex-wrap ga-2 mb-2">
                            <div class="text-subtitle-2 font-weight-bold">
                              {{ entry.action_text }}
                            </div>

                            <v-chip
                              size="small"
                              :color="
                                entry.source === 'manual' ? 'warning' : 'info'
                              "
                              variant="tonal"
                            >
                              {{ entry.source_text }}
                            </v-chip>
                          </div>

                          <div class="d-flex align-center flex-wrap ga-2 mb-2">
                            <v-chip size="small" color="grey" variant="tonal">
                              {{ entry.old_tier?.name || "Belum ada tier" }}
                            </v-chip>

                            <v-icon icon="mdi-arrow-right" size="16" />

                            <v-chip
                              size="small"
                              :color="tierHistoryColor(entry.action)"
                              variant="tonal"
                            >
                              {{ entry.new_tier?.name || "Tanpa tier" }}
                            </v-chip>
                          </div>

                          <v-card
                            v-if="entry.reason"
                            class="rounded-lg border mt-3"
                            elevation="0"
                          >
                            <v-card-text class="pa-3">
                              <div
                                class="text-caption text-medium-emphasis mb-1"
                              >
                                Alasan perubahan
                              </div>
                              <div class="text-body-2 text-high-emphasis">
                                {{ entry.reason }}
                              </div>
                            </v-card-text>
                          </v-card>

                          <div class="d-flex flex-wrap ga-2 mt-3">
                            <v-chip
                              size="small"
                              color="primary"
                              variant="tonal"
                            >
                              Spending:
                              {{
                                formatCurrency(entry.total_spending_snapshot)
                              }}
                            </v-chip>

                            <v-chip
                              size="small"
                              color="secondary"
                              variant="tonal"
                            >
                              Oleh: {{ entry.created_by || "-" }}
                            </v-chip>
                          </div>
                        </div>

                        <div
                          class="text-body-2 text-medium-emphasis text-sm-right"
                        >
                          {{ formatDateTime(entry.effective_at) }}
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>

          <v-card
            v-else-if="!tierLoading"
            class="rounded-lg border"
            elevation="0"
          >
            <v-empty-state
              icon="mdi-crown-outline"
              title="Belum ada riwayat tier"
              text="Belum ada perubahan tier yang tercatat pada tabel audit tier."
            />
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            prepend-icon="mdi-close"
            @click="tierHistoryDialog = false"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="tierActionDialog" max-width="680" persistent scrollable>
      <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
        <v-sheet color="primary" class="pa-4">
          <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar size="44" color="white" rounded="lg">
                <v-icon
                  :icon="
                    tierActionType === 'downgrade'
                      ? 'mdi-arrow-down-bold-circle-outline'
                      : 'mdi-arrow-up-bold-circle-outline'
                  "
                  color="primary"
                  size="26"
                />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold text-white">
                  {{ tierActionTitle }}
                </div>
                <div class="text-body-2 text-white">
                  Perubahan tier disimpan sebagai audit dan berlaku pada
                  transaksi berikutnya.
                </div>
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                size="small"
                color="white"
                variant="flat"
                class="font-weight-medium"
              >
                {{ currentTierName }}
                <v-icon icon="mdi-arrow-right" size="14" class="mx-1" />
                {{ tierActionTarget?.name || currentTierName }}
              </v-chip>

              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                :disabled="tierActionLoading"
                @click="closeTierAction"
              />
            </div>
          </div>
        </v-sheet>

        <v-form ref="tierActionForm" @submit.prevent="submitTierAction">
          <v-card-text class="pa-4">
            <v-card class="rounded-lg border mb-4" elevation="0">
              <v-card-text class="pa-4">
                <div class="d-flex align-start ga-3">
                  <v-avatar
                    size="38"
                    :color="
                      tierActionType === 'downgrade'
                        ? 'orange-lighten-5'
                        : 'blue-lighten-5'
                    "
                  >
                    <v-icon
                      :icon="
                        tierActionType === 'downgrade'
                          ? 'mdi-alert-outline'
                          : 'mdi-information-outline'
                      "
                      :color="
                        tierActionType === 'downgrade' ? 'warning' : 'primary'
                      "
                      size="22"
                    />
                  </v-avatar>

                  <div class="flex-grow-1">
                    <div class="text-subtitle-2 font-weight-bold">
                      {{ currentTierName }}
                      <v-icon icon="mdi-arrow-right" size="16" class="mx-1" />
                      {{ tierActionTarget?.name || currentTierName }}
                    </div>

                    <div class="text-body-2 text-medium-emphasis mt-1">
                      {{ tierActionDescription }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="rounded-lg border" elevation="0">
              <v-card-text class="pa-4">
                <div class="text-subtitle-2 font-weight-bold mb-1">
                  Alasan Perubahan Tier
                </div>

                <div class="text-body-2 text-medium-emphasis mb-3">
                  Wajib diisi agar riwayat perubahan tier jelas saat diaudit.
                </div>

                <v-textarea
                  v-model="tierReason"
                  label="Alasan perubahan tier"
                  placeholder="Contoh: Penyesuaian keputusan manajemen berdasarkan evaluasi membership"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  counter="500"
                  :rules="tierReasonRules"
                  :disabled="tierActionLoading"
                  autofocus
                />
              </v-card-text>
            </v-card>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4 justify-end">
            <v-btn
              variant="outlined"
              color="secondary"
              :disabled="tierActionLoading"
              @click="closeTierAction"
            >
              Batal
            </v-btn>

            <v-btn
              :color="tierActionType === 'downgrade' ? 'warning' : 'primary'"
              variant="flat"
              type="submit"
              :loading="tierActionLoading"
              :disabled="tierActionLoading"
            >
              Konfirmasi
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="memberCardDialog" max-width="620">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center justify-space-between">
          <div>
            <div class="font-weight-bold">
              Kartu Member
              {{ memberCardSide === "front" ? "Depan" : "Belakang" }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Preview sebelum dicetak.
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="memberCardDialog = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-card
            v-if="memberCardSide === 'front'"
            color="primary"
            variant="flat"
            rounded="xl"
          >
            <v-card-text class="pa-6 text-white">
              <div class="d-flex justify-space-between align-start ga-4 mb-8">
                <div>
                  <div class="text-overline">MS GLOW AESTHETIC CLINIC</div>
                  <div class="text-h5 font-weight-bold">MEMBER CARD</div>
                </div>
                <v-icon icon="mdi-crown" size="34" />
              </div>
              <div class="text-h6 font-weight-bold">{{ patient.name }}</div>
              <div class="text-body-2 mt-1">{{ patient.member.noMember }}</div>
              <div class="d-flex justify-space-between align-end mt-6">
                <div>
                  <div class="text-caption">Tier</div>
                  <div class="font-weight-bold">{{ currentTierName }}</div>
                </div>
                <div class="text-right">
                  <div class="text-caption">No. RM</div>
                  <div class="font-weight-bold">{{ patient.noRm }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card v-else variant="outlined" rounded="xl">
            <v-card-text class="pa-6">
              <div class="text-subtitle-1 font-weight-bold mb-3">
                Informasi Member
              </div>
              <v-divider class="mb-4" />
              <div class="text-body-2 mb-2">
                Kartu ini milik {{ patient.name }}.
              </div>
              <div class="text-body-2 mb-2">
                Nomor member: {{ patient.member.noMember }}
              </div>
              <div class="text-body-2 mb-2">
                Berlaku sampai: {{ formatDate(patient.member.expiredAt) }}
              </div>
              <div class="text-caption text-medium-emphasis mt-5">
                Tunjukkan kartu ini pada saat transaksi di MS Glow Aesthetic
                Clinic.
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="outlined" @click="memberCardDialog = false"
            >Tutup</v-btn
          >
          <v-btn
            color="primary"
            prepend-icon="mdi-printer"
            @click="printMemberCard"
            >Cetak</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="beforeAfterDialog" max-width="1180" scrollable>
      <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
        <v-sheet color="primary" class="pa-4">
          <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar size="44" color="white" rounded="lg">
                <v-icon
                  icon="mdi-image-multiple-outline"
                  color="primary"
                  size="26"
                />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold text-white">
                  Foto Before After
                </div>
                <div class="text-body-2 text-white">
                  Pilih kunjungan treatment untuk melihat dokumentasi foto.
                </div>
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                v-if="photoVisitOptions?.length"
                size="small"
                color="white"
                variant="flat"
                class="font-weight-medium"
              >
                {{ photoVisitOptions.length }} kunjungan
              </v-chip>

              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                @click="beforeAfterDialog = false"
              />
            </div>
          </div>
        </v-sheet>

        <v-card-text class="pa-4">
          <v-card class="rounded-lg border mb-4" elevation="0">
            <v-card-text class="pa-4">
              <v-select
                v-model="photoVisitId"
                :items="photoVisitOptions"
                item-title="title"
                item-value="value"
                label="Kunjungan treatment"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-search"
                :disabled="photoLoading"
                hide-details
                @update:model-value="loadBeforeAfterPhotos"
              />
            </v-card-text>

            <v-progress-linear
              v-if="photoLoading"
              indeterminate
              color="primary"
            />
          </v-card>

          <v-alert
            v-if="photoError"
            type="warning"
            variant="tonal"
            border="start"
            rounded="lg"
            class="mb-4"
          >
            {{ photoError }}
          </v-alert>

          <v-row v-if="hasBeforeAfterPhotos" dense>
            <v-col cols="12" md="6">
              <v-card class="rounded-lg border h-100" elevation="0">
                <v-card-text class="pa-4">
                  <div
                    class="d-flex align-start justify-space-between ga-3 mb-4"
                  >
                    <div class="d-flex align-center ga-3">
                      <v-avatar size="36" color="blue-lighten-5">
                        <v-icon
                          icon="mdi-camera-outline"
                          color="primary"
                          size="20"
                        />
                      </v-avatar>

                      <div>
                        <div class="text-subtitle-1 font-weight-bold">
                          Before
                        </div>
                        <div class="text-body-2 text-medium-emphasis">
                          Dokumentasi sebelum treatment
                        </div>
                      </div>
                    </div>

                    <v-chip color="primary" variant="tonal" size="small">
                      {{ beforeAfterPhotos?.before?.length || 0 }} foto
                    </v-chip>
                  </div>

                  <v-row dense>
                    <v-col
                      v-for="photo in beforeAfterPhotos?.before || []"
                      :key="photo.id"
                      cols="12"
                      sm="4"
                    >
                      <v-card variant="outlined" rounded="lg">
                        <v-img :src="photo.url" height="190" cover>
                          <template #error>
                            <div
                              class="d-flex align-center justify-center fill-height bg-grey-lighten-3 text-caption text-medium-emphasis"
                            >
                              Foto tidak dapat dimuat
                            </div>
                          </template>
                        </v-img>

                        <v-divider />

                        <div
                          class="text-caption text-center text-medium-emphasis pa-2"
                        >
                          Foto {{ photo.order }}
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card class="rounded-lg border h-100" elevation="0">
                <v-card-text class="pa-4">
                  <div
                    class="d-flex align-start justify-space-between ga-3 mb-4"
                  >
                    <div class="d-flex align-center ga-3">
                      <v-avatar size="36" color="green-lighten-5">
                        <v-icon
                          icon="mdi-camera-plus-outline"
                          color="success"
                          size="20"
                        />
                      </v-avatar>

                      <div>
                        <div class="text-subtitle-1 font-weight-bold">
                          After
                        </div>
                        <div class="text-body-2 text-medium-emphasis">
                          Dokumentasi setelah treatment
                        </div>
                      </div>
                    </div>

                    <v-chip color="success" variant="tonal" size="small">
                      {{ beforeAfterPhotos?.after?.length || 0 }} foto
                    </v-chip>
                  </div>

                  <v-row dense>
                    <v-col
                      v-for="photo in beforeAfterPhotos?.after || []"
                      :key="photo.id"
                      cols="12"
                      sm="4"
                    >
                      <v-card variant="outlined" rounded="lg">
                        <v-img :src="photo.url" height="190" cover>
                          <template #error>
                            <div
                              class="d-flex align-center justify-center fill-height bg-grey-lighten-3 text-caption text-medium-emphasis"
                            >
                              Foto tidak dapat dimuat
                            </div>
                          </template>
                        </v-img>

                        <v-divider />

                        <div
                          class="text-caption text-center text-medium-emphasis pa-2"
                        >
                          Foto {{ photo.order }}
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-card
            v-else-if="!photoLoading && !photoError"
            class="rounded-lg border"
            elevation="0"
          >
            <v-empty-state
              icon="mdi-image-off-outline"
              title="Foto belum tersedia"
              text="Belum ada dokumentasi before dan after pada kunjungan yang dipilih."
            />
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            prepend-icon="mdi-close"
            @click="beforeAfterDialog = false"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import api from "@/services/api";
import antrianPerawatService from "@/services/pelayanan-medis/antrianPerawatService";

const defaultSummary = () => ({
  totalKunjungan: 0,
  totalTransaksi: 0,
  lastVisitDate: null,
  lastVisitAt: null,
  depositQty: 0,
  depositBalance: 0,
});

const defaultTierState = () => ({
  is_member: false,
  member: null,
  current_tier: null,
  previous_tier: null,
  next_tier: null,
  automatic_tier: null,
  can_upgrade: false,
  can_downgrade: false,
  can_reset_automatic: false,
  is_automatic_match: true,
  tiers: [],
  history: [],
});

const defaultPatient = (id = null) => ({
  id,
  noRm: "-",
  name: "-",
  gender: "-",
  category: "-",
  birthPlace: "-",
  birthDate: null,
  age: "-",
  nik: "-",
  nikInvalid: false,
  ihsNumber: "",
  religion: "-",
  job: "-",
  maritalStatus: "-",
  phone: "-",
  whatsapp: "-",
  telephone: "-",
  email: "-",
  address: "-",
  shippingAddress: "-",
  points: 0,
  pointsValue: 0,
  skinAnalyzerUrl: "",
  member: {
    isMember: false,
    id: null,
    noMember: "-",
    tierId: null,
    tierName: "-",
    status: null,
    statusText: "Belum menjadi member",
    registeredAt: null,
    expiredAt: null,
    totalSpending: 0,
    totalPoint: 0,
    pointUsed: 0,
    pointBalance: 0,
  },
});

export default {
  name: "RiwayatPasien",

  data() {
    return {
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        { title: "Pasien", disabled: false, to: { name: "Master Pasien" } },
        { title: "Riwayat", disabled: true },
      ],
      loading: false,
      errorMessage: "",
      search: "",
      transactionFilter: null,
      clinicFilter: null,
      page: 1,
      itemsPerPage: 5,
      patient: defaultPatient(this.$route.params.id),
      summary: defaultSummary(),
      riwayat: [],
      tierState: defaultTierState(),
      tierLoading: false,
      tierError: "",
      tierActionLoading: false,
      tierActionDialog: false,
      tierActionType: "upgrade",
      tierReason: "",
      tierReasonRules: [
        (value) =>
          Boolean(String(value || "").trim()) ||
          "Alasan perubahan wajib diisi.",
        (value) =>
          String(value || "").trim().length >= 5 ||
          "Alasan minimal 5 karakter.",
        (value) =>
          String(value || "").length <= 500 || "Alasan maksimal 500 karakter.",
      ],
      skinAnalyzerDialog: false,
      skinAnalyzerLoading: false,
      skinAnalyzerSaving: false,
      skinAnalyzerError: "",
      skinAnalyzerLink: "",
      skinAnalyzerItems: [],
      skinAnalyzerLinkRules: [
        (value) =>
          Boolean(String(value || "").trim()) ||
          "Link hasil Skin Analyzer wajib diisi.",
        (value) => {
          const link = String(value || "").trim();
          if (!link) return true;
          return (
            /^https?:\/\/[^\s]+$/i.test(link) ||
            "Gunakan link lengkap yang diawali http:// atau https://."
          );
        },
        (value) =>
          String(value || "").length <= 2048 || "Link maksimal 2048 karakter.",
      ],
      shippingAddressDialog: false,
      tierHistoryDialog: false,
      memberCardDialog: false,
      memberCardSide: "front",
      beforeAfterDialog: false,
      photoVisitId: null,
      photoLoading: false,
      photoError: "",
      beforeAfterPhotos: {
        before: [],
        after: [],
      },
      photoObjectUrls: [],
      snackbar: {
        show: false,
        message: "",
        color: "info",
      },
    };
  },

  computed: {
    pasienId() {
      return this.$route.params.id;
    },

    tierGemKey() {
      return this.resolveTierGemKey(this.currentTierName);
    },

    tierGemHeaderClass() {
      return `tier-gem-header--${this.tierGemKey}`;
    },

    tierGemPanelClass() {
      return `tier-gem-panel--${this.tierGemKey}`;
    },

    tierGemAvatarClass() {
      return [
        "tier-gem-avatar",
        this.tierGemKey === "diamond" ? "tier-gem-avatar--diamond" : "",
      ];
    },

    isDiamondTier() {
      return this.tierGemKey === "diamond";
    },

    patientInitial() {
      const name = String(this.patient.name || "").trim();
      if (!name || name === "-") return "P";

      return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
    },

    importantWarnings() {
      return [
        this.patient.nikInvalid ? "Format NIK pasien belum valid" : null,
        !this.patient.ihsNumber ? "Nomor IHS pasien belum tersedia" : null,
      ].filter(Boolean);
    },

    currentTierName() {
      if (this.tierState.current_tier?.name) {
        return this.tierState.current_tier.name;
      }

      if (
        this.patient.member.tierName &&
        this.patient.member.tierName !== "-"
      ) {
        return this.patient.member.tierName;
      }

      const latestTier = this.riwayat.find(
        (item) =>
          item.payment.memberTierName && item.payment.memberTierName !== "-",
      );

      return latestTier?.payment?.memberTierName || "-";
    },

    todayTransactions() {
      const today = this.toLocalDateKey(new Date());
      return this.riwayat.filter(
        (item) => this.toLocalDateKey(item.date) === today,
      );
    },

    todayTransactionValue() {
      return this.todayTransactions.reduce(
        (total, item) => total + Number(item.payment.grandTotal || 0),
        0,
      );
    },

    clinicOptions() {
      return [
        ...new Set(this.riwayat.map((item) => item.clinic).filter(Boolean)),
      ].sort();
    },

    transactionOptions() {
      return [
        ...new Set(
          this.riwayat.map((item) => item.transactionType).filter(Boolean),
        ),
      ].sort();
    },

    filteredRiwayat() {
      const keyword = String(this.search || "")
        .trim()
        .toLowerCase();

      return this.riwayat.filter((item) => {
        if (
          this.transactionFilter &&
          item.transactionType !== this.transactionFilter
        ) {
          return false;
        }

        if (this.clinicFilter && item.clinic !== this.clinicFilter) {
          return false;
        }

        if (!keyword) return true;

        return item.searchText.includes(keyword);
      });
    },

    pageCount() {
      return Math.max(
        1,
        Math.ceil(this.filteredRiwayat.length / this.itemsPerPage),
      );
    },

    paginatedRiwayat() {
      const start = (this.page - 1) * this.itemsPerPage;
      return this.filteredRiwayat.slice(start, start + this.itemsPerPage);
    },

    paginationLabel() {
      if (!this.filteredRiwayat.length) return { start: 0, end: 0 };

      return {
        start: (this.page - 1) * this.itemsPerPage + 1,
        end: Math.min(
          this.page * this.itemsPerPage,
          this.filteredRiwayat.length,
        ),
      };
    },

    tierHistory() {
      return Array.isArray(this.tierState.history)
        ? this.tierState.history
        : [];
    },

    tierActionTarget() {
      if (this.tierActionType === "upgrade") return this.tierState.next_tier;
      if (this.tierActionType === "downgrade")
        return this.tierState.previous_tier;
      return this.tierState.automatic_tier;
    },

    tierActionTitle() {
      if (this.tierActionType === "upgrade") return "Konfirmasi Upgrade Tier";
      if (this.tierActionType === "downgrade")
        return "Konfirmasi Downgrade Tier";
      return "Kembalikan Tier ke Mode Otomatis";
    },

    tierActionDescription() {
      if (this.tierActionType === "automatic") {
        return "Tier akan kembali mengikuti total spending. Perubahan otomatis berikutnya dapat mengubah tier tanpa konfirmasi manual.";
      }

      return "Tier akan dikunci dalam mode manual agar tidak ditimpa proses perhitungan tier otomatis saat pembayaran.";
    },

    photoVisitOptions() {
      return this.riwayat
        .filter((item) => item.treatments.length > 0)
        .map((item) => ({
          title: `${this.formatDate(item.date)} • ${item.clinic} • ${item.registrationCode}`,
          value: item.registrationId,
        }));
    },

    hasBeforeAfterPhotos() {
      return Boolean(
        this.beforeAfterPhotos.before.length ||
        this.beforeAfterPhotos.after.length,
      );
    },
  },

  watch: {
    pasienId() {
      this.loadData();
    },

    page(value) {
      if (value > this.pageCount) this.page = this.pageCount;
    },

    beforeAfterDialog(value) {
      if (!value) {
        this.cleanupPhotoObjectUrls();
        this.beforeAfterPhotos = { before: [], after: [] };
      }
    },
  },

  mounted() {
    this.loadData();
  },

  beforeUnmount() {
    this.cleanupPhotoObjectUrls();
  },

  methods: {
    async loadData() {
      if (!this.pasienId) {
        this.patient = defaultPatient();
        this.summary = defaultSummary();
        this.riwayat = [];
        this.tierState = defaultTierState();
        this.errorMessage = "ID pasien tidak valid.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await api.get(
          `/administrasi/pasien/${this.pasienId}/riwayat`,
          { params: { limit: 200 } },
        );

        if (!response.data?.status) {
          throw new Error(
            response.data?.message || "Gagal mengambil riwayat pasien.",
          );
        }

        const payload = response.data?.data || {};
        const rawHistory = Array.isArray(payload.riwayat)
          ? payload.riwayat
          : [];
        const mappedHistory = rawHistory.map((item) =>
          this.mapHistoryItem(item),
        );
        const latestTierName = mappedHistory.find(
          (item) =>
            item.payment.memberTierName && item.payment.memberTierName !== "-",
        )?.payment?.memberTierName;

        this.riwayat = mappedHistory;
        this.summary = this.mapSummary(payload.summary || {});
        this.patient = this.mapPatient(
          payload.patient || {},
          payload.summary || {},
          latestTierName,
        );
        await this.loadTierState(true);
        this.page = 1;
      } catch (error) {
        this.errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal mengambil riwayat pasien.";
        this.patient = defaultPatient(this.pasienId);
        this.summary = defaultSummary();
        this.riwayat = [];
        this.tierState = defaultTierState();
        console.error("Gagal mengambil riwayat pasien:", error);
      } finally {
        this.loading = false;
      }
    },

    async loadTierState(silent = false) {
      if (!this.pasienId) {
        this.tierState = defaultTierState();
        return;
      }

      this.tierLoading = true;
      this.tierError = "";

      try {
        const response = await api.get(
          `/administrasi/pasien/${this.pasienId}/tier`,
        );

        if (!response.data?.status) {
          throw new Error(
            response.data?.message || "Gagal mengambil data tier pasien.",
          );
        }

        this.applyTierState(response.data?.data || {});
      } catch (error) {
        this.tierState = defaultTierState();
        const message = this.getErrorMessage(
          error,
          "Gagal mengambil data tier pasien.",
        );
        this.tierError = message;

        if (!silent) {
          this.showSnackbar(message, "error");
        } else {
          console.error("Gagal mengambil data tier pasien:", error);
        }
      } finally {
        this.tierLoading = false;
      }
    },

    applyTierState(payload = {}) {
      this.tierState = {
        ...defaultTierState(),
        ...payload,
        tiers: Array.isArray(payload.tiers) ? payload.tiers : [],
        history: Array.isArray(payload.history) ? payload.history : [],
      };

      const member = payload.member;
      if (!member) {
        return;
      }

      this.patient = {
        ...this.patient,
        points: Number(member.point_sisa ?? this.patient.points ?? 0),
        member: {
          ...this.patient.member,
          isMember: true,
          id: member.id,
          noMember: member.no_member || this.patient.member.noMember,
          tierId: payload.current_tier?.id || member.member_tier_id || null,
          tierName: payload.current_tier?.name || "-",
          status: member.status,
          statusText: member.status_text || this.patient.member.statusText,
          registeredAt:
            member.tanggal_daftar || this.patient.member.registeredAt,
          expiredAt: member.tanggal_expired || this.patient.member.expiredAt,
          totalSpending: Number(member.total_spending || 0),
          totalPoint: Number(member.total_point || 0),
          pointUsed: Number(member.point_terpakai || 0),
          pointBalance: Number(member.point_sisa || 0),
        },
      };
    },

    openTierAction(action) {
      const allowed = {
        upgrade: Boolean(
          this.tierState.can_upgrade || this.tierState.next_tier,
        ),
        downgrade: Boolean(
          this.tierState.can_downgrade || this.tierState.previous_tier,
        ),
        automatic: this.tierState.can_reset_automatic,
      };

      if (!allowed[action]) {
        this.showSnackbar(
          "Aksi tier tidak tersedia untuk kondisi member saat ini.",
          "warning",
        );
        return;
      }

      this.tierActionType = action;
      this.tierReason = "";
      this.tierActionDialog = true;
      this.$nextTick(() => this.$refs.tierActionForm?.resetValidation());
    },

    closeTierAction() {
      if (this.tierActionLoading) return;
      this.tierActionDialog = false;
      this.tierReason = "";
      this.$refs.tierActionForm?.resetValidation();
    },

    async submitTierAction() {
      if (this.tierActionLoading) return;

      const validation = await this.$refs.tierActionForm?.validate();
      if (!validation?.valid) {
        this.showSnackbar("Lengkapi alasan perubahan tier.", "error");
        return;
      }

      const endpointAction =
        this.tierActionType === "automatic" ? "automatic" : this.tierActionType;

      this.tierActionLoading = true;

      try {
        const response = await api.post(
          `/administrasi/pasien/${this.pasienId}/tier/${endpointAction}`,
          { alasan: String(this.tierReason || "").trim() },
        );

        if (!response.data?.status) {
          throw new Error(
            response.data?.message || "Perubahan tier gagal diproses.",
          );
        }

        this.applyTierState(response.data?.data || {});
        this.tierActionDialog = false;
        this.tierReason = "";
        this.showSnackbar(
          response.data?.message || "Tier pasien berhasil diperbarui.",
          "success",
        );
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(error, "Perubahan tier gagal diproses."),
          "error",
        );
      } finally {
        this.tierActionLoading = false;
      }
    },

    tierHistoryColor(action) {
      if (action === "upgrade" || action === "assign") return "success";
      if (action === "downgrade" || action === "remove") return "warning";
      if (action === "sync") return "primary";
      return "info";
    },

    getErrorMessage(error, fallback) {
      const errors = error?.response?.data?.errors;
      const firstError =
        errors && typeof errors === "object"
          ? Object.values(errors).flat().find(Boolean)
          : null;

      return (
        firstError ||
        error?.response?.data?.message ||
        error?.message ||
        fallback
      );
    },

    mapSummary(summary = {}) {
      return {
        totalKunjungan: Number(summary.total_kunjungan || 0),
        totalTransaksi: Number(summary.total_transaksi || 0),
        lastVisitDate: summary.last_visit_date || null,
        lastVisitAt: summary.last_visit_at || null,
        depositQty: Number(summary.deposit_qty_sisa || 0),
        depositBalance: Number(summary.deposit_nilai_sisa || 0),
      };
    },

    mapPatient(patient, summary = {}, latestTierName = null) {
      const member = patient.member || null;
      const birthDate = patient.tanggal_lahir || null;
      const pointBalance = Number(
        member?.point_sisa ??
          summary.member_point_sisa ??
          summary.member_total_point ??
          0,
      );
      const pointValue = Number(
        summary.member_point_value ?? pointBalance * 2500,
      );

      return {
        id: patient.id || this.pasienId,
        noRm: patient.no_rm || "-",
        name: patient.nama || patient.nama_pasien || "-",
        gender:
          patient.jenis_kelamin_text || this.genderText(patient.jenis_kelamin),
        category: patient.tipe_pasien_text || "-",
        birthPlace: patient.tempat_lahir || "-",
        birthDate,
        age: this.calculateAge(birthDate),
        nik: patient.no_identitas || "-",
        nikInvalid: this.isNikInvalid(patient.no_identitas),
        ihsNumber: patient.ihs_number || patient.no_ihs || "",
        religion: patient.agama?.nama_agama || patient.agama?.label || "-",
        job:
          patient.pekerjaan?.nama_pekerjaan || patient.pekerjaan?.label || "-",
        maritalStatus: patient.status_pernikahan_text || "-",
        phone: patient.no_hp || patient.no_wa || patient.no_telp || "-",
        whatsapp: patient.no_wa || "-",
        telephone: patient.no_telp || "-",
        email: patient.email || "-",
        address: patient.alamat_detail || patient.alamat || "-",
        shippingAddress:
          patient.alamat_pengiriman ||
          patient.alamat_detail ||
          patient.alamat ||
          "-",
        points: pointBalance,
        pointsValue: pointValue,
        skinAnalyzerUrl:
          patient.skin_analyzer_url || patient.skinAnalyzerUrl || "",
        member: {
          isMember: Boolean(member),
          id: member?.id || null,
          noMember: member?.no_member || summary.member_no || "-",
          tierId: member?.member_tier_id || null,
          tierName: member?.member_tier_nama || latestTierName || "-",
          status: member?.status ?? null,
          statusText:
            member?.status_text ||
            summary.member_status ||
            "Belum menjadi member",
          registeredAt: member?.tanggal_daftar || null,
          expiredAt: member?.tanggal_expired || null,
          totalSpending: Number(member?.total_spending || 0),
          totalPoint: Number(member?.total_point || 0),
          pointUsed: Number(member?.point_terpakai || 0),
          pointBalance,
        },
      };
    },

    mapHistoryItem(item) {
      const rawItems = Array.isArray(item.items) ? item.items : [];
      const rawCppt = Array.isArray(item.cppt) ? item.cppt : [];
      const doctor = item.soap?.dokter?.nama || item.dokter?.nama || "-";
      const nurseNames = [
        item.perawat?.nama,
        ...rawCppt.map((cppt) => cppt?.perawat?.nama),
      ].filter(Boolean);
      const uniqueNurseNames = [...new Set(nurseNames)];

      const mappedItems = rawItems.map((detail) => this.mapInvoiceItem(detail));
      const treatments = mappedItems
        .filter((detail) => [2, 4].includes(detail.type))
        .map((detail) => ({
          ...detail,
          staff:
            detail.nurseName ||
            uniqueNurseNames.join(", ") ||
            item.perawat?.nama ||
            "-",
        }));
      const products = mappedItems.filter((detail) => detail.type === 3);
      const consultations = mappedItems.filter((detail) => detail.type === 1);
      const payment = this.mapPayment(item.pembayaran || {});
      const soap = this.mapSoap(item.soap);
      const cppt = rawCppt.map((entry) => this.mapCppt(entry));
      const intake = this.mapIntake(item.intake);
      const notes =
        [item.catatan, payment.notes, intake?.notes]
          .filter((value) => value && value !== "-")
          .join(" • ") || "Tidak ada catatan kunjungan.";

      const mapped = {
        id: item.id || item.registrasi_id || item.kode_registrasi,
        registrationId: Number(item.registrasi_id || item.id || 0),
        registrationCode: item.kode_registrasi || "-",
        date: item.tanggal || item.tanggal_kunjungan || null,
        time: item.waktu || "",
        registeredAt: item.registered_at || "",
        clinic: item.toko?.nama_toko || "-",
        doctor,
        nurseNames: uniqueNurseNames,
        services:
          Array.isArray(item.layanan) && item.layanan.length
            ? item.layanan
            : ["Registrasi"],
        transactionType: payment.transactionType,
        status: {
          text: item.status?.text || item.status?.invoice_text || "Lunas",
          color: this.normalizeStatusColor(item.status?.color),
        },
        treatments,
        products,
        consultations,
        soap,
        cppt,
        intake,
        payment,
        notes,
      };

      mapped.searchText = JSON.stringify(mapped).toLowerCase();
      return mapped;
    },

    mapInvoiceItem(item) {
      const frequency = item.frekuensi || item.frekuensi_penggunaan || "";
      const usageTime = item.waktu_pakai || item.waktu_penggunaan || "";
      const instruction = item.instruksi_pemakaian || "";

      return {
        id: item.id,
        type: Number(item.item_type || 0),
        typeText: item.item_type_text || "Item",
        name: item.nama_item || "-",
        unit: item.satuan || "",
        qty: Number(item.qty || 0),
        price: Number(item.harga || 0),
        discount: Number(item.diskon_amount || 0),
        subtotalDiscount: Number(item.diskon_subtotal_amount || 0),
        subtotal: Number(item.subtotal || 0),
        doctorId: item.dokter_id || null,
        nurseId: item.perawat_id || null,
        doctorName: item.dokter_nama || "",
        nurseName: item.perawat_nama || "",
        usage: [frequency, usageTime, instruction].filter(Boolean).join(" • "),
        expiredAt: item.expired_at || null,
        isDoctorRecommendation: Number(item.is_saran_dokter || 0) === 1,
      };
    },

    mapPayment(payment) {
      return {
        id: payment.id || null,
        invoiceNumber: payment.no_invoice || "-",
        memberNumber: payment.member_no || "-",
        memberTierName: payment.member_tier_nama || "-",
        invoiceAt: payment.tanggal_invoice || "-",
        paidAt: payment.tanggal_lunas || "-",
        transactionType: payment.jenis_transaksi_text || "Umum",
        subtotalProduct: Number(payment.subtotal_produk || 0),
        subtotalTreatment: Number(payment.subtotal_treatment || 0),
        subtotalConsultation: Number(payment.subtotal_konsultasi || 0),
        subtotal: Number(payment.subtotal || 0),
        itemDiscount: Number(payment.total_diskon_item || 0),
        subtotalDiscount: Number(payment.diskon_subtotal_amount || 0),
        promoDiscount: Number(payment.total_promo || 0),
        memberDiscount: Number(payment.diskon_member_amount || 0),
        pointEarned: Number(payment.point_earned || 0),
        pointRedeemed: Number(payment.point_redeemed || 0),
        pointRedeemValue: Number(payment.point_redeem_value || 0),
        grandTotal: Number(payment.grand_total || 0),
        totalPaid: Number(payment.total_bayar || 0),
        change: Number(payment.total_kembalian || 0),
        remaining: Number(payment.sisa_tagihan || 0),
        notes: payment.catatan || "",
      };
    },

    mapSoap(soap) {
      if (!soap) return null;

      return {
        id: soap.id,
        doctor: soap.dokter?.nama || "-",
        subjective: Array.isArray(soap.subjective)
          ? soap.subjective.filter(Boolean)
          : [],
        objective: soap.objective || "-",
        assessment: Array.isArray(soap.assessment)
          ? soap.assessment.filter(Boolean)
          : [],
        otherAssessment: soap.assessment_lainnya || "-",
        plan: soap.plan || "-",
        nextConsultationDate: soap.next_konsultasi_date || null,
        statusText: soap.status_text || "-",
        statusColor: Number(soap.status) === 1 ? "success" : "warning",
        finalizedAt: soap.finalized_at || "-",
      };
    },

    mapCppt(cppt) {
      return {
        id: cppt.id,
        date: cppt.tanggal_pengisian || cppt.tanggal_jam || "-",
        doctor: cppt.dokter?.nama || "-",
        nurse: cppt.perawat?.nama || "-",
        subjective: cppt.subjective || cppt.subjective_note || "-",
        objective: cppt.objective || cppt.objective_note || "-",
        assessment: cppt.assessment || cppt.assessment_note || "-",
        plan: cppt.plan || cppt.plan_note || "-",
        action: cppt.tindakan || cppt.tindakan_evaluasi_note || "-",
        statusText: cppt.status_text || "-",
      };
    },

    mapIntake(intake) {
      if (!intake) return null;

      return {
        id: intake.id,
        consultationType: intake.jenis_konsultasi_text || "-",
        requestDoctor: intake.request_dokter_nama || "-",
        allergy: intake.alergi || "-",
        mainComplaint: intake.keluhan_utama || "-",
        initialComplaint: intake.keluhan_awal || "-",
        previousProduct: intake.produk_obat_sebelumnya || "-",
        pregnant: intake.sedang_hamil || "-",
        breastfeeding: intake.sedang_menyusui || "-",
        notes:
          [intake.catatan_awal, intake.catatan_cs]
            .filter(Boolean)
            .join(" • ") || "-",
        statusText: intake.status_text || "-",
      };
    },

    resolveTierGemKey(tierName) {
      const normalized = String(tierName || "")
        .trim()
        .toLowerCase();

      if (normalized.includes("diamond")) return "diamond";

      // Support typo DB: Sapphire / Shappire / Shapphire
      if (
        normalized.includes("sapphire") ||
        normalized.includes("shappire") ||
        normalized.includes("shapphire")
      ) {
        return "sapphire";
      }

      if (normalized.includes("ruby") || normalized.includes("rose")) {
        return "ruby";
      }

      return "default";
    },

    resetPage() {
      this.page = 1;
    },

    normalizeStatusColor(value) {
      const color = String(value || "").toLowerCase();
      if (
        ["success", "primary", "warning", "error", "info", "grey"].includes(
          color,
        )
      ) {
        return color;
      }
      return "success";
    },

    openMemberCard(side) {
      if (!this.patient.member.isMember) {
        this.showSnackbar("Pasien belum memiliki membership aktif.", "warning");
        return;
      }

      this.memberCardSide = side;
      this.memberCardDialog = true;
    },

    printMemberCard() {
      const isFront = this.memberCardSide === "front";
      const content = isFront
        ? `
          <div class="card front">
            <div class="brand">MS GLOW AESTHETIC CLINIC</div>
            <div class="title">MEMBER CARD</div>
            <div class="name">${this.escapeHtml(this.patient.name)}</div>
            <div class="member">${this.escapeHtml(this.patient.member.noMember)}</div>
            <div class="footer"><span>Tier: ${this.escapeHtml(this.currentTierName)}</span><span>RM: ${this.escapeHtml(this.patient.noRm)}</span></div>
          </div>`
        : `
          <div class="card back">
            <div class="title">INFORMASI MEMBER</div>
            <p>Kartu ini milik <strong>${this.escapeHtml(this.patient.name)}</strong>.</p>
            <p>Nomor member: ${this.escapeHtml(this.patient.member.noMember)}</p>
            <p>Berlaku sampai: ${this.escapeHtml(this.formatDate(this.patient.member.expiredAt))}</p>
            <div class="note">Tunjukkan kartu ini pada saat transaksi di MS Glow Aesthetic Clinic.</div>
          </div>`;

      this.printDocument(
        "Kartu Member",
        content,
        `
        @page { size: 86mm 54mm; margin: 0; }
        body { margin: 0; font-family: Arial, sans-serif; }
        .card { width: 86mm; height: 54mm; box-sizing: border-box; padding: 7mm; border-radius: 4mm; }
        .front { color: white; background: #1867c0; }
        .back { color: #111827; border: 1px solid #d1d5db; }
        .brand { font-size: 8pt; letter-spacing: .08em; }
        .title { margin-top: 2mm; font-size: 15pt; font-weight: 700; }
        .name { margin-top: 10mm; font-size: 13pt; font-weight: 700; }
        .member { margin-top: 1mm; font-size: 9pt; }
        .footer { display: flex; justify-content: space-between; margin-top: 7mm; font-size: 8pt; font-weight: 700; }
        .back p { margin: 3mm 0; font-size: 9pt; }
        .note { margin-top: 7mm; font-size: 8pt; color: #4b5563; }
      `,
      );
    },

    printRmLabel() {
      const content = `
        <div class="label">
          <div class="clinic">MS GLOW AESTHETIC CLINIC</div>
          <div class="rm">${this.escapeHtml(this.patient.noRm)}</div>
          <div class="name">${this.escapeHtml(this.patient.name)}</div>
          <div class="meta">${this.escapeHtml(this.patient.gender)} • ${this.escapeHtml(this.formatDate(this.patient.birthDate))}</div>
          <div class="meta">${this.escapeHtml(this.patient.phone)}</div>
        </div>`;

      this.printDocument(
        "Label Rekam Medis",
        content,
        `
        @page { size: 70mm 35mm; margin: 0; }
        body { margin: 0; font-family: Arial, sans-serif; }
        .label { width: 70mm; height: 35mm; box-sizing: border-box; padding: 4mm; border: 1px solid #111827; }
        .clinic { font-size: 7pt; font-weight: 700; }
        .rm { margin-top: 2mm; font-size: 14pt; font-weight: 800; }
        .name { margin-top: 1mm; font-size: 10pt; font-weight: 700; }
        .meta { margin-top: 1mm; font-size: 8pt; }
      `,
      );
    },

    printDocument(title, content, extraStyle = "") {
      const popup = window.open("", "_blank", "width=900,height=650");
      if (!popup) {
        this.showSnackbar("Popup cetak diblokir browser.", "error");
        return;
      }

      popup.document.open();
      popup.document.write(
        `<!doctype html><html><head><title>${this.escapeHtml(title)}</title><style>${extraStyle}</style></head><body>${content}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}<\/script></body></html>`,
      );
      popup.document.close();
    },

    async openSkinAnalyzer() {
      this.skinAnalyzerDialog = true;
      this.skinAnalyzerError = "";
      this.skinAnalyzerLink = "";

      await this.$nextTick();
      this.$refs.skinAnalyzerForm?.resetValidation();
      await this.loadSkinAnalyzer();
    },

    closeSkinAnalyzer() {
      if (this.skinAnalyzerSaving) return;

      this.skinAnalyzerDialog = false;
      this.skinAnalyzerError = "";
      this.skinAnalyzerLink = "";
      this.$refs.skinAnalyzerForm?.resetValidation();
    },

    async loadSkinAnalyzer() {
      if (!this.pasienId) {
        this.skinAnalyzerItems = [];
        return;
      }

      this.skinAnalyzerLoading = true;
      this.skinAnalyzerError = "";

      try {
        const response = await api.get(
          `/administrasi/pasien/${this.pasienId}/skin-analyzer`,
        );

        if (!response.data?.status) {
          throw new Error(
            response.data?.message ||
              "Data Skin Analyzer pasien gagal diambil.",
          );
        }

        this.skinAnalyzerItems = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
      } catch (error) {
        this.skinAnalyzerItems = [];
        this.skinAnalyzerError = this.getErrorMessage(
          error,
          "Data Skin Analyzer pasien gagal diambil.",
        );
      } finally {
        this.skinAnalyzerLoading = false;
      }
    },

    async saveSkinAnalyzer() {
      if (this.skinAnalyzerSaving) return;

      const validation = await this.$refs.skinAnalyzerForm?.validate();
      if (!validation?.valid) {
        this.showSnackbar("Periksa kembali link hasil Skin Analyzer.", "error");
        return;
      }

      this.skinAnalyzerSaving = true;
      this.skinAnalyzerError = "";

      try {
        const response = await api.post(
          `/administrasi/pasien/${this.pasienId}/skin-analyzer`,
          { url: String(this.skinAnalyzerLink || "").trim() },
        );

        if (!response.data?.status) {
          throw new Error(
            response.data?.message ||
              "Link hasil Skin Analyzer gagal disimpan.",
          );
        }

        this.skinAnalyzerLink = "";
        this.$refs.skinAnalyzerForm?.resetValidation();
        await this.loadSkinAnalyzer();

        this.showSnackbar(
          response.data?.message ||
            "Link hasil Skin Analyzer berhasil disimpan.",
          "success",
        );
      } catch (error) {
        const message = this.getErrorMessage(
          error,
          "Link hasil Skin Analyzer gagal disimpan.",
        );
        this.skinAnalyzerError = message;
        this.showSnackbar(message, "error");
      } finally {
        this.skinAnalyzerSaving = false;
      }
    },

    openSkinAnalyzerResult(item) {
      const url = String(item?.url || "").trim();

      if (!/^https?:\/\/[^\s]+$/i.test(url)) {
        this.showSnackbar("Link hasil Skin Analyzer tidak valid.", "error");
        return;
      }

      const popup = window.open("", "_blank");
      if (!popup) {
        this.showSnackbar("Popup diblokir browser.", "error");
        return;
      }

      popup.opener = null;
      popup.location.href = url;
    },

    async openBeforeAfterDialog() {
      this.beforeAfterDialog = true;
      this.photoError = "";
      this.beforeAfterPhotos = { before: [], after: [] };

      if (!this.photoVisitOptions.length) {
        this.photoVisitId = null;
        return;
      }

      this.photoVisitId = this.photoVisitOptions[0].value;
      await this.loadBeforeAfterPhotos(this.photoVisitId);
    },

    async loadBeforeAfterPhotos(registrationId) {
      this.cleanupPhotoObjectUrls();
      this.beforeAfterPhotos = { before: [], after: [] };

      if (!registrationId) {
        return;
      }

      this.photoLoading = true;
      this.photoError = "";

      try {
        const response =
          await antrianPerawatService.getBeforeAfter(registrationId);
        const payload = response?.data || response || {};
        const beforeMetadata = Array.isArray(payload.before)
          ? [...payload.before].sort(
              (a, b) => Number(a?.urutan || 0) - Number(b?.urutan || 0),
            )
          : [];
        const afterMetadata = Array.isArray(payload.after)
          ? [...payload.after].sort(
              (a, b) => Number(a?.urutan || 0) - Number(b?.urutan || 0),
            )
          : [];

        const [before, after] = await Promise.all([
          Promise.all(
            beforeMetadata.map((photo) =>
              this.loadBeforeAfterPhoto(registrationId, photo),
            ),
          ),
          Promise.all(
            afterMetadata.map((photo) =>
              this.loadBeforeAfterPhoto(registrationId, photo),
            ),
          ),
        ]);

        this.beforeAfterPhotos = {
          before: before.filter(Boolean),
          after: after.filter(Boolean),
        };

        const metadataCount = beforeMetadata.length + afterMetadata.length;
        const loadedCount =
          this.beforeAfterPhotos.before.length +
          this.beforeAfterPhotos.after.length;

        if (metadataCount > 0 && loadedCount === 0) {
          this.photoError =
            "Metadata foto tersedia, tetapi seluruh file foto gagal dimuat.";
        } else if (loadedCount < metadataCount) {
          this.photoError =
            "Sebagian file foto tidak dapat dimuat. Foto yang tersedia tetap ditampilkan.";
        }
      } catch (error) {
        this.photoError =
          error?.response?.data?.message ||
          error?.message ||
          "Dokumentasi foto tidak dapat diambil dari kunjungan ini.";
      } finally {
        this.photoLoading = false;
      }
    },

    async loadBeforeAfterPhoto(registrationId, photo) {
      if (!photo?.id) return null;

      try {
        const blob = await antrianPerawatService.getBeforeAfterPhoto(
          registrationId,
          photo.id,
        );

        if (!(blob instanceof Blob)) return null;

        const url = URL.createObjectURL(blob);
        this.photoObjectUrls.push(url);

        return {
          id: photo.id,
          order: Number(photo.urutan || 0),
          url,
        };
      } catch (error) {
        console.error(`Gagal mengambil foto before/after ${photo.id}:`, error);
        return null;
      }
    },

    cleanupPhotoObjectUrls() {
      this.photoObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      this.photoObjectUrls = [];
    },

    showSnackbar(message, color = "info") {
      this.snackbar = { show: true, message, color };
    },

    formatDate(value) {
      if (!value) return "-";
      const date = this.parseDate(value);
      if (!date) return String(value);

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    },

    formatDateTime(value) {
      if (!value) return "-";
      const date = this.parseDate(value);
      if (!date) return String(value);

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    formatDay(value) {
      const date = this.parseDate(value);
      if (!date) return "--";
      return new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(date);
    },

    formatMonth(value) {
      const date = this.parseDate(value);
      if (!date) return "---";
      return new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date);
    },

    parseDate(value) {
      if (!value) return null;
      if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

      const normalized = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
        ? `${value}T00:00:00`
        : String(value).replace(" ", "T");
      const date = new Date(normalized);
      return Number.isNaN(date.getTime()) ? null : date;
    },

    toLocalDateKey(value) {
      const date = this.parseDate(value);
      if (!date) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    formatQty(value) {
      const number = Number(value || 0);
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 4,
      }).format(number);
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    genderText(value) {
      if (value === "P") return "Perempuan";
      if (value === "L") return "Laki-laki";
      return value || "-";
    },

    calculateAge(value) {
      const birthDate = this.parseDate(value);
      if (!birthDate) return "-";

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age -= 1;
      }
      return age;
    },

    isNikInvalid(value) {
      const digits = String(value || "").replace(/\D/g, "");
      return digits.length !== 16;
    },

    escapeHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },
  },
};
</script>
