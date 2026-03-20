import type Alpine from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("customerFilesPage", (customerId: string) => ({
    customerId,
    customerName: "",
    customerPhone: "",
    groups: [] as any[],
    loading: true,

    // Upload
    uploadLabel: "",
    uploading: false,
    uploadError: "",

    // Rename group
    renameGroupId: null as string | null,
    renameLabel: "",

    // Add files to group
    addFilesGroupId: null as string | null,
    addFilesUploading: false,
    addFilesError: "",

    // Delete group
    deleteGroupTarget: null as any,
    deleting: false,

    // Magic link
    magicLinkModal: false,
    magicLinkGroupId: "",
    magicLinkHours: 72,
    magicLinkResult: null as string | null,
    magicLinkPin: "",
    generatingLink: false,

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

    async upload() {
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

      const res = await fetch(`/admin/api/customers/${this.customerId}/files/upload`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        this.uploadError = err.error || "Errore nel caricamento";
        this.uploading = false;
        return;
      }

      this.uploading = false;
      this.uploadLabel = "";
      fileInput.value = "";
      await this.fetchData();
    },

    startRename(g: any) {
      this.renameGroupId = g.id;
      this.renameLabel = g.label || "";
      this.$nextTick(() => {
        const input = (this.$refs as any).renameInput as HTMLInputElement;
        input?.focus();
        input?.select();
      });
    },

    async confirmRename(g: any) {
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

    cancelRename() {
      this.renameGroupId = null;
    },

    openAddFiles(g: any) {
      this.addFilesGroupId = g.id;
      this.addFilesError = "";
    },

    async doAddFiles(groupId: string) {
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

    confirmDeleteGroup(g: any) {
      this.deleteGroupTarget = g;
    },

    async doDeleteGroup() {
      this.deleting = true;
      await fetch(
        `/admin/api/customers/${this.customerId}/files/groups/${this.deleteGroupTarget.id}`,
        { method: "DELETE" }
      );
      this.deleteGroupTarget = null;
      this.deleting = false;
      await this.fetchData();
    },

    async deleteFile(g: any, f: any) {
      await fetch(
        `/admin/api/customers/${this.customerId}/files/entries/${f.id}`,
        { method: "DELETE" }
      );
      g.files = g.files.filter((x: any) => x.id !== f.id);
    },

    hasExistingLink: false,

    generateMagicLink(g: any) {
      this.magicLinkGroupId = g.id;
      this.magicLinkHours = 72;
      this.magicLinkResult = null;
      this.magicLinkPin = "";
      this.hasExistingLink = !!g.magicLink;
      this.magicLinkModal = true;
    },

    async doGenerateMagicLink() {
      this.generatingLink = true;
      const res = await fetch(
        `/admin/api/customers/${this.customerId}/files/groups/${this.magicLinkGroupId}/magic-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expiresInHours: this.magicLinkHours }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        this.magicLinkResult = data.magicLink.token;
        this.magicLinkPin = data.magicLink.pin;
        await navigator.clipboard.writeText(this.magicLinkUrl(data.magicLink.token));
        await this.fetchData();
      }
      this.generatingLink = false;
    },

    magicLinkUrl(token: string) {
      return `${window.location.origin}/files/${token}`;
    },

    async copyLink(token: string) {
      await navigator.clipboard.writeText(this.magicLinkUrl(token));
    },

    waLinkWithMagic() {
      const phone = this.customerPhone.replace(/[^0-9+]/g, '');
      const text = `Ecco i tuoi documenti: ${this.magicLinkUrl(this.magicLinkResult!)}\nCodice PIN: ${this.magicLinkPin}`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    },

    waLinkForGroup(g: any) {
      const phone = this.customerPhone.replace(/[^0-9+]/g, '');
      const text = `Ecco i tuoi documenti: ${this.magicLinkUrl(g.magicLink.token)}\nCodice PIN: ${g.magicLink.pin}`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    },

    async sendSmsForGroup(g: any) {
      const text = `Ecco i tuoi documenti: ${this.magicLinkUrl(g.magicLink.token)}\nCodice PIN: ${g.magicLink.pin}`;
      await fetch("/admin/api/communications/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: this.customerPhone, text }),
      });
    },

    async openSmsFromMagicLink() {
      const text = `Ecco i tuoi documenti: ${this.magicLinkUrl(this.magicLinkResult!)}\nCodice PIN: ${this.magicLinkPin}`;
      this.magicLinkModal = false;

      const res = await fetch("/admin/api/communications/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: this.customerPhone, text }),
      });

      if (!res.ok) {
        console.error("Errore invio SMS");
      }
    },
  }));
};
