import { formFieldMultiselectMixin } from "../shared/formFieldMultiselectMixin";
import type { Customer, Tag, NamedItem, CustomerFormData, CustomerFormMixinState } from "@/alpine/types";

const emptyForm = (): CustomerFormData => ({
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
    editing: null as Customer | null,
    form: emptyForm(),
    formError: "",
    saving: false,
    showExtra: false,
    deleteTarget: null as Customer | null,
    allTags: [] as Tag[],

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
          const tag: NamedItem = await res.json();
          (comp as unknown as CustomerFormMixinState).allTags.push(tag as Tag);
          return tag;
        }
        return null;
      },
    }),

    async openFormModal(this: CustomerFormMixinState) {
      this.formError = "";
      this.multiselectReset();
      await this.loadTags();
      this.modal = true;
      this.$nextTick(() => this.$refs.firstField?.focus());
    },

    async openCreate(this: CustomerFormMixinState) {
      this.editing = null;
      this.form = emptyForm();
      this.showExtra = false;
      await this.openFormModal();
    },

    async openEdit(this: CustomerFormMixinState, c: Customer) {
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
        tagIds: (c.tags ?? []).map((ct) => ct.tag.id),
      };
      this.showExtra = !!(
        this.form.fiscalCode ||
        this.form.birthDate ||
        this.form.address
      );
      await this.openFormModal();
    },

    async save(this: CustomerFormMixinState, keepOpen = false) {
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

    async loadTags(this: CustomerFormMixinState) {
      const res = await fetch("/admin/api/tags");
      if (res.ok) this.allTags = await res.json();
    },

    confirmDelete(this: CustomerFormMixinState, c: Customer) {
      this.deleteTarget = c;
    },

    async doDelete(this: CustomerFormMixinState) {
      this.saving = true;
      await fetch(`/admin/api/customers/${this.deleteTarget!.id}`, {
        method: "DELETE",
      });
      this.deleteTarget = null;
      this.saving = false;
      this.fetchCustomers();
    },
  };
}
