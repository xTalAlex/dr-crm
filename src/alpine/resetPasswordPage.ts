import { authClient } from "@/lib/auth-client";
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("resetPasswordPage", () => ({
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
      } else {
        this.success = "Link di reset inviato alla tua email.";
      }
    },

    async submitNewPassword() {
      this.error = "";
      this.success = "";

      const token = new URLSearchParams(window.location.search).get("token");

      if (this.password !== this.confirm) {
        this.error = "Le password non coincidono";
      } else if (!token) {
        this.error = "Token mancante. Richiedi un nuovo link.";
      } else {
        this.loading = true;

        const { error } = await authClient.resetPassword({
          newPassword: this.password,
          token,
        });

        this.loading = false;

        if (error) {
          this.error = "Impossibile resettare la password. Il link potrebbe essere scaduto.";
        } else {
          this.success = "Password aggiornata. Reindirizzamento...";
          setTimeout(() => (window.location.href = "/auth/login"), 1500);
        }
      }
    },
  }));
};
