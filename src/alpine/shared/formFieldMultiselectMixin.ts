import type { NamedItem, MultiselectState, FormFieldMultiselectConfig } from "@/alpine/types";

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
}

function setByPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  const last = keys.pop()!;
  const parent = keys.reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
  if (parent) (parent as Record<string, unknown>)[last] = value;
}

export function formFieldMultiselectMixin(config: FormFieldMultiselectConfig) {
  return {
    multiselectSearch: "",
    multiselectOpen: false,
    multiselectCreating: false,

    multiselectItems(this: MultiselectState): NamedItem[] {
      return (this[config.itemsKey] as NamedItem[] | undefined) ?? [];
    },

    multiselectSelectedIds(this: MultiselectState): string[] {
      return (getByPath(this as unknown as Record<string, unknown>, config.selectedIdsKey) as string[] | undefined) ?? [];
    },

    multiselectQuery(this: MultiselectState): string {
      return this.multiselectSearch.toLowerCase().trim();
    },

    multiselectFiltered(this: MultiselectState): NamedItem[] {
      const ids = this.multiselectSelectedIds();
      const q = this.multiselectQuery();
      return this.multiselectItems().filter(
        (t) => !ids.includes(t.id) && (!q || t.name.toLowerCase().includes(q)),
      );
    },

    multiselectHasExactMatch(this: MultiselectState): boolean {
      const q = this.multiselectQuery();
      return !!q && this.multiselectItems().some((t) => t.name.toLowerCase() === q);
    },

    multiselectSelected(this: MultiselectState): NamedItem[] {
      const items = this.multiselectItems();
      return this.multiselectSelectedIds()
        .map((id) => items.find((t) => t.id === id))
        .filter((t): t is NamedItem => !!t);
    },

    multiselectSelect(this: MultiselectState, id: string) {
      const ids = this.multiselectSelectedIds();
      if (!ids.includes(id)) ids.push(id);
      this.multiselectReset();
    },

    multiselectRemove(this: MultiselectState, id: string) {
      setByPath(
        this as unknown as Record<string, unknown>,
        config.selectedIdsKey,
        this.multiselectSelectedIds().filter((i) => i !== id),
      );
    },

    multiselectBackspace(this: MultiselectState) {
      const ids = this.multiselectSelectedIds();
      if (!this.multiselectSearch && ids.length) {
        this.multiselectRemove(ids[ids.length - 1]);
      }
    },

    multiselectEnter(this: MultiselectState) {
      const filtered = this.multiselectFiltered();
      if (filtered.length) {
        this.multiselectSelect(filtered[0].id);
      } else if (!this.multiselectHasExactMatch()) {
        this.multiselectCreate();
      }
    },

    async multiselectCreate(this: MultiselectState) {
      const name = this.multiselectSearch.trim();
      if (!config.onCreate || !name || this.multiselectCreating) return;
      this.multiselectCreating = true;
      const item = await config.onCreate(name, this);
      if (item) {
        this.multiselectSelectedIds().push(item.id);
        this.multiselectReset();
      }
      this.multiselectCreating = false;
    },

    multiselectReset(this: MultiselectState) {
      this.multiselectSearch = "";
      this.multiselectOpen = false;
    },
  };
}
