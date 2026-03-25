import { validateFiles, uploadFiles } from "@/lib/file-upload-client";
import type { FileGroup, FileEntry, FileDeleteTarget, FileGroupMixinHost } from "@/alpine/types";

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
    deleteTarget: null as FileDeleteTarget | null,
    deleting: false,

    startRename(this: FileGroupMixinHost, g: FileGroup) {
      this.renameGroupId = g.id;
      this.renameLabel = g.label || "";
      this.$nextTick(() => {
        const input = this.$refs.renameInput;
        input?.focus();
        input?.select();
      });
    },

    async confirmRename(this: FileGroupMixinHost, g: FileGroup) {
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

    cancelRename(this: FileGroupMixinHost) {
      this.renameGroupId = null;
    },

    openAddFiles(this: FileGroupMixinHost, g: FileGroup) {
      this.addFilesGroupId = g.id;
      this.addFilesError = "";
    },

    async doAddFiles(this: FileGroupMixinHost, groupId: string) {
      this.addFilesError = "";
      const fileInput = this.$refs.addFileInput;
      const validationError = validateFiles(fileInput?.files ?? null);

      if (validationError) {
        this.addFilesError = validationError;
      } else {
        this.addFilesUploading = true;
        const { error } = await uploadFiles(
          `/admin/api/customers/${this.customerId}/files/groups/${groupId}`,
          fileInput!.files!,
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

    confirmDelete(this: FileGroupMixinHost, type: "group" | "file", group: FileGroup, file?: FileEntry) {
      this.deleteTarget = { type, group, file };
    },

    async doDelete(this: FileGroupMixinHost) {
      if (!this.deleteTarget) return;
      const { type, group, file } = this.deleteTarget;
      this.deleting = true;
      const url =
        type === "group"
          ? `/admin/api/customers/${this.customerId}/files/groups/${group.id}`
          : `/admin/api/customers/${this.customerId}/files/entries/${file!.id}`;
      await fetch(url, { method: "DELETE" });
      if (type === "file") group.files = group.files.filter((x) => x.id !== file!.id);
      this.deleteTarget = null;
      this.deleting = false;
      if (type === "group") await this.fetchData();
    },
  };
}
