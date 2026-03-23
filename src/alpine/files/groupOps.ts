export function groupOpsMixin() {
  return {
    // Rename group
    renameGroupId: null as string | null,
    renameLabel: "",

    // Add files to group
    addFilesGroupId: null as string | null,
    addFilesUploading: false,
    addFilesError: "",

    // Delete group / file
    deleteGroupTarget: null as any,
    deleteFileTarget: null as { group: any; file: any } | null,
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
      const files = fileInput?.files;
      if (!files || files.length === 0) {
        this.addFilesError = "Seleziona almeno un file";
        return;
      }

      this.addFilesUploading = true;
      const fd = new FormData();
      for (const f of files) {
        fd.append("files", f);
      }

      const res = await fetch(
        `/admin/api/customers/${this.customerId}/files/groups/${groupId}`,
        { method: "POST", body: fd }
      );

      if (!res.ok) {
        const err = await res.json();
        this.addFilesError = err.error || "Errore nel caricamento";
        this.addFilesUploading = false;
        return;
      }

      this.addFilesUploading = false;
      this.addFilesGroupId = null;
      await this.fetchData();
    },

    confirmDeleteGroup(this: any, g: any) {
      this.deleteGroupTarget = g;
    },

    async doDeleteGroup(this: any) {
      this.deleting = true;
      await fetch(
        `/admin/api/customers/${this.customerId}/files/groups/${this.deleteGroupTarget.id}`,
        { method: "DELETE" }
      );
      this.deleteGroupTarget = null;
      this.deleting = false;
      await this.fetchData();
    },

    confirmDeleteFile(this: any, g: any, f: any) {
      this.deleteFileTarget = { group: g, file: f };
    },

    async doDeleteFile(this: any) {
      if (!this.deleteFileTarget) return;
      const { group, file } = this.deleteFileTarget;
      this.deleting = true;
      await fetch(
        `/admin/api/customers/${this.customerId}/files/entries/${file.id}`,
        { method: "DELETE" }
      );
      group.files = group.files.filter((x: any) => x.id !== file.id);
      this.deleteFileTarget = null;
      this.deleting = false;
    },
  };
}
