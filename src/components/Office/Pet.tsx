import type { PetType } from "../../utils/agentIdentity";

const P = 2; // smaller pixels for pets

function Px({ x, y, color }: { x: number; y: number; color: string }) {
  return <rect x={x * P} y={y * P} width={P} height={P} fill={color} />;
}

interface PetProps {
  type: PetType;
  isAsleep: boolean;
}

export function Pet({ type, isAsleep }: PetProps) {
  const isCat = type.startsWith("cat");
  const isDog = type.startsWith("dog");
  const isFish = type === "fish";
  const isHamster = type === "hamster";

  const bodyColor = type.includes("orange") ? "#e8a050"
    : type.includes("black") ? "#2d2d3d"
    : type.includes("brown") ? "#8b6b4a"
    : type.includes("white") ? "#e8e0d8"
    : "#c8b090";

  const darkColor = type.includes("black") ? "#1a1a2a" : "#7a5a3a";

  if (isFish) {
    return (
      <svg viewBox={`0 0 ${12 * P} ${8 * P}`} width={12 * P} height={8 * P}
        style={{ animation: "pet-swim 3s ease-in-out infinite" }}>
        {/* Fish bowl */}
        <rect x={0} y={0} width={12 * P} height={8 * P} rx={4} fill="#4488aa33" stroke="#4488aa55" strokeWidth="1" />
        {/* Fish body */}
        <Px x={4} y={3} color="#ff6b4a" />
        <Px x={5} y={2} color="#ff6b4a" />
        <Px x={5} y={3} color="#ff8a5a" />
        <Px x={5} y={4} color="#ff6b4a" />
        <Px x={6} y={3} color="#ff8a5a" />
        <Px x={7} y={3} color="#ff6b4a" />
        {/* Tail */}
        <Px x={3} y={2} color="#ff6b4a" />
        <Px x={3} y={4} color="#ff6b4a" />
        {/* Eye */}
        <Px x={7} y={2} color="#111" />
        {/* Bubbles */}
        <Px x={9} y={1} color="#88ccff55" />
        <Px x={8} y={0} color="#88ccff33" />
      </svg>
    );
  }

  if (isHamster) {
    return (
      <svg viewBox={`0 0 ${8 * P} ${7 * P}`} width={8 * P} height={7 * P}
        style={{ animation: isAsleep ? "pet-sleep 3s ease-in-out infinite" : "pet-idle 2s steps(4) infinite" }}>
        {/* Hamster ball body */}
        <Px x={2} y={2} color="#e8b880" />
        <Px x={3} y={1} color="#e8b880" />
        <Px x={4} y={1} color="#e8b880" />
        <Px x={5} y={2} color="#e8b880" />
        <Px x={2} y={3} color="#e8b880" />
        <Px x={3} y={2} color="#f0c890" />
        <Px x={4} y={2} color="#f0c890" />
        <Px x={3} y={3} color="#f0c890" />
        <Px x={4} y={3} color="#f0c890" />
        <Px x={5} y={3} color="#e8b880" />
        <Px x={3} y={4} color="#e8b880" />
        <Px x={4} y={4} color="#e8b880" />
        {/* Ears */}
        <Px x={2} y={0} color="#d8a070" />
        <Px x={5} y={0} color="#d8a070" />
        {/* Eyes */}
        <Px x={3} y={2} color={isAsleep ? "#e8b880" : "#111"} />
        <Px x={5} y={2} color={isAsleep ? "#e8b880" : "#111"} />
        {/* Cheeks */}
        <Px x={2} y={3} color="#ff9999" />
        <Px x={5} y={3} color="#ff9999" />
      </svg>
    );
  }

  // Cat or Dog
  const earH = isCat ? 2 : 1;

  return (
    <svg
      viewBox={`0 0 ${10 * P} ${9 * P}`}
      width={10 * P}
      height={9 * P}
      style={{ animation: isAsleep ? "pet-sleep 4s ease-in-out infinite" : "pet-idle 2.5s steps(4) infinite" }}
    >
      {/* Ears */}
      {isCat ? (
        <>
          <Px x={1} y={0} color={bodyColor} />
          <Px x={2} y={0} color={bodyColor} />
          <Px x={6} y={0} color={bodyColor} />
          <Px x={7} y={0} color={bodyColor} />
        </>
      ) : (
        <>
          <Px x={1} y={1} color={darkColor} />
          <Px x={7} y={1} color={darkColor} />
        </>
      )}

      {/* Head */}
      <Px x={2} y={earH} color={bodyColor} />
      <Px x={3} y={earH} color={bodyColor} />
      <Px x={4} y={earH} color={bodyColor} />
      <Px x={5} y={earH} color={bodyColor} />
      <Px x={6} y={earH} color={bodyColor} />

      {/* Face row */}
      <Px x={1} y={earH + 1} color={bodyColor} />
      <Px x={2} y={earH + 1} color={isAsleep ? bodyColor : "#111"} />
      <Px x={3} y={earH + 1} color={bodyColor} />
      <Px x={4} y={earH + 1} color={isDog ? "#333" : bodyColor} />
      <Px x={5} y={earH + 1} color={bodyColor} />
      <Px x={6} y={earH + 1} color={isAsleep ? bodyColor : "#111"} />
      <Px x={7} y={earH + 1} color={bodyColor} />

      {/* Mouth/nose area */}
      <Px x={2} y={earH + 2} color={bodyColor} />
      <Px x={3} y={earH + 2} color={bodyColor} />
      <Px x={4} y={earH + 2} color={bodyColor} />
      <Px x={5} y={earH + 2} color={bodyColor} />
      <Px x={6} y={earH + 2} color={bodyColor} />

      {/* Body */}
      <Px x={2} y={earH + 3} color={bodyColor} />
      <Px x={3} y={earH + 3} color={bodyColor} />
      <Px x={4} y={earH + 3} color={bodyColor} />
      <Px x={5} y={earH + 3} color={bodyColor} />
      <Px x={6} y={earH + 3} color={bodyColor} />

      {/* Legs */}
      <Px x={2} y={earH + 4} color={bodyColor} />
      <Px x={3} y={earH + 4} color={bodyColor} />
      <Px x={5} y={earH + 4} color={bodyColor} />
      <Px x={6} y={earH + 4} color={bodyColor} />

      {/* Tail */}
      {isCat && (
        <>
          <Px x={8} y={earH + 2} color={bodyColor} />
          <Px x={9} y={earH + 1} color={bodyColor} />
        </>
      )}
      {isDog && (
        <Px x={8} y={earH + 2} color={bodyColor} />
      )}
    </svg>
  );
}
