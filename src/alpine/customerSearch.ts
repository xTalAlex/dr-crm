export function customerSearchMixin() {
  return {
    customerSearch: "",
    customerResults: [] as any[],
    selectedCustomer: null as Record<string, any> | null,
    searchingCustomers: false,

    async searchCustomers(this: any) {
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

    selectCustomer(this: any, c: any) {
      this.selectedCustomer = c;
      this.customerSearch = "";
      this.customerResults = [];
    },

    clearCustomer(this: any) {
      this.selectedCustomer = null;
    },

    customerDisplayName(this: any, c: any) {
      return ((c.surname || "") + " " + (c.name || "")).trim() || "Cliente";
    },

    resetCustomerSearch(this: any) {
      this.customerSearch = "";
      this.customerResults = [];
      this.selectedCustomer = null;
    },
  };
}
