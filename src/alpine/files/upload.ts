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

      const maxSize = 5 * 1024 * 1024;
      const oversized = Array.from(files).filter((f) => f.size > maxSize);
      if (oversized.length > 0) {
        this.uploadError = `File troppo grandi (max 5 MB): ${oversized.map((f) => f.name).join(", ")}`;
        return;
      }

      const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 20 * 1024 * 1024) {
        this.uploadError = `Upload troppo grande: ${(totalSize / 1024 / 1024).toFixed(1)} MB (max 20 MB)`;
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
