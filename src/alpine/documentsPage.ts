import type Alpine from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("documentsPage", () => ({
    groups: [] as any[],
    total: 0,
    page: 1,
    perPage: 20,
    search: "",
    loading: true,

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
      const res = await fetch(`/admin/api/documents?${params}`);
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

    magicLinkUrl(token: string) {
      return `${window.location.origin}/files/${token}`;
    },

    async copyLink(token: string) {
      await navigator.clipboard.writeText(this.magicLinkUrl(token));
    },
  }));
};
