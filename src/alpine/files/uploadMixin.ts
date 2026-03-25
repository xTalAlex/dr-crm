import { validateFiles, uploadFiles } from "@/lib/file-upload-client";
import type { FileUploadMixinHost } from "@/alpine/types";

export function uploadMixin() {
  return {
    uploadModal: false,
    uploadLabel: "",
    uploading: false,
    uploadError: "",

    async upload(this: FileUploadMixinHost) {
      this.uploadError = "";
      const fileInput = this.$refs.fileInput as HTMLInputElement | undefined;
      const validationError = validateFiles(fileInput?.files ?? null);

      if (validationError) {
        this.uploadError = validationError;
      } else {
        this.uploading = true;
        const { error } = await uploadFiles(
          `/admin/api/customers/${this.customerId}/files/upload`,
          fileInput!.files!,
          this.uploadLabel,
        );
        this.uploading = false;

        if (error) {
          this.uploadError = error;
        } else {
          this.uploadLabel = "";
          this.uploadModal = false;
          fileInput!.value = "";
          await this.fetchData();
        }
      }
    },
  };
}
