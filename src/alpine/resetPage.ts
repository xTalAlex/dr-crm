import { authClient } from "@/lib/auth-client";
import type Alpine from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("resetPage", () => ({
    email: "",
    password: "",
    confirm: "",
    error: "",
    success: "",
    loading: false,
    hasToken: new URLSearchParams(window.location.search).has("token"),

    async submitRequest() {
      this.error = "";
      this.success = "";
      this.loading = true;

      const { error } = await authClient.requestPasswordReset({
        email: this.email,
        redirectTo: "/auth/reset-password",
      });

      this.loading = false;

      if (error) {
        this.error = "Errore nell'invio. Riprova.";
        return;
      }

      this.success = "Link di reset inviato alla tua email.";
    },

    async submitNewPassword() {
      this.error = "";
      this.success = "";

      if (this.password !== this.confirm) {
        this.error = "Le password non coincidono";
        return;
      }

      this.loading = true;

      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        this.error = "Token mancante. Richiedi un nuovo link.";
        this.loading = false;
        return;
      }

      const { error } = await authClient.resetPassword({
        newPassword: this.password,
        token,
      });

      this.loading = false;

      if (error) {
        this.error = "Errore nel reset. Il link potrebbe essere scaduto.";
        return;
      }

      this.success = "Password aggiornata. Reindirizzamento...";
      setTimeout(() => (window.location.href = "/auth/login"), 1500);
    },
  }));
};
