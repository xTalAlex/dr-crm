import { authClient } from "@/lib/auth-client";
import type Alpine from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("usersPage", (currentUserId: string) => ({
    users: [] as any[],
    loading: false,
    currentUserId,

    modal: false,
    form: { name: "", email: "", password: "" },
    formError: "",
    saving: false,

    removeTarget: null as any,

    async fetchUsers() {
      this.loading = true;
      const { data } = await authClient.admin.listUsers({
        query: { limit: 100 },
      });
      this.users = data?.users ?? [];
      this.loading = false;
    },

    openCreate() {
      this.form = { name: "", email: "", password: "" };
      this.formError = "";
      this.modal = true;
    },

    async createUser() {
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
        return;
      }

      this.modal = false;
      this.saving = false;
      this.fetchUsers();
    },

    confirmRemove(u: any) {
      this.removeTarget = u;
    },

    async doRemove() {
      this.saving = true;
      await authClient.admin.removeUser({ userId: this.removeTarget.id });
      this.removeTarget = null;
      this.saving = false;
      this.fetchUsers();
    },
  }));
};
