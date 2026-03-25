/**
 * Customer-related types for Alpine components.
 * Includes search, form, and table state management.
 */

import type { Customer, Tag, AlpineRefs } from "./index";

/** Customer search mixin state */
export interface CustomerSearchState {
  customerSearch: string;
  customerResults: Customer[];
  selectedCustomer: Customer | null;
  searchingCustomers: boolean;
  searchCustomers(): Promise<void>;
  selectCustomer(c: Customer): void;
  clearCustomer(): void;
  customerDisplayName(c: Customer): string;
  resetCustomerSearch(): void;
}

export interface CustomerFormData {
  name: string;
  surname: string;
  phone: string;
  phone2: string;
  email: string;
  fiscalCode: string;
  birthDate: string;
  address: string;
  notes: string;
  tagIds: string[];
}

/** Customer form mixin state (also uses multiselect and table) */
export interface CustomerFormMixinState {
  modal: boolean;
  editing: Customer | null;
  form: CustomerFormData;
  formError: string;
  saving: boolean;
  showExtra: boolean;
  deleteTarget: Customer | null;
  allTags: Tag[];
  $refs: AlpineRefs & { firstField?: HTMLInputElement };
  $nextTick(fn: () => void): void;
  multiselectReset(): void;
  fetchCustomers(): Promise<void>;
  openFormModal(): Promise<void>;
  loadTags(): Promise<void>;
}
