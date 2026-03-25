/**
 * Core Prisma-derived models and utility types.
 * These are used by all Alpine components and should rarely change.
 */

import type {
  CustomerGetPayload,
  TagGetPayload,
  CustomerTagGetPayload,
  FileGroupGetPayload,
  FileEntryGetPayload,
  MagicLinkGetPayload,
  UserGetPayload,
} from "@/generated/prisma/models";

// --- Utility: converts Date fields to string (JSON serialization) ---

type Serialized<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K] extends Array<infer U>
        ? Serialized<U>[]
        : T[K] extends object | null
          ? Serialized<NonNullable<T[K]>> | Extract<T[K], null>
          : T[K];
};

// --- Prisma types with relations (as returned by the API queries) ---

type PrismaTag = TagGetPayload<true>;
type PrismaCustomerTag = CustomerTagGetPayload<{ include: { tag: true } }>;
type PrismaCustomer = CustomerGetPayload<{ include: { tags: { include: { tag: true } } } }>;
type PrismaFileEntry = FileEntryGetPayload<true>;
type PrismaMagicLink = MagicLinkGetPayload<true>;
type PrismaFileGroup = FileGroupGetPayload<{ include: { files: true; magicLink: true } }>;
type PrismaFileGroupWithCustomer = FileGroupGetPayload<{
  include: {
    files: true;
    magicLink: true;
    customer: { select: { id: true; name: true; surname: true; phone: true } };
  };
}>;
type PrismaUser = UserGetPayload<true>;

// --- Serialized types (Date → string, matching JSON API responses) ---

export type Tag = Serialized<PrismaTag>;

export interface TagWithCount extends Tag {
  _count: { customers: number };
}

export type CustomerTag = Serialized<PrismaCustomerTag>;
export type Customer = Serialized<PrismaCustomer>;
export type CustomerSummary = Pick<Customer, "id" | "name" | "surname" | "phone">;
export type FileEntry = Serialized<PrismaFileEntry>;
export type MagicLink = Serialized<PrismaMagicLink>;
export type FileGroup = Serialized<PrismaFileGroup>;
export type FileGroupWithCustomer = Serialized<PrismaFileGroupWithCustomer>;
export type AppUser = Serialized<PrismaUser>;

// --- Generic named item interface (used by the multiselect mixin) ---

export interface NamedItem {
  id: string;
  name: string;
}
