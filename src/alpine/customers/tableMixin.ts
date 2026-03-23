import { waLink } from "@/lib/wa-link";

export function tableMixin() {
  return {
    customers: [] as any[],
    total: 0,
    search: "",
    activeLetter: "",
    letterCounts: {} as Record<string, number>,
    loading: false,

    waLink,

    async init() {
      this.loading = true;
      const res = await fetch("/admin/api/customers?limit=0");
      const data = await res.json();
      this.letterCounts = data.letterCounts ?? {};
      this.activeLetter = Object.keys(this.letterCounts).sort()[0] ?? "";
      this.loading = false;
      await this.fetchCustomers();
    },

    async fetchCustomers() {
      this.loading = true;
      const params = new URLSearchParams();
      if (this.search) params.set("q", this.search);
      if (this.activeLetter) params.set("letter", this.activeLetter);

      const res = await fetch(`/admin/api/customers?${params}`);
      const data = await res.json();
      this.letterCounts = data.letterCounts ?? {};
      this.customers = data.customers;
      this.total = data.total;
      this.loading = false;
    },
  };
}
