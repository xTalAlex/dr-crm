/**
 * Aggregated Alpine component types.
 * 
 * This is the main export point. Consumers should import from here:
 * import type { Customer, CustomerFormMixinState } from "@/alpine/types";
 * 
 * Internal organization:
 * - models.ts: Prisma-derived types (Customer, Tag, etc.)
 * - shared.ts: Generic/reusable interfaces (AlpineRefs, Multiselect)
 * - customers.ts: Customer-specific states
 * - files.ts: File management states
 * - tags.ts: Tags management states
 * - users.ts: Users management states
 */

export * from "./models";
export * from "./shared";
export * from "./customers";
export * from "./files";
export * from "./tags";
export * from "./users";
