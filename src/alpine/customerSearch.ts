import type { Customer, CustomerSearchState } from "@/alpine/types";

export function customerSearchMixin() {
  return {
    customerSearch: "",
    customerResults: [] as Customer[],
    selectedCustomer: null as Customer | null,
    searchingCustomers: false,

    async searchCustomers(this: CustomerSearchState) {
      const q = this.customerSearch.trim();
      if (q.length < 2) {
        this.customerResults = [];
      } else {
        this.searchingCustomers = true;
        const res = await fetch(
          `/admin/api/customers?q=${encodeURIComponent(q)}&limit=8`,
        );
        if (res.ok) {
          const data = await res.json();
          this.customerResults = data.customers;
        }
        this.searchingCustomers = false;
      }
    },

    selectCustomer(this: CustomerSearchState, c: Customer) {
      this.selectedCustomer = c;
      this.customerSearch = "";
      this.customerResults = [];
    },

    clearCustomer(this: CustomerSearchState) {
      this.selectedCustomer = null;
    },

    customerDisplayName(_this: CustomerSearchState, c: Customer) {
      return ((c.surname || "") + " " + (c.name || "")).trim() || "Paziente";
    },

    resetCustomerSearch(this: CustomerSearchState) {
      this.customerSearch = "";
      this.customerResults = [];
      this.selectedCustomer = null;
    },
  };
}
