import { waLink } from "@/lib/wa-link";

export function sharingMixin() {
  return {
    magicLinkModal: false,
    magicLinkGroupId: "",
    magicLinkHours: 72,
    magicLinkResult: null as string | null,
    magicLinkPin: "",
    generatingLink: false,
    hasExistingLink: false,

    generateMagicLink(this: any, g: any) {
      this.magicLinkGroupId = g.id;
      this.magicLinkHours = 72;
      this.magicLinkResult = null;
      this.magicLinkPin = "";
      this.hasExistingLink = !!g.magicLink;
      this.magicLinkModal = true;
    },

    async doGenerateMagicLink(this: any) {
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
        await this.fetchData();
        this.magicLinkModal = false;
      }
      this.generatingLink = false;
    },

    magicLinkUrl(token: string) {
      return `${window.location.origin}/files/${token}`;
    },

    async copyLink(this: any, token: string) {
      await navigator.clipboard.writeText(this.magicLinkUrl(token));
    },

    waLinkMessage(this: any, token: string, pin: string) {
      const text = `Ecco i tuoi documenti: ${this.magicLinkUrl(token)}\nCodice PIN: ${pin}`;
      return waLink(this.customerPhone, text);
    },

    async sendViaWhatsApp(this: any, g: any) {
      const hasValidLink =
        g.magicLink && new Date(g.magicLink.expiresAt) >= new Date();
      if (hasValidLink) {
        window.open(
          this.waLinkMessage(g.magicLink.token, g.magicLink.pin),
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        const res = await fetch(
          `/admin/api/customers/${this.customerId}/files/groups/${g.id}/magic-link`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expiresInHours: 72 }),
          }
        );
        if (res.ok) {
          await this.fetchData();
          const freshGroup = this.groups.find((gr: any) => gr.id === g.id);
          if (freshGroup) {
            window.open(
            this.waLinkMessage(freshGroup.magicLink.token, freshGroup.magicLink.pin),
              "_blank",
              "noopener,noreferrer"
            );
          }
        }
      }
    },
  };
}
