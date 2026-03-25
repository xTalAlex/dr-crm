/**
 * Shared/generic types used across multiple Alpine components.
 */

import type { NamedItem } from "./models";

/** Common refs object shape for Alpine components */
export interface AlpineRefs {
  [key: string]: HTMLElement | undefined;
}

/** Configuration for the multiselect FormField mixin */
export interface FormFieldMultiselectConfig {
  /** Property name on the Alpine component containing all items (each with `id` and `name`) */
  itemsKey: string;
  /** Property path for the selected IDs array, supports dot notation (e.g. "form.tagIds") */
  selectedIdsKey: string;
  /** Optional: async function to create an item from the search text. Receives (name, component). Return the new item or null. */
  onCreate?: (name: string, comp: MultiselectState) => Promise<NamedItem | null>;
}

/** Internal state of the multiselect mixin */
export interface MultiselectState {
  multiselectSearch: string;
  multiselectOpen: boolean;
  multiselectCreating: boolean;
  multiselectItems(): NamedItem[];
  multiselectSelectedIds(): string[];
  multiselectQuery(): string;
  multiselectFiltered(): NamedItem[];
  multiselectHasExactMatch(): boolean;
  multiselectSelected(): NamedItem[];
  multiselectSelect(id: string): void;
  multiselectRemove(id: string): void;
  multiselectBackspace(): void;
  multiselectEnter(): void;
  multiselectCreate(): Promise<void>;
  multiselectReset(): void;
  [key: string]: unknown;
}
