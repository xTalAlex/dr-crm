import { formFieldMultiselectMixin } from "../shared/formFieldMultiselectMixin";

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
  tagIds: [] as string[],
});

export function formMixin() {
  return {
    modal: false,
    editing: null as any,
    form: emptyForm(),
    formError: "",
    saving: false,
    showExtra: false,
    deleteTarget: null as any,
    allTags: [] as any[],

    ...formFieldMultiselectMixin({
      itemsKey: "allTags",
      selectedIdsKey: "form.tagIds",
      async onCreate(name, comp) {
        const color = getComputedStyle(document.documentElement)
          .getPropertyValue("--color-petrol-500")
          .trim();
        const res = await fetch("/admin/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        if (res.ok) {
          const tag = await res.json();
          comp.allTags.push(tag);
          return tag;
        }
        return null;
      },
    }),

    async openCreate(this: any) {
      this.editing = null;
      this.form = emptyForm();
      this.formError = "";
      this.showExtra = false;
      this.multiselectReset();
      await this.loadTags();
      this.modal = true;
      this.$nextTick(() => this.$refs.firstField?.focus());
    },

    async openEdit(this: any, c: any) {
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
        tagIds: (c.tags ?? []).map((ct: any) => ct.tag.id),
      };
      this.formError = "";
      this.showExtra = !!(
        this.form.fiscalCode ||
        this.form.birthDate ||
        this.form.address
      );
      this.multiselectReset();
      await this.loadTags();
      this.modal = true;
      this.$nextTick(() => this.$refs.firstField?.focus());
    },

    async save(this: any, keepOpen = false) {
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
      } else {
        this.saving = false;
        this.fetchCustomers();

        if (keepOpen && !this.editing) {
          this.form = emptyForm();
          this.formError = "";
          this.$nextTick(() => this.$refs.firstField?.focus());
        } else {
          this.modal = false;
        }
      }
    },

    async loadTags(this: any) {
      const res = await fetch("/admin/api/tags");
      if (res.ok) this.allTags = await res.json();
    },

    confirmDelete(c: any) {
      this.deleteTarget = c;
    },

    async doDelete(this: any) {
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
