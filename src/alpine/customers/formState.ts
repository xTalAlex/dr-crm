const emptyForm = () => ({
  name: "",
  surname: "",
  phone: "",
  phone2: "",
  email: "",
  fiscalCode: "",
  birthDate: "",
  address: "",
  notes: "",
});

export function formState() {
  return {
    modal: false,
    editing: null as any,
    form: emptyForm(),
    formError: "",
    saving: false,
    showExtra: false,
    deleteTarget: null as any,

    openCreate() {
      this.editing = null;
      this.form = emptyForm();
      this.formError = "";
      this.showExtra = false;
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
      this.showExtra = !!(
        this.form.fiscalCode ||
        this.form.birthDate ||
        this.form.address ||
        this.form.notes
      );
      this.modal = true;
      this.$nextTick(() => this.$refs.firstField?.focus());
    },

    async save(keepOpen = false) {
      this.formError = "";
      this.saving = true;

      const capitalize = (s: string) =>
        s.trim().replace(/\b\w/g, (c) => c.toUpperCase());
      this.form.name = capitalize(this.form.name);
      this.form.surname = capitalize(this.form.surname);

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
        this.form = emptyForm();
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
  };
}
