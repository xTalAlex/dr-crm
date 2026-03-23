export function uploadMixin() {
  return {
    uploadModal: false,
    uploadLabel: "",
    uploading: false,
    uploadError: "",

    async upload(this: any) {
      this.uploadError = "";
      const fileInput = this.$refs.fileInput as HTMLInputElement;
      const files = fileInput?.files;
      if (!files || files.length === 0) {
        this.uploadError = "Seleziona almeno un file";
        return;
      }

      this.uploading = true;
      const fd = new FormData();
      fd.append("label", this.uploadLabel);
      for (const f of files) {
        fd.append("files", f);
      }

      const res = await fetch(
        `/admin/api/customers/${this.customerId}/files/upload`,
        { method: "POST", body: fd }
      );

      if (!res.ok) {
        const err = await res.json();
        this.uploadError = err.error || "Errore nel caricamento";
        this.uploading = false;
        return;
      }

      this.uploading = false;
      this.uploadLabel = "";
      this.uploadModal = false;
      fileInput.value = "";
      await this.fetchData();
    },
  };
}
