import type Alpine from "alpinejs";
import { uploadMixin } from "./files/upload";
import { groupOpsMixin } from "./files/groupOps";
import { sharingMixin } from "./files/sharing";

export default (Alpine: Alpine) => {
  Alpine.data("customerFilesPage", (customerId: string) => ({
    customerId,
    customerName: "",
    customerPhone: "",
    groups: [] as any[],
    loading: true,

    ...uploadMixin(),
    ...groupOpsMixin(),
    ...sharingMixin(),

    async init() {
      await this.fetchData();
    },

    async fetchData() {
      this.loading = true;
      const res = await fetch(`/admin/api/customers/${this.customerId}/files`);
      if (!res.ok) {
        this.loading = false;
        return;
      }
      const data = await res.json();
      this.customerName =
        ((data.customer.surname || "") + " " + (data.customer.name || "")).trim() ||
        "Cliente";
      this.customerPhone = data.customer.phone || "";
      this.groups = data.groups;
      this.loading = false;
    },
  }));
};
