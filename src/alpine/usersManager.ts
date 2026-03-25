import { authClient } from "@/lib/auth-client";
import type { Alpine } from "alpinejs";
import type { AppUser, UsersManagerState } from "@/alpine/types";

export default (Alpine: Alpine) => {
  Alpine.data("usersManager", (currentUserId: string) => ({
    users: [] as AppUser[],
    loading: false,
    currentUserId,
    removeTarget: null as AppUser | null,
    modal: false,
    form: { name: "", email: "", password: "" },
    formError: "",
    saving: false,

    async fetchUsers() {
      this.loading = true;
      const { data } = await authClient.admin.listUsers({ query: {} });
      // better-auth returns Date objects, but after JSON serialization they become strings
      this.users = (data?.users ?? []) as unknown as AppUser[];
      this.loading = false;
    },

    openCreate(this: UsersManagerState) {
      this.form = { name: "", email: "", password: "" };
      this.formError = "";
      this.modal = true;
    },

    async createUser(this: UsersManagerState) {
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

    confirmRemove(this: UsersManagerState, u: AppUser) {
      this.removeTarget = u;
    },

    async doRemove(this: UsersManagerState) {
      if (this.removeTarget?.id === this.currentUserId) return;
      this.saving = true;
      await authClient.admin.removeUser({ userId: this.removeTarget!.id });
      this.removeTarget = null;
      this.saving = false;
      this.fetchUsers();
    },
  }));
};
