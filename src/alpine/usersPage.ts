import { authClient } from "@/lib/auth-client";
import type { Alpine } from "alpinejs";
import { userFormMixin } from "./settings/userFormMixin";

export default (Alpine: Alpine) => {
  Alpine.data("usersPage", (currentUserId: string) => ({
    users: [] as any[],
    loading: false,
    currentUserId,
    removeTarget: null as any,

    ...userFormMixin(),

    async fetchUsers() {
      this.loading = true;
      const { data } = await authClient.admin.listUsers({ query: {} });
      this.users = data?.users ?? [];
      this.loading = false;
    },
  }));
};
