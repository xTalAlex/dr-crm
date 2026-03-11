import type Alpine from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("customersPage", () => ({
    customers: [] as any[],
    total: 0,
    page: 1,
    limit: 25,
    search: "",
    activeLetter: "",
    letterCounts: {} as Record<string, number>,
    showMobileLetters: false,
    loading: false,

    modal: false,
    editing: null as any,
    form: {
      name: "",
      surname: "",
      phone: "",
      phone2: "",
      email: "",
      fiscalCode: "",
      birthDate: "",
      address: "",
      notes: "",
    },
    formError: "",
    saving: false,

    deleteTarget: null as any,

    smsModal: false,
    smsTarget: null as any,
    smsText: "",
    smsError: "",
    smsSuccess: "",
    smsSending: false,

    get totalPages() {
      return Math.max(1, Math.ceil(this.total / this.limit));
    },

    async fetchCustomers() {
      this.loading = true;
      const params = new URLSearchParams({
        page: String(this.page),
        limit: String(this.limit),
      });
      if (this.search) params.set("q", this.search);
      if (this.activeLetter) params.set("letter", this.activeLetter);

      const res = await fetch(`/admin/api/customers?${params}`);
      const data = await res.json();
      this.customers = data.customers;
      this.total = data.total;
      this.letterCounts = data.letterCounts ?? {};
      this.loading = false;
    },

    openCreate() {
      this.editing = null;
      this.form = {
        name: "",
        surname: "",
        phone: "",
        phone2: "",
        email: "",
        fiscalCode: "",
        birthDate: "",
        address: "",
        notes: "",
      };
      this.formError = "";
      this.modal = true;
      this.$nextTick(() => this.$refs.firstField?.focus());
    },

    openEdit(c: any) {
      this.editing = c;
      this.form = {
        name: c.name,
        surname: c.surname ?? "",
        phone: c.phone,
        phone2: c.phone2 ?? "",
        email: c.email ?? "",
        fiscalCode: c.fiscalCode ?? "",
        birthDate: c.birthDate ? c.birthDate.slice(0, 10) : "",
        address: c.address ?? "",
        notes: c.notes ?? "",
      };
      this.formError = "";
      this.modal = true;
      this.$nextTick(() => this.$refs.firstField?.focus());
    },

    async save(keepOpen = false) {
      this.formError = "";
      this.saving = true;

      const url = this.editing
        ? `/admin/api/customers/${this.editing.id}`
        : "/admin/api/customers";
      const method = this.editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.form),
      });

      if (!res.ok) {
        const err = await res.json();
        this.formError = err.error || "Errore nel salvataggio";
        this.saving = false;
        return;
      }

      this.saving = false;
      this.fetchCustomers();

      if (keepOpen && !this.editing) {
        this.form = {
          name: "",
          surname: "",
          phone: "",
          phone2: "",
          email: "",
          fiscalCode: "",
          birthDate: "",
          address: "",
          notes: "",
        };
        this.formError = "";
        this.$nextTick(() => this.$refs.firstField?.focus());
      } else {
        this.modal = false;
      }
    },

    confirmDelete(c: any) {
      this.deleteTarget = c;
    },

    async doDelete() {
      this.saving = true;
      await fetch(`/admin/api/customers/${this.deleteTarget.id}`, {
        method: "DELETE",
      });
      this.deleteTarget = null;
      this.saving = false;
      this.fetchCustomers();
    },

    openSms(c: any) {
      this.smsTarget = c;
      this.smsText = "";
      this.smsError = "";
      this.smsSuccess = "";
      this.smsModal = true;
      this.$nextTick(() => this.$refs.smsField?.focus());
    },

    async sendSms() {
      this.smsError = "";
      this.smsSuccess = "";
      this.smsSending = true;

      const res = await fetch("/admin/api/communications/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: this.smsTarget.phone,
          text: this.smsText,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        this.smsError = err.error || "Errore nell'invio";
        this.smsSending = false;
        return;
      }

      this.smsSending = false;
      this.smsSuccess = "SMS inviato con successo";
      setTimeout(() => {
        this.smsModal = false;
      }, 1500);
    },
  }));
};
