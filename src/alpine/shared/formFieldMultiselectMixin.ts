export interface FormFieldMultiselectConfig {
  /** Property name on the Alpine component containing all items (each with `id` and `name`) */
  itemsKey: string;
  /** Property path for the selected IDs array, supports dot notation (e.g. "form.tagIds") */
  selectedIdsKey: string;
  /** Optional: async function to create an item from the search text. Receives (name, component). Return the new item or null. */
  onCreate?: (name: string, comp: any) => Promise<any>;
}

function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

function setByPath(obj: any, path: string, value: any) {
  const keys = path.split(".");
  const last = keys.pop()!;
  const parent = keys.reduce((o, k) => o?.[k], obj);
  if (parent) parent[last] = value;
}

export function formFieldMultiselectMixin(config: FormFieldMultiselectConfig) {
  return {
    multiselectSearch: "",
    multiselectOpen: false,
    multiselectCreating: false,

    multiselectItems(this: any): any[] {
      return this[config.itemsKey] ?? [];
    },

    multiselectSelectedIds(this: any): string[] {
      return getByPath(this, config.selectedIdsKey) ?? [];
    },

    multiselectQuery(this: any): string {
      return this.multiselectSearch.toLowerCase().trim();
    },

    multiselectFiltered(this: any) {
      const ids = this.multiselectSelectedIds();
      const q = this.multiselectQuery();
      return this.multiselectItems().filter(
        (t: any) =>
          !ids.includes(t.id) && (!q || t.name.toLowerCase().includes(q)),
      );
    },

    multiselectHasExactMatch(this: any) {
      const q = this.multiselectQuery();
      return !!q && this.multiselectItems().some((t: any) => t.name.toLowerCase() === q);
    },

    multiselectSelected(this: any) {
      const items = this.multiselectItems();
      return this.multiselectSelectedIds()
        .map((id: string) => items.find((t: any) => t.id === id))
        .filter(Boolean);
    },

    multiselectSelect(this: any, id: string) {
      const ids = this.multiselectSelectedIds();
      if (!ids.includes(id)) ids.push(id);
      this.multiselectReset();
    },

    multiselectRemove(this: any, id: string) {
      setByPath(
        this,
        config.selectedIdsKey,
        this.multiselectSelectedIds().filter((i: string) => i !== id),
      );
    },

    multiselectBackspace(this: any) {
      const ids = this.multiselectSelectedIds();
      if (!this.multiselectSearch && ids.length) {
        this.multiselectRemove(ids[ids.length - 1]);
      }
    },

    multiselectEnter(this: any) {
      const filtered = this.multiselectFiltered();
      if (filtered.length) {
        this.multiselectSelect(filtered[0].id);
      } else if (!this.multiselectHasExactMatch()) {
        this.multiselectCreate();
      }
    },

    async multiselectCreate(this: any) {
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

    multiselectReset(this: any) {
      this.multiselectSearch = "";
      this.multiselectOpen = false;
    },
  };
}
