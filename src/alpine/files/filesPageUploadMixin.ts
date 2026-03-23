import { validateFiles, uploadFiles } from "@/lib/file-upload-client";

export function filesPageUploadMixin() {
  return {
    uploadModal: false,
    uploadLabel: "",
    uploading: false,
    uploadError: "",
    customerSearch: "",
    customerResults: [] as any[],
    selectedCustomer: null as Record<string, any> | null,
    searchingCustomers: false,

    openUpload(this: any) {
      this.uploadLabel = "";
      this.uploadError = "";
      this.customerSearch = "";
      this.customerResults = [];
      this.selectedCustomer = null;
      this.uploadModal = true;
    },

    async searchCustomers(this: any) {
      const q = this.customerSearch.trim();
      if (q.length < 2) {
        this.customerResults = [];
      } else {
        this.searchingCustomers = true;
        const res = await fetch(`/admin/api/customers?q=${encodeURIComponent(q)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          this.customerResults = data.customers;
        }
        this.searchingCustomers = false;
      }
    },

    selectCustomer(this: any, c: any) {
      this.selectedCustomer = c;
      this.customerSearch = "";
      this.customerResults = [];
    },

    clearCustomer(this: any) {
      this.selectedCustomer = null;
    },

    customerDisplayName(_this: any, c: any) {
      return ((c.surname || "") + " " + (c.name || "")).trim() || "Cliente";
    },

    async upload(this: any) {
      this.uploadError = "";
      const cust = this.selectedCustomer;

      if (!cust) {
        this.uploadError = "Seleziona un cliente";
      } else {
        const fileInput = this.$refs.filesPageInput as HTMLInputElement;
        const validationError = validateFiles(fileInput?.files);

        if (validationError) {
          this.uploadError = validationError;
        } else {
          this.uploading = true;
          const error = await uploadFiles(
            `/admin/api/customers/${cust.id}/files/upload`,
            fileInput.files!,
            this.uploadLabel,
          );
          this.uploading = false;

          if (error) {
            this.uploadError = error;
          } else {
            this.uploadModal = false;
            await this.fetchData();
          }
        }
      }
    },
  };
}
