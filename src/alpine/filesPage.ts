import type { Alpine } from "alpinejs";
import { filesPageUploadMixin } from "./files/filesPageUploadMixin";

export default (Alpine: Alpine) => {
  Alpine.data("filesPage", () => ({
    groups: [] as any[],
    total: 0,
    page: 1,
    perPage: 20,
    search: "",
    loading: true,

    ...filesPageUploadMixin(),

    get totalPages(): number {
      return Math.max(1, Math.ceil((this as any).total / (this as any).perPage));
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
