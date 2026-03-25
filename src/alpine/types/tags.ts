/**
 * Tags management types for Alpine components.
 */

import type { TagWithCount, AlpineRefs } from "./index";

export interface TagForm {
  name: string;
  color: string;
}

export interface TagsManagerState {
  tags: TagWithCount[];
  loading: boolean;
  tagModal: boolean;
  editingTag: TagWithCount | null;
  tagForm: TagForm;
  tagError: string;
  tagSaving: boolean;
  deleteTagTarget: TagWithCount | null;
  $refs: AlpineRefs & { tagNameField?: HTMLInputElement };
  $nextTick(fn: () => void): void;
  fetchTags(): Promise<void>;
}
