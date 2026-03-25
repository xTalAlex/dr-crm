import { validateFiles, uploadFiles } from "@/lib/file-upload-client";
import { customerSearchMixin } from "@/alpine/customerSearch";
import type { FilesPageUploadState } from "@/alpine/types";

export function filesPageUploadMixin() {
  return {
    ...customerSearchMixin(),
    uploadModal: false,
    uploadLabel: "",
    uploading: false,
    uploadError: "",

    openUpload(this: FilesPageUploadState) {
      this.uploadLabel = "";
      this.uploadError = "";
      this.resetCustomerSearch();
      this.uploadModal = true;
    },

    async upload(this: FilesPageUploadState) {
      this.uploadError = "";
      const cust = this.selectedCustomer;

      if (!cust) {
        this.uploadError = "Seleziona un paziente";
      } else {
        const fileInput = this.$refs.filesPageInput;
        const validationError = validateFiles(fileInput?.files ?? null);

        if (validationError) {
          this.uploadError = validationError;
        } else {
          this.uploading = true;
          const { error } = await uploadFiles(
            `/admin/api/customers/${cust.id}/files/upload`,
            fileInput!.files!,
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
