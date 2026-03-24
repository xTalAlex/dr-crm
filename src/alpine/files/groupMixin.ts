import { validateFiles, uploadFiles } from "@/lib/file-upload-client";

export function groupMixin() {
  return {
    // Rename group
    renameGroupId: null as string | null,
    renameLabel: "",

    // Add files to group
    addFilesGroupId: null as string | null,
    addFilesUploading: false,
    addFilesError: "",

    // Delete group / file
    deleteTarget: null as { type: "group" | "file"; group: any; file?: any } | null,
    deleting: false,

    startRename(this: any, g: any) {
      this.renameGroupId = g.id;
      this.renameLabel = g.label || "";
      this.$nextTick(() => {
        const input = (this.$refs as any).renameInput as HTMLInputElement;
        input?.focus();
        input?.select();
      });
    },

    async confirmRename(this: any, g: any) {
      const newLabel = this.renameLabel.trim();
      if (newLabel && newLabel !== g.label) {
        await fetch(
          `/admin/api/customers/${this.customerId}/files/groups/${g.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label: newLabel }),
          }
        );
        g.label = newLabel;
      }
      this.renameGroupId = null;
    },

    cancelRename(this: any) {
      this.renameGroupId = null;
    },

    openAddFiles(this: any, g: any) {
      this.addFilesGroupId = g.id;
      this.addFilesError = "";
    },

    async doAddFiles(this: any, groupId: string) {
      this.addFilesError = "";
      const fileInput = (this.$refs as any).addFileInput as HTMLInputElement;
      const validationError = validateFiles(fileInput?.files);

      if (validationError) {
        this.addFilesError = validationError;
      } else {
        this.addFilesUploading = true;
        const { error } = await uploadFiles(
          `/admin/api/customers/${this.customerId}/files/groups/${groupId}`,
          fileInput.files!,
        );
        this.addFilesUploading = false;

        if (error) {
          this.addFilesError = error;
        } else {
          this.addFilesGroupId = null;
          await this.fetchData();
        }
      }
    },

    confirmDelete(this: any, type: "group" | "file", group: any, file?: any) {
      this.deleteTarget = { type, group, file };
    },

    async doDelete(this: any) {
      if (!this.deleteTarget) return;
      const { type, group, file } = this.deleteTarget;
      this.deleting = true;
      const url =
        type === "group"
          ? `/admin/api/customers/${this.customerId}/files/groups/${group.id}`
          : `/admin/api/customers/${this.customerId}/files/entries/${file!.id}`;
      await fetch(url, { method: "DELETE" });
      if (type === "file") group.files = group.files.filter((x: any) => x.id !== file!.id);
      this.deleteTarget = null;
      this.deleting = false;
      if (type === "group") await this.fetchData();
    },
  };
}
