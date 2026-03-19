interface WorkerProps {
  status: string;
  skinColor: string;
  shirtColor: string;
  hairColor: string;
  pantsColor: string;
}

// Pixel art character — each "pixel" is a 3x3 rect for crispness
const P = 3; // pixel size

function Px({ x, y, color }: { x: number; y: number; color: string }) {
  return <rect x={x * P} y={y * P} width={P} height={P} fill={color} />;
}

function PxRow({ y, startX, colors }: { y: number; startX: number; colors: string[] }) {
  return (
    <>
      {colors.map((c, i) => c !== "" && <Px key={i} x={startX + i} y={y} color={c} />)}
    </>
  );
}

export function Worker({ status, skinColor, shirtColor, hairColor, pantsColor }: WorkerProps) {
  const isWorking = status === "working";
  const isWaiting = status === "waiting";
  const isIdle = status === "idle";

  const S = skinColor;
  const H = hairColor;
  const C = shirtColor;
  const K = pantsColor;
  const E = "#1a1a2e"; // eyes
  const W = "#ffffff"; // eye whites
  const M = "#c0392b"; // mouth
  const D = "#0f0f23"; // dark/outline
  const SH = "#8b6b4a"; // shoe

  const bodyAnim = isWorking
    ? "worker-typing 1.5s steps(4) infinite"
    : isWaiting
      ? "worker-waiting 4s steps(6) infinite"
      : "worker-idle 3s steps(4) infinite";

  return (
    <svg
      viewBox={`0 0 ${16 * P} ${22 * P}`}
      width={16 * P}
      height={22 * P}
      style={{ animation: bodyAnim, imageRendering: "pixelated" }}
    >
      {/* Hair top */}
      <PxRow y={0} startX={5} colors={[H, H, H, H, H, H]} />
      <PxRow y={1} startX={4} colors={[H, H, H, H, H, H, H, H]} />

      {/* Head row 1 — hair + forehead */}
      <PxRow y={2} startX={4} colors={[H, S, S, S, S, S, S, H]} />

      {/* Eyes row */}
      {isIdle ? (
        // Closed eyes
        <>
          <PxRow y={3} startX={4} colors={[S, S, E, E, S, E, E, S]} />
        </>
      ) : (
        // Open eyes
        <>
          <PxRow y={3} startX={4} colors={[S, W, E, S, S, W, E, S]} />
        </>
      )}

      {/* Nose + cheeks */}
      <PxRow y={4} startX={4} colors={[S, S, S, S, S, S, S, S]} />

      {/* Mouth */}
      {isWorking ? (
        <PxRow y={5} startX={4} colors={[S, S, M, M, M, M, S, S]} />
      ) : isIdle ? (
        <PxRow y={5} startX={4} colors={[S, S, S, M, M, S, S, S]} />
      ) : (
        <PxRow y={5} startX={4} colors={[S, S, S, M, M, M, S, S]} />
      )}

      {/* Chin */}
      <PxRow y={6} startX={5} colors={[S, S, S, S, S, S]} />

      {/* Neck */}
      <PxRow y={7} startX={6} colors={[S, S, S, S]} />

      {/* Shoulders + shirt */}
      <PxRow y={8} startX={2} colors={[C, C, C, C, C, C, C, C, C, C, C, C]} />
      <PxRow y={9} startX={2} colors={[C, C, C, C, C, C, C, C, C, C, C, C]} />

      {/* Arms + torso */}
      {isWorking ? (
        // Arms forward (typing)
        <>
          <PxRow y={10} startX={1} colors={[S, S, C, C, C, C, C, C, C, C, C, C, S, S]} />
          <PxRow y={11} startX={0} colors={[S, S, C, C, C, C, C, C, C, C, C, C, C, S, S]} />
        </>
      ) : isWaiting ? (
        // Arms on desk
        <>
          <PxRow y={10} startX={2} colors={[S, C, C, C, C, C, C, C, C, C, C, S]} />
          <PxRow y={11} startX={1} colors={[S, S, C, C, C, C, C, C, C, C, C, S, S]} />
        </>
      ) : (
        // Arms down (sleeping)
        <>
          <PxRow y={10} startX={3} colors={[C, C, C, C, C, C, C, C, C, C]} />
          <PxRow y={11} startX={2} colors={[S, C, C, C, C, C, C, C, C, C, C, S]} />
        </>
      )}

      {/* Lower torso */}
      <PxRow y={12} startX={4} colors={[C, C, C, C, C, C, C, C]} />
      <PxRow y={13} startX={4} colors={[C, C, C, C, C, C, C, C]} />

      {/* Belt area */}
      <PxRow y={14} startX={4} colors={[D, D, D, D, D, D, D, D]} />

      {/* Pants */}
      <PxRow y={15} startX={4} colors={[K, K, K, "", "", K, K, K]} />
      <PxRow y={16} startX={4} colors={[K, K, K, "", "", K, K, K]} />
      <PxRow y={17} startX={4} colors={[K, K, K, "", "", K, K, K]} />
      <PxRow y={18} startX={4} colors={[K, K, "", "", "", "", K, K]} />

      {/* Shoes */}
      <PxRow y={19} startX={3} colors={[SH, SH, SH, "", "", "", SH, SH, SH]} />
      <PxRow y={20} startX={3} colors={[SH, SH, SH, "", "", "", SH, SH, SH]} />

      {/* Z's for sleeping */}
      {isIdle && (
        <>
          <text x={13 * P} y={2 * P} fontSize="10" fill="#60a5fa" fontFamily="'Press Start 2P'"
            style={{ animation: "float-z 2s steps(4) infinite" }}>Z</text>
          <text x={14 * P} y={0} fontSize="7" fill="#60a5fa" fontFamily="'Press Start 2P'"
            style={{ animation: "float-z-2 2s steps(4) infinite 0.6s" }}>Z</text>
        </>
      )}
    </svg>
  );
}
