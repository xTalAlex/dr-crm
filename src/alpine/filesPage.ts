import type Alpine from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("filesPage", () => ({
    groups: [] as any[],
    total: 0,
    page: 1,
    perPage: 20,
    search: "",
    loading: true,

    // Upload modal
    uploadModal: false,
    uploadLabel: "",
    uploading: false,
    uploadError: "",
    customerSearch: "",
    customerResults: [] as any[],
    selectedCustomer: null as any,
    searchingCustomers: false,

    get totalPages() {
      return Math.max(1, Math.ceil(this.total / this.perPage));
    },

    async init() {
      await this.fetchData();
    },

    async fetchData() {
      this.loading = true;
      const params = new URLSearchParams();
      params.set("page", String(this.page));
      if (this.search) params.set("search", this.search);
      const res = await fetch(`/admin/api/files?${params}`);
      if (res.ok) {
        const data = await res.json();
        this.groups = data.groups;
        this.total = data.total;
        this.page = data.page;
        this.perPage = data.perPage;
      }
      this.loading = false;
    },

    openUpload() {
      this.uploadLabel = "";
      this.uploadError = "";
      this.customerSearch = "";
      this.customerResults = [];
      this.selectedCustomer = null;
      this.uploadModal = true;
    },

    async searchCustomers() {
      const q = this.customerSearch.trim();
      if (q.length < 2) {
        this.customerResults = [];
        return;
      }
      this.searchingCustomers = true;
      const res = await fetch(`/admin/api/customers?q=${encodeURIComponent(q)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        this.customerResults = data.customers;
      }
      this.searchingCustomers = false;
    },

    selectCustomer(c: any) {
      this.selectedCustomer = c;
      this.customerSearch = "";
      this.customerResults = [];
    },

    clearCustomer() {
      this.selectedCustomer = null;
    },

    customerDisplayName(c: any) {
      return ((c.surname || "") + " " + (c.name || "")).trim() || "Cliente";
    },

    async upload() {
      this.uploadError = "";
      const cust = this.selectedCustomer;
      if (!cust) {
        this.uploadError = "Seleziona un cliente";
        return;
      }
      const fileInput = this.$refs.filesPageInput as HTMLInputElement;
      const files = fileInput?.files;
      if (!files || files.length === 0) {
        this.uploadError = "Seleziona almeno un file";
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      const oversized = Array.from(files).filter((f) => f.size > maxSize);
      if (oversized.length > 0) {
        this.uploadError = `File troppo grandi (max 5 MB): ${oversized.map((f) => f.name).join(", ")}`;
        return;
      }

      const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 20 * 1024 * 1024) {
        this.uploadError = `Upload troppo grande: ${(totalSize / 1024 / 1024).toFixed(1)} MB (max 20 MB)`;
        return;
      }

      this.uploading = true;
      const fd = new FormData();
      fd.append("label", this.uploadLabel);
      for (const f of files) fd.append("files", f);

      const res = await fetch(`/admin/api/customers/${cust.id}/files/upload`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        this.uploadError = err.error || "Errore nel caricamento";
        this.uploading = false;
        return;
      }

      this.uploading = false;
      this.uploadModal = false;
      await this.fetchData();
    },

    customerLabel(g: any) {
      return ((g.customer?.surname || "") + " " + (g.customer?.name || "")).trim() || "—";
    },

    totalSize(g: any) {
      const bytes = g.files.reduce((sum: number, f: any) => sum + (f.size || 0), 0);
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    },
  }));
};
