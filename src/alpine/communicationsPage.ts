import type Alpine from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("communicationsPage", () => ({
    // Tab
    activeTab: "sms" as "sms" | "email" | "history",

    // Customers for SMS
    customers: [] as any[],
    totalCustomers: 0,
    selectedIds: [] as string[],
    searchCustomers: "",
    loadingCustomers: true,
    activeLetter: "",
    letterCounts: {} as Record<string, number>,

    // Campaigns
    campaigns: [] as any[],
    campaignMode: "none" as "none" | "existing" | "new",
    selectedCampaignId: "" as string,
    newCampaignName: "",
    creatingCampaign: false,
    sentIds: [] as string[],

    // SMS
    smsText: "",
    editCampaignName: "",
    originalCampaignMessage: "",
    originalCampaignName: "",
    updatingCampaign: false,
    smsSending: false,
    smsResult: null as { sent: number; total: number } | null,
    smsError: "",

    // History
    historyEntries: [] as any[],
    loadingHistory: false,
    expandedEntryId: "" as string,

    get pageAllSelected() {
      return this.customers.length > 0 &&
        this.customers.every((c: any) => this.selectedIds.includes(c.id));
    },

    get selectedCount() {
      return this.selectedIds.length;
    },

    get sentCount() {
      return this.sentIds.length;
    },

    get nameDirty() {
      return this.campaignMode === 'existing' && this.editCampaignName !== this.originalCampaignName;
    },

    get messageDirty() {
      return this.campaignMode === 'existing' && this.smsText !== this.originalCampaignMessage;
    },

    async init() {
      await Promise.all([this.fetchCustomers(), this.fetchCampaigns()]);
    },

    // --- Campaigns ---

    async fetchCampaigns() {
      const res = await fetch("/admin/api/communications/campaigns?channel=sms");
      if (res.ok) {
        const data = await res.json();
        this.campaigns = data.campaigns;
      }
    },

    async createCampaign() {
      if (!this.newCampaignName.trim() || !this.smsText.trim()) return;
      this.creatingCampaign = true;
      const res = await fetch("/admin/api/communications/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: this.newCampaignName.trim(),
          channel: "sms",
          message: this.smsText.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        this.campaigns.unshift({ ...data.campaign, _count: { logs: 0 } });
        // Auto-select the newly created campaign
        this.selectedCampaignId = data.campaign.id;
        this.campaignMode = "existing";
        this.newCampaignName = "";
        await this.loadSentIds();
      }
      this.creatingCampaign = false;
    },

    onCampaignModeChange(value: string) {
      if (value === "__new__") {
        this.campaignMode = "new";
        this.selectedCampaignId = "";
        this.smsText = "";
        this.sentIds = [];
      } else if (value === "") {
        this.campaignMode = "none";
        this.selectedCampaignId = "";
        this.smsText = "";
        this.sentIds = [];
      } else {
        this.campaignMode = "existing";
        this.selectedCampaignId = value;
        const campaign = this.campaigns.find((c: any) => c.id === value);
        if (campaign) {
          this.smsText = campaign.message;
          this.originalCampaignMessage = campaign.message;
          this.editCampaignName = campaign.name;
          this.originalCampaignName = campaign.name;
        }
        this.loadSentIds();
      }
    },

    async loadSentIds() {
      if (!this.selectedCampaignId) {
        this.sentIds = [];
        return;
      }
      const res = await fetch(`/admin/api/communications/campaigns/${this.selectedCampaignId}/sent-ids`);
      if (res.ok) {
        const data = await res.json();
        this.sentIds = data.sentIds;
      }
    },

    isSent(id: string) {
      return this.sentIds.includes(id);
    },

    excludeAlreadySent() {
      this.selectedIds = this.selectedIds.filter((id: string) => !this.sentIds.includes(id));
    },

    async saveCampaignName() {
      if (!this.selectedCampaignId || !this.editCampaignName.trim()) return;
      this.updatingCampaign = true;
      const res = await fetch(`/admin/api/communications/campaigns/${this.selectedCampaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: this.editCampaignName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const idx = this.campaigns.findIndex((c: any) => c.id === this.selectedCampaignId);
        if (idx >= 0) this.campaigns[idx].name = data.campaign.name;
        this.originalCampaignName = data.campaign.name;
        this.editCampaignName = data.campaign.name;
      } else {
        const err = await res.json();
        this.smsError = err.error || "Errore nell'aggiornamento";
      }
      this.updatingCampaign = false;
    },

    async saveCampaignMessage() {
      if (!this.selectedCampaignId || !this.smsText.trim()) return;
      this.updatingCampaign = true;
      const res = await fetch(`/admin/api/communications/campaigns/${this.selectedCampaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: this.smsText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const idx = this.campaigns.findIndex((c: any) => c.id === this.selectedCampaignId);
        if (idx >= 0) this.campaigns[idx].message = data.campaign.message;
        this.originalCampaignMessage = data.campaign.message;
        this.smsText = data.campaign.message;
      } else {
        const err = await res.json();
        this.smsError = err.error || "Errore nell'aggiornamento";
      }
      this.updatingCampaign = false;
    },

    // --- Customers ---

    async fetchCustomers() {
      this.loadingCustomers = true;
      const params = new URLSearchParams();
      params.set("limit", "5000");
      if (this.activeLetter) params.set("letter", this.activeLetter);
      if (this.searchCustomers.trim()) {
        params.set("q", this.searchCustomers.trim());
      }
      const res = await fetch(`/admin/api/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        this.customers = data.customers;
        this.totalCustomers = data.total;
        this.letterCounts = data.letterCounts ?? {};
      }
      this.loadingCustomers = false;
    },

    async searchChanged() {
      this.activeLetter = "";
      await this.fetchCustomers();
    },

    clearSearch() {
      this.searchCustomers = "";
      this.fetchCustomers();
    },

    async goLetter(l: string) {
      this.activeLetter = l;
      this.searchCustomers = "";
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
      if (this.activeLetter) params.set("letter", this.activeLetter);
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

    // --- Mark as sent ---

    async markAsSent() {
      if (!this.selectedCampaignId || this.selectedIds.length === 0) return;
      this.smsError = "";
      this.smsResult = null;

      const res = await fetch(`/admin/api/communications/campaigns/${this.selectedCampaignId}/mark-sent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerIds: this.selectedIds }),
      });

      if (res.ok) {
        const data = await res.json();
        this.smsResult = { sent: data.marked, total: this.selectedIds.length };
        this.selectedIds = [];
        await Promise.all([this.loadSentIds(), this.fetchCampaigns()]);
      } else {
        const err = await res.json();
        this.smsError = err.error || "Errore";
      }
    },

    // --- Send ---

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
        .map((c: any) => ({ id: c.id, name: this.customerLabel(c), phone: c.phone }));

      const payload: any = { recipients, text: this.smsText };
      if (this.selectedCampaignId) {
        payload.campaignId = this.selectedCampaignId;
      }

      const res = await fetch("/admin/api/communications/sms-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        this.smsResult = await res.json();
        this.selectedIds = [];
        if (this.selectedCampaignId) {
          await Promise.all([this.loadSentIds(), this.fetchCampaigns()]);
        }
      } else {
        const err = await res.json();
        this.smsError = err.error || "Errore nell'invio";
      }
      this.smsSending = false;
    },

    // --- History ---

    async fetchHistory() {
      this.loadingHistory = true;
      const res = await fetch("/admin/api/communications/history");
      if (res.ok) {
        const data = await res.json();
        this.historyEntries = data.entries;
      }
      this.loadingHistory = false;
    },

    toggleEntryDetail(id: string) {
      this.expandedEntryId = this.expandedEntryId === id ? "" : id;
    },

    formatDate(d: string) {
      return new Date(d).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  }));
};
