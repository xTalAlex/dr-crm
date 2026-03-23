import { authClient } from "@/lib/auth-client";

export function userFormMixin() {
  return {
    modal: false,
    form: { name: "", email: "", password: "" },
    formError: "",
    saving: false,

    openCreate(this: any) {
      this.form = { name: "", email: "", password: "" };
      this.formError = "";
      this.modal = true;
    },

    async createUser(this: any) {
      this.formError = "";
      this.saving = true;

      const { error } = await authClient.admin.createUser({
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
        role: "admin",
      });

      if (error) {
        this.formError = error.message || "Errore nella creazione";
        this.saving = false;
      } else {
        this.modal = false;
        this.saving = false;
        this.fetchUsers();
      }
    },

    confirmRemove(this: any, u: any) {
      this.removeTarget = u;
    },

    async doRemove(this: any) {
      if (this.removeTarget?.id === this.currentUserId) return;
      this.saving = true;
      await authClient.admin.removeUser({ userId: this.removeTarget.id });
      this.removeTarget = null;
      this.saving = false;
      this.fetchUsers();
    },
  };
}
