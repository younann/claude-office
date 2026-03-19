// Generate a deterministic "identity" for each agent based on session ID
// This gives each agent a unique color, icon, and codename

const AGENT_ICONS = [
  "\u25C6", // ◆
  "\u25B2", // ▲
  "\u2B22", // ⬢
  "\u25CF", // ●
  "\u2B23", // ⬣
  "\u25A0", // ■
  "\u2726", // ✦
  "\u2605", // ★
];

const AGENT_PREFIXES = [
  "NEXUS",
  "GHOST",
  "CIPHER",
  "PRISM",
  "VECTOR",
  "ONYX",
  "FLUX",
  "HELIX",
  "ZENITH",
  "ECHO",
  "NOVA",
  "PULSE",
  "APEX",
  "RAVEN",
  "CORTEX",
  "SPECTRE",
];

const GRADIENT_PAIRS = [
  ["#00f0ff", "#0066ff"],
  ["#ff3e8a", "#ff7eb3"],
  ["#00ff88", "#00cc66"],
  ["#ffaa00", "#ff6600"],
  ["#aa44ff", "#6600cc"],
  ["#ff4444", "#cc0033"],
  ["#44ffcc", "#00aa88"],
  ["#ff88dd", "#cc44aa"],
  ["#88aaff", "#4466cc"],
  ["#ffcc44", "#ff9900"],
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAgentIdentity(sessionId: string, projectName: string) {
  const hash = hashCode(sessionId);
  const gradientPair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const icon = AGENT_ICONS[hash % AGENT_ICONS.length];
  const prefix = AGENT_PREFIXES[hash % AGENT_PREFIXES.length];
  const suffix = String(hash % 100).padStart(2, "0");

  return {
    codename: `${prefix}-${suffix}`,
    displayName: projectName.toUpperCase(),
    icon,
    gradientFrom: gradientPair[0],
    gradientTo: gradientPair[1],
    accentColor: gradientPair[0],
  };
}
