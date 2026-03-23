import type Alpine from "alpinejs";
import { tableState } from "./customers/tableState";
import { formState } from "./customers/formState";

export default (Alpine: Alpine) => {
  Alpine.data("customersPage", () => ({
    ...tableState(),
    ...formState(),
  }));
};
