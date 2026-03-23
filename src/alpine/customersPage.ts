import type { Alpine } from "alpinejs";
import { tableMixin } from "./customers/tableMixin";
import { formMixin } from "./customers/formMixin";

export default (Alpine: Alpine) => {
  Alpine.data("customersPage", () => ({
    ...tableMixin(),
    ...formMixin(),
  }));
};
