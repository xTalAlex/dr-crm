import type { Alpine } from "alpinejs";

const defaultColor = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--color-petrol-500")
    .trim();

export default (Alpine: Alpine) => {
  Alpine.data("tagsManager", () => ({
    tags: [] as any[],
    loading: true,
    tagModal: false,
    editingTag: null as any,
    tagForm: { name: "", color: "" },
    tagError: "",
    tagSaving: false,
    deleteTagTarget: null as any,

    async fetchTags(this: any) {
      this.loading = true;
      const res = await fetch("/admin/api/tags");
      this.tags = await res.json();
      this.loading = false;
    },

    openTagForm(this: any, tag?: any) {
      this.editingTag = tag ?? null;
      this.tagForm = {
        name: tag?.name ?? "",
        color: tag?.color || defaultColor(),
      };
      this.tagError = "";
      this.tagModal = true;
      this.$nextTick(() => this.$refs.tagNameField?.focus());
    },

    async saveTag(this: any) {
      this.tagError = "";
      this.tagSaving = true;

      const url = this.editingTag
        ? `/admin/api/tags/${this.editingTag.id}`
        : "/admin/api/tags";
      const method = this.editingTag ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.tagForm),
      });

      if (!res.ok) {
        const err = await res.json();
        this.tagError = err.error || "Errore nel salvataggio";
      } else {
        this.tagModal = false;
        await this.fetchTags();
      }
      this.tagSaving = false;
    },

    confirmDeleteTag(tag: any) {
      this.deleteTagTarget = tag;
    },

    async doDeleteTag(this: any) {
      this.tagSaving = true;
      await fetch(`/admin/api/tags/${this.deleteTagTarget.id}`, {
        method: "DELETE",
      });
      this.deleteTagTarget = null;
      this.tagSaving = false;
      await this.fetchTags();
    },
  }));
};
