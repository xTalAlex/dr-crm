import { signIn } from "@/lib/auth-client";
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
  Alpine.data("loginForm", () => ({
    email: "",
    password: "",
    error: "",
    loading: false,

    async submitLogin() {
      this.error = "";
      this.loading = true;

      const { error } = await signIn.email({
        email: this.email,
        password: this.password,
      });

      if (error) {
        this.error = "Credenziali non valide";
        this.loading = false;
      } else {
        window.location.href = "/admin";
      }
    },
  }));
};
