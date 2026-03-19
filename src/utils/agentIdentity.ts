// Generate a deterministic "identity" for each agent based on session ID

const AGENT_ICONS = ["\u25C6","\u25B2","\u2B22","\u25CF","\u2B23","\u25A0","\u2726","\u2605"];

const FIRST_NAMES = [
  "Debug Dave", "Fix-it Felix", "Bug Hunter Bob", "Refactor Rick",
  "Deploy Diana", "Commit Carl", "Merge Martha", "Lint Larry",
  "Pixel Pete", "Cache Clara", "Loop Lucy", "Stack Sam",
  "Binary Ben", "Token Tina", "Patch Pat", "Branch Betty",
  "Async Andy", "Query Quinn", "Schema Steve", "Route Rosa",
  "Null Nancy", "Buffer Bill", "Thread Theo", "Parse Penny",
];

const DESK_ITEMS = [
  { emoji: "duck", label: "Rubber Duck" },
  { emoji: "cactus", label: "Desk Cactus" },
  { emoji: "figure", label: "Action Figure" },
  { emoji: "coffee2", label: "Energy Drink" },
  { emoji: "pizza", label: "Cold Pizza" },
  { emoji: "headphones", label: "Headphones" },
  { emoji: "cat-mug", label: "Cat Mug" },
  { emoji: "stress-ball", label: "Stress Ball" },
  { emoji: "bobble", label: "Bobblehead" },
  { emoji: "snack", label: "Snack Pile" },
  { emoji: "photo", label: "Family Photo" },
  { emoji: "plant", label: "Tiny Succulent" },
];

const PET_TYPES = [
  "cat-orange", "cat-black", "cat-white",
  "dog-brown", "dog-white", "dog-black",
  "hamster", "fish",
] as const;

const PLANT_STAGES = ["sprout", "small", "medium", "tall"] as const;

const GRADIENT_PAIRS = [
  ["#00f0ff","#0066ff"],["#ff3e8a","#ff7eb3"],["#00ff88","#00cc66"],
  ["#ffaa00","#ff6600"],["#aa44ff","#6600cc"],["#ff4444","#cc0033"],
  ["#44ffcc","#00aa88"],["#ff88dd","#cc44aa"],["#88aaff","#4466cc"],
  ["#ffcc44","#ff9900"],
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export type PetType = typeof PET_TYPES[number];
export type PlantStage = typeof PLANT_STAGES[number];

export interface AgentIdentity {
  codename: string;
  funnyName: string;
  displayName: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  deskItem: { emoji: string; label: string };
  petType: PetType;
  plantStage: PlantStage;
}

export function getAgentIdentity(sessionId: string, projectName: string): AgentIdentity {
  const hash = hashCode(sessionId);
  const gradientPair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const icon = AGENT_ICONS[hash % AGENT_ICONS.length];
  const funnyName = FIRST_NAMES[hash % FIRST_NAMES.length];
  const suffix = String(hash % 100).padStart(2, "0");

  return {
    codename: `${funnyName.split(" ")[0].toUpperCase()}-${suffix}`,
    funnyName,
    displayName: projectName.toUpperCase(),
    icon,
    gradientFrom: gradientPair[0],
    gradientTo: gradientPair[1],
    accentColor: gradientPair[0],
    deskItem: DESK_ITEMS[(hash >> 4) % DESK_ITEMS.length],
    petType: PET_TYPES[(hash >> 8) % PET_TYPES.length],
    plantStage: PLANT_STAGES[(hash >> 12) % PLANT_STAGES.length],
  };
}

// Mood system based on tool call count
export type Mood = "happy" | "focused" | "tired" | "stressed" | "chill";

export function getAgentMood(toolCalls: number, messageCount: number, status: string): Mood {
  if (status === "idle") return "chill";
  if (toolCalls > 50) return "stressed";
  if (toolCalls > 20) return "tired";
  if (messageCount > 10 && status === "working") return "focused";
  return "happy";
}

// Get time of day for window scene
export type TimeOfDay = "morning" | "afternoon" | "sunset" | "night";

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "sunset";
  return "night";
}
