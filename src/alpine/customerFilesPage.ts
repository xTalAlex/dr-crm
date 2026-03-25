import type { Alpine } from "alpinejs";
import { uploadMixin } from "./files/uploadMixin";
import { groupMixin } from "./files/groupMixin";
import { sharingMixin } from "./files/sharingMixin";
import type { FileGroup } from "@/alpine/types";
import content from "@/data/content.json";

export default (Alpine: Alpine) => {
  Alpine.data("customerFilesPage", (customerId: string) => ({
    customerId,
    customerName: "",
    customerPhone: "",
    groups: [] as FileGroup[],
    loading: true,

    ...uploadMixin(),
    ...groupMixin(),
    ...sharingMixin(),

    async init() {
      await this.fetchData();
    },

    async fetchData() {
      this.loading = true;
      const res = await fetch(`/admin/api/customers/${this.customerId}/files`);
      if (!res.ok) {
        this.loading = false;
      } else {
        const data = await res.json();
        this.customerName =
          ((data.customer.surname || "") + " " + (data.customer.name || "")).trim() ||
          content.app.customerLabel;
        this.customerPhone = data.customer.phone || "";
        this.groups = data.groups;
        this.loading = false;
      }
    },
  }));
};
