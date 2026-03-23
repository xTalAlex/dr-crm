import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("magicFiles", (token: string) => ({
    token,
    loading: false,
    error: "",
    data: null as null | { label?: string; expiresAt: string; files: { fileName: string; size: number; url: string }[] },
    pin: "",
    pinDigits: ['', '', '', ''] as string[],

    async verify() {
      this.error = "";
      this.loading = true;
      const res = await fetch(`/api/files/${this.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: this.pin }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        this.error = body.error || "Link non valido o scaduto";
        this.loading = false;
      } else {
        this.data = await res.json();
        this.loading = false;
      }
    },
  }));
};
