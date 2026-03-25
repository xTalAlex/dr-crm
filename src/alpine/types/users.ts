/**
 * Users management types for Alpine components.
 */

import type { AppUser, AlpineRefs } from "./index";

export interface UserForm {
  name: string;
  email: string;
  password: string;
}

export interface UsersManagerState {
  users: AppUser[];
  loading: boolean;
  currentUserId: string;
  removeTarget: AppUser | null;
  modal: boolean;
  form: UserForm;
  formError: string;
  saving: boolean;
  $refs: AlpineRefs;
  fetchUsers(): Promise<void>;
}
