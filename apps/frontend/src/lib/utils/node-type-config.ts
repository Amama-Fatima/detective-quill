// Visual configuration for each Neo4j entity type in the knowledge graph.

export type EntityType =
  | "PERSON"
  | "ORG"
  | "GPE"
  | "LOC"
  | "FAC"
  | "PRODUCT"
  | "EVENT"
  | "Scene"
  | "Default";

export interface NodeTypeConfig {
  color: string;
  borderColor: string;
  icon?: string; // data URI — black SVG, NVL inverts to white on dark bg
  displayName: string;
  size: number;
  selectedSize: number;
}

// Icons must be black — NVL inverts them to white on dark node backgrounds
// (brightness formula: (299r + 587g + 114b) / 1000 < 128 → invert).
// Every node color below is calibrated to brightness < 128 so inversion always fires.
const RAW_ICONS: Record<string, string> = {
  person: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="4" fill="black"/><path d="M4 20.5c0-3.5 3.6-6.5 8-6.5s8 3 8 6.5" fill="black"/></svg>`,

  org: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="19.5" width="20" height="2" fill="black"/><rect x="4" y="9" width="3" height="10.5" fill="black"/><rect x="10.5" y="9" width="3" height="10.5" fill="black"/><rect x="17" y="9" width="3" height="10.5" fill="black"/><polygon points="2,9.5 12,3 22,9.5" fill="black"/></svg>`,

  gpe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="5.5" y1="6.5" x2="18.5" y2="6.5"/><line x1="5.5" y1="17.5" x2="18.5" y2="17.5"/></svg>`,

  loc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6zM12 10.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="black"/></svg>`,

  fac: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="5" y="8" width="14" height="14" fill="black"/><polygon points="3,8 12,2 21,8" fill="black"/></svg>`,

  product: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.7" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,

  event: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="black"/></svg>`,
};

const toDataUri = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;

export const NODE_TYPE_CONFIGS: Record<EntityType, NodeTypeConfig> = {
  PERSON: {
    color: "#a06830",   // brightness ≈ 114 < 128 → NVL inverts black icon to white
    borderColor: "#704818",
    icon: toDataUri(RAW_ICONS.person),
    displayName: "Person",
    size: 28,
    selectedSize: 36,
  },
  ORG: {
    color: "#4a5a8a",
    borderColor: "#2d3d6a",
    icon: toDataUri(RAW_ICONS.org),
    displayName: "Organisation",
    size: 28,
    selectedSize: 36,
  },
  GPE: {
    color: "#3d6b4a",
    borderColor: "#254d30",
    icon: toDataUri(RAW_ICONS.gpe),
    displayName: "Country / City",
    size: 28,
    selectedSize: 36,
  },
  LOC: {
    color: "#8a6a3a",
    borderColor: "#5c4418",
    icon: toDataUri(RAW_ICONS.loc),
    displayName: "Location",
    size: 28,
    selectedSize: 36,
  },
  FAC: {
    color: "#6b4a8a",
    borderColor: "#4a2d6a",
    icon: toDataUri(RAW_ICONS.fac),
    displayName: "Facility",
    size: 28,
    selectedSize: 36,
  },
  PRODUCT: {
    color: "#2d7a8a",
    borderColor: "#1a5a6a",
    icon: toDataUri(RAW_ICONS.product),
    displayName: "Item / Product",
    size: 28,
    selectedSize: 36,
  },
  EVENT: {
    color: "#8a3a3a",
    borderColor: "#6a1a1a",
    icon: toDataUri(RAW_ICONS.event),
    displayName: "Event",
    size: 28,
    selectedSize: 36,
  },
  Scene: {
    color: "#6b7aaa",
    borderColor: "#4a5a8a",
    displayName: "Scene",
    size: 22,
    selectedSize: 30,
  },
  Default: {
    color: "#5c5d6e",
    borderColor: "#3c3d4e",
    displayName: "Entity",
    size: 26,
    selectedSize: 34,
  },
};

const KNOWN_TYPES = new Set<EntityType>([
  "PERSON",
  "ORG",
  "GPE",
  "LOC",
  "FAC",
  "PRODUCT",
  "EVENT",
  "Scene",
]);

export function getEntityType(
  labels: string[],
  properties: Record<string, unknown>,
): EntityType {
  for (const label of labels) {
    if (KNOWN_TYPES.has(label as EntityType)) return label as EntityType;
  }
  // Fallback: check `type` property (backend sometimes stores it there)
  if (typeof properties.type === "string") {
    const upper = properties.type.toUpperCase();
    const mapped = upper === "ITEM" ? "PRODUCT" : upper;
    if (KNOWN_TYPES.has(mapped as EntityType)) return mapped as EntityType;
  }
  // Scene detection via scene_id property when no typed label was found
  if (properties.scene_id && !properties.name) return "Scene";
  return "Default";
}

export function getNodeVisualConfig(
  labels: string[],
  properties: Record<string, unknown>,
  isSelected: boolean,
): {
  color: string;
  icon?: string;
  size: number;
  borderColor: string;
  borderWidth: number;
  captionAlign: "top" | "bottom" | "center";
  captionSize: number;
} {
  const entityType = getEntityType(labels, properties);
  const cfg = NODE_TYPE_CONFIGS[entityType];
  const isScene = entityType === "Scene";

  return {
    color: cfg.color,
    icon: cfg.icon,
    size: isSelected ? cfg.selectedSize : cfg.size,
    borderColor: isSelected ? "#f5f3ef" : cfg.borderColor,
    borderWidth: isSelected ? 3 : 1.5,
    captionAlign: isScene ? "center" : "bottom",
    captionSize: 10,
  };
}

// Flat color map for components that only need the color (e.g. legend)
export const ENTITY_COLORS: Record<EntityType, string> = Object.fromEntries(
  Object.entries(NODE_TYPE_CONFIGS).map(([k, v]) => [k, v.color]),
) as Record<EntityType, string>;
