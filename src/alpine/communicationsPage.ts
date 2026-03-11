import type Alpine from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("communicationsPage", () => ({
    // Tab
    activeTab: "sms" as "sms" | "email",

    // Customers for SMS
    customers: [] as any[],
    totalCustomers: 0,
    selectedIds: [] as string[],
    searchCustomers: "",
    loadingCustomers: true,
    custPage: 1,
    custPerPage: 20,

    // SMS
    smsText: "",
    smsSending: false,
    smsResult: null as { sent: number; total: number } | null,
    smsError: "",

    get custTotalPages() {
      return Math.max(1, Math.ceil(this.totalCustomers / this.custPerPage));
    },

    get pageAllSelected() {
      return this.customers.length > 0 &&
        this.customers.every((c: any) => this.selectedIds.includes(c.id));
    },

    get selectedCount() {
      return this.selectedIds.length;
    },

    async init() {
      await this.fetchCustomers();
    },

    async fetchCustomers() {
      this.loadingCustomers = true;
      const params = new URLSearchParams();
      params.set("page", String(this.custPage));
      params.set("limit", String(this.custPerPage));
      if (this.searchCustomers.trim()) {
        params.set("q", this.searchCustomers.trim());
      }
      const res = await fetch(`/admin/api/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        this.customers = data.customers;
        this.totalCustomers = data.total;
      }
      this.loadingCustomers = false;
    },

    async searchChanged() {
      this.custPage = 1;
      await this.fetchCustomers();
    },

    async goPage(p: number) {
      this.custPage = p;
      await this.fetchCustomers();
    },

    togglePageAll() {
      if (this.pageAllSelected) {
        const ids = this.customers.map((c: any) => c.id);
        this.selectedIds = this.selectedIds.filter((id: string) => !ids.includes(id));
      } else {
        const current = new Set(this.selectedIds);
        for (const c of this.customers) {
          current.add(c.id);
        }
        this.selectedIds = [...current];
      }
    },

    async selectAll() {
      const params = new URLSearchParams();
      params.set("limit", "5000");
      if (this.searchCustomers.trim()) {
        params.set("q", this.searchCustomers.trim());
      }
      const res = await fetch(`/admin/api/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        const allIds = data.customers.map((c: any) => c.id);
        const current = new Set(this.selectedIds);
        for (const id of allIds) current.add(id);
        this.selectedIds = [...current];
      }
    },

    deselectAll() {
      this.selectedIds = [];
    },

    toggleOne(id: string) {
      const idx = this.selectedIds.indexOf(id);
      if (idx >= 0) {
        this.selectedIds.splice(idx, 1);
      } else {
        this.selectedIds.push(id);
      }
    },

    isSelected(id: string) {
      return this.selectedIds.includes(id);
    },

    customerLabel(c: any) {
      return ((c.surname || "") + " " + (c.name || "")).trim() || "\u2014";
    },

    async sendBulkSms() {
      this.smsError = "";
      this.smsResult = null;

      if (!this.smsText.trim()) {
        this.smsError = "Scrivi un messaggio";
        return;
      }
      if (this.selectedIds.length === 0) {
        this.smsError = "Seleziona almeno un destinatario";
        return;
      }

      this.smsSending = true;
      const params = new URLSearchParams();
      params.set("limit", "5000");
      const allRes = await fetch(`/admin/api/customers?${params}`);
      if (!allRes.ok) {
        this.smsError = "Errore nel recupero dei clienti";
        this.smsSending = false;
        return;
      }
      const allData = await allRes.json();
      const recipients = allData.customers
        .filter((c: any) => this.selectedIds.includes(c.id))
        .map((c: any) => ({ name: this.customerLabel(c), phone: c.phone }));

      const res = await fetch("/admin/api/communications/sms-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, text: this.smsText }),
      });

      if (res.ok) {
        this.smsResult = await res.json();
        this.smsText = "";
        this.selectedIds = [];
      } else {
        const err = await res.json();
        this.smsError = err.error || "Errore nell'invio";
      }
      this.smsSending = false;
    },
  }));
};
