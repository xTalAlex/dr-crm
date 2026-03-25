/**
 * File management types for Alpine components.
 * Covers upload, group management, and sharing (magic links).
 */

import type { FileGroup, FileEntry, CustomerSearchState, AlpineRefs } from "./index";

export interface FileDeleteTarget {
  type: "group" | "file";
  group: FileGroup;
  file?: FileEntry;
}

/** Minimum host component state required by the group mixin */
export interface FileGroupMixinHost {
  customerId: string;
  groups: FileGroup[];
  renameGroupId: string | null;
  renameLabel: string;
  addFilesGroupId: string | null;
  addFilesUploading: boolean;
  addFilesError: string;
  deleteTarget: FileDeleteTarget | null;
  deleting: boolean;
  $refs: AlpineRefs & { renameInput?: HTMLInputElement; addFileInput?: HTMLInputElement };
  $nextTick(fn: () => void): void;
  fetchData(): Promise<void>;
}

/** Minimum host component state required by the upload mixin */
export interface FileUploadMixinHost {
  customerId: string;
  uploadModal: boolean;
  uploadLabel: string;
  uploading: boolean;
  uploadError: string;
  $refs: AlpineRefs & { fileInput?: HTMLInputElement };
  fetchData(): Promise<void>;
}

/** Minimum host component state required by the sharing mixin */
export interface FileSharingMixinHost {
  customerId: string;
  customerPhone: string;
  groups: FileGroup[];
  magicLinkModal: boolean;
  magicLinkGroupId: string;
  magicLinkHours: number;
  magicLinkResult: string | null;
  magicLinkPin: string;
  generatingLink: boolean;
  hasExistingLink: boolean;
  magicLinkUrl(token: string): string;
  waLinkMessage(token: string, pin: string): string;
  fetchData(): Promise<void>;
}

/** Upload mixin state for the global files page */
export interface FilesPageUploadState extends CustomerSearchState {
  uploadModal: boolean;
  uploadLabel: string;
  uploading: boolean;
  uploadError: string;
  $refs: AlpineRefs & { filesPageInput?: HTMLInputElement };
  fetchData(): Promise<void>;
}
