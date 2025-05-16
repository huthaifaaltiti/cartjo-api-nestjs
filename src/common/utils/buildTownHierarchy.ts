type LocationNode = {
  name: {
    en: string;
    ar: string;
  };
  subLocations: LocationNode[];
};

export const buildTownHierarchy = (rows: any[][]): LocationNode[] => {
  const townsMap = new Map<string, LocationNode>();
  const childToParent = new Map<string, string>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name_en = row[1]?.toString().trim();
    const name_ar = row[2]?.toString().trim();
    const parent_en = row[3]?.toString().trim();

    if (!name_en || !name_ar) continue;

    if (!townsMap.has(name_en)) {
      townsMap.set(name_en, {
        name: { en: name_en, ar: name_ar },
        subLocations: [],
      });
    }

    if (parent_en) {
      childToParent.set(name_en, parent_en);
    }
  }

  for (const [child, parent] of childToParent.entries()) {
    const parentNode = townsMap.get(parent);
    const childNode = townsMap.get(child);

    if (parentNode && childNode) {
      parentNode.subLocations.push(childNode);
    }
  }

  const topLevelLocations: LocationNode[] = [];
  for (const [name_en, node] of townsMap.entries()) {
    if (!childToParent.has(name_en)) {
      topLevelLocations.push(node);
    }
  }

  return topLevelLocations;
};
