<script>
export default {
  name: "EditProdukGlobal",

  data() {
    return {
      isValid: false,
      loadingPage: false,
      dialogPreview: false,
      payloadPreview: null,

      dialogTokoConfig: false,
      editingConfigIndex: null,
      configDraft: {},

      tokoOptions: [
        { id: 1, nama: "Malang" },
        { id: 2, nama: "Surabaya" },
        { id: 3, nama: "Bandung" },
        { id: 4, nama: "Sidoarjo" },
        { id: 5, nama: "Bekasi" },
        { id: 6, nama: "Medan" },
        { id: 7, nama: "Depok" },
        { id: 8, nama: "Yogyakarta" },
        { id: 9, nama: "Jakarta" },
      ],

      supplierOptions: [
        { id: 1, nama: "PT Maju Jaya" },
        { id: 2, nama: "CV Sumber Rejeki" },
        { id: 3, nama: "PT Berkah Abadi" },
      ],

      tempatOptions: [
        { id: 1, nama: "Gudang Klinik" },
        { id: 2, nama: "Apotek" },
        { id: 3, nama: "Display FO" },
      ],

      satuanOptions: [
        { id: 1, nama: "Pcs" },
        { id: 2, nama: "Botol" },
        { id: 3, nama: "Tube" },
        { id: 4, nama: "Box" },
      ],

      kategoriProdukOptions: [
        { id: 1, nama: "Skincare" },
        { id: 2, nama: "Obat" },
        { id: 3, nama: "Bahan Treatment" },
      ],

      golonganProdukOptions: [
        { id: 1, nama: "Basic" },
        { id: 2, nama: "Premium" },
        { id: 3, nama: "Medical" },
      ],

      tokoConfigHeaders: [
        { title: "NO", key: "no", sortable: false },
        { title: "CABANG", key: "toko_id" },
        { title: "SUPPLIER", key: "supplier_id" },
        { title: "HARGA JUAL", key: "harga_jual" },
        { title: "HARGA BELI", key: "harga_beli" },
        { title: "STOK AWAL", key: "stok_awal" },
        { title: "STOK MINIMUM", key: "stok_minimum" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      dummyProduk: [
        {
          id: 1,
          legacy_id: 101,
          kode: "PRD001",
          kode_accurate: "PRD001",
          nama: "ACNE NIGHT CREAM",
          tempat_id: 1,
          satuan_id: 3,
          kategori_produk_id: 1,
          golongan_produk_id: 2,
          is_obat_resep: 0,
          is_obat_bebas: 1,
          sort_order: 1,
          toko_configs: [
            {
              toko_id: 1,
              supplier_id: 1,
              harga_jual: 150000,
              harga_beli: 80000,
              stok_awal: 20,
              stok_minimum: 5,
              fee_dokter: 10000,
              fee_beautician: 5000,
              sort_order: 1,
            },
            {
              toko_id: 2,
              supplier_id: 2,
              harga_jual: 165000,
              harga_beli: 85000,
              stok_awal: 15,
              stok_minimum: 5,
              fee_dokter: 10000,
              fee_beautician: 5000,
              sort_order: 2,
            },
          ],
        },
      ],

      form: {
        legacy_id: null,
        kode: "",
        kode_accurate: "",
        nama: "",
        tempat_id: null,
        satuan_id: null,
        kategori_produk_id: null,
        golongan_produk_id: null,
        is_obat_resep: false,
        is_obat_bebas: false,
        sort_order: 0,
        toko_configs: [],
      },

      rules: {
        required: (v) =>
          (v !== null && v !== undefined && v !== "") || "Wajib diisi",
      },
    };
  },

  computed: {
    formattedPayload() {
      return JSON.stringify(this.payloadPreview, null, 2);
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    initPage() {
      this.loadingPage = true;

      try {
        const id = Number(this.$route.params.id);
        const detail = this.dummyProduk.find((item) => Number(item.id) === id);

        if (!detail) {
          this.$router.push("/master/product-global");
          return;
        }

        this.form = {
          legacy_id: detail.legacy_id,
          kode: detail.kode,
          kode_accurate: detail.kode_accurate || "",
          nama: detail.nama,
          tempat_id: detail.tempat_id,
          satuan_id: detail.satuan_id,
          kategori_produk_id: detail.kategori_produk_id,
          golongan_produk_id: detail.golongan_produk_id,
          is_obat_resep: Number(detail.is_obat_resep) === 1,
          is_obat_bebas: Number(detail.is_obat_bebas) === 1,
          sort_order: detail.sort_order,
          toko_configs: detail.toko_configs.map((item) => ({ ...item })),
        };
      } finally {
        this.loadingPage = false;
      }
    },

    createEmptyTokoConfig() {
      return {
        toko_id: null,
        supplier_id: null,
        harga_jual: 0,
        harga_beli: 0,
        stok_awal: 0,
        stok_minimum: 0,
        fee_dokter: 0,
        fee_beautician: 0,
        sort_order: 0,
      };
    },

    getOptionName(options, id) {
      const item = options.find((row) => Number(row.id) === Number(id));
      return item ? item.nama : "-";
    },

    getTokoName(tokoId) {
      return this.getOptionName(this.tokoOptions, tokoId);
    },

    getSupplierName(supplierId) {
      return this.getOptionName(this.supplierOptions, supplierId);
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    addTokoConfig() {
      this.editingConfigIndex = null;
      this.configDraft = this.createEmptyTokoConfig();
      this.dialogTokoConfig = true;
    },

    openTokoConfigDialog(index) {
      this.editingConfigIndex = index;
      this.configDraft = JSON.parse(
        JSON.stringify(this.form.toko_configs[index]),
      );
      this.dialogTokoConfig = true;
    },

    closeTokoConfigDialog() {
      this.dialogTokoConfig = false;
      this.editingConfigIndex = null;
      this.configDraft = {};
    },

    saveTokoConfigDialog() {
      if (!this.configDraft.toko_id) {
        alert("Cabang wajib dipilih");
        return;
      }

      if (Number(this.configDraft.harga_jual || 0) < 0) {
        alert("Harga jual tidak boleh kurang dari 0");
        return;
      }

      const isDuplicate = this.form.toko_configs.some((item, index) => {
        return (
          index !== this.editingConfigIndex &&
          Number(item.toko_id) === Number(this.configDraft.toko_id)
        );
      });

      if (isDuplicate) {
        alert("Cabang tidak boleh duplikat");
        return;
      }

      const savedData = JSON.parse(JSON.stringify(this.configDraft));

      if (this.editingConfigIndex === null) {
        this.form.toko_configs.push(savedData);
      } else {
        this.form.toko_configs.splice(this.editingConfigIndex, 1, savedData);
      }

      this.closeTokoConfigDialog();
    },

    removeTokoConfig(index) {
      this.form.toko_configs.splice(index, 1);
    },

    validateTokoConfig() {
      if (!this.form.toko_configs.length) {
        return "Minimal harus ada 1 konfigurasi cabang";
      }

      const tokoIds = this.form.toko_configs
        .map((item) => item.toko_id)
        .filter((id) => id !== null && id !== "");

      if (tokoIds.length !== this.form.toko_configs.length) {
        return "Semua konfigurasi cabang harus memilih cabang";
      }

      if (new Set(tokoIds).size !== tokoIds.length) {
        return "Cabang tidak boleh duplikat";
      }

      return null;
    },

    buildPayload() {
      return {
        id: Number(this.$route.params.id),
        legacy_id: this.form.legacy_id,
        kode: this.form.kode,
        kode_accurate: this.form.kode_accurate || null,
        nama: this.form.nama,
        tempat_id: this.form.tempat_id,
        satuan_id: this.form.satuan_id,
        kategori_produk_id: this.form.kategori_produk_id,
        golongan_produk_id: this.form.golongan_produk_id,
        is_obat_resep: this.form.is_obat_resep ? 1 : 0,
        is_obat_bebas: this.form.is_obat_bebas ? 1 : 0,
        sort_order: Number(this.form.sort_order || 0),
        toko_configs: this.form.toko_configs.map((item) => ({
          toko_id: item.toko_id,
          supplier_id: item.supplier_id,
          harga_jual: Number(item.harga_jual || 0),
          harga_beli: Number(item.harga_beli || 0),
          stok_awal: Number(item.stok_awal || 0),
          stok_minimum: Number(item.stok_minimum || 0),
          fee_dokter: Number(item.fee_dokter || 0),
          fee_beautician: Number(item.fee_beautician || 0),
          is_delete: 0,
          sort_order: Number(item.sort_order || 0),
        })),
      };
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();
      if (!result.valid) return;

      const configError = this.validateTokoConfig();
      if (configError) {
        alert(configError);
        return;
      }

      this.payloadPreview = this.buildPayload();
      this.dialogPreview = true;

      console.log("Payload edit produk global:", this.payloadPreview);
    },
  },
};
</script>
