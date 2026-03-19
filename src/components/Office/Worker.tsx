import type { Mood } from "../../utils/agentIdentity";

interface WorkerProps {
  status: string;
  mood: Mood;
  skinColor: string;
  shirtColor: string;
  hairColor: string;
  pantsColor: string;
}

const P = 3;

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

export function Worker({ status, mood, skinColor, shirtColor, hairColor, pantsColor }: WorkerProps) {
  const isWorking = status === "working";
  const isWaiting = status === "waiting";
  const isIdle = status === "idle";

  const S = skinColor;
  const H = hairColor;
  const C = shirtColor;
  const K = pantsColor;
  const E = "#1a1a2e";
  const W = "#ffffff";
  const D = "#0f0f23";
  const SH = "#8b6b4a";

  // Mood-based colors
  const blushColor = mood === "stressed" ? "#ff4444" : mood === "happy" ? "#ff9999" : "";
  const mouthColor = mood === "stressed" ? "#ff4444" : "#c0392b";
  const sweatColor = "#60a5fa";

  const bodyAnim = isWorking
    ? "worker-typing 1.5s steps(4) infinite"
    : isWaiting
      ? "worker-waiting 4s steps(6) infinite"
      : "worker-idle 3s steps(4) infinite";

  return (
    <svg
      viewBox={`0 0 ${18 * P} ${24 * P}`}
      width={18 * P}
      height={24 * P}
      style={{ animation: bodyAnim, imageRendering: "pixelated" }}
    >
      {/* Hair top */}
      <PxRow y={0} startX={5} colors={[H, H, H, H, H, H]} />
      <PxRow y={1} startX={4} colors={[H, H, H, H, H, H, H, H]} />
      <PxRow y={2} startX={4} colors={[H, S, S, S, S, S, S, H]} />

      {/* Eyes — mood-based */}
      {isIdle ? (
        // Sleeping — closed eyes
        <PxRow y={3} startX={4} colors={[S, S, E, E, S, E, E, S]} />
      ) : mood === "happy" ? (
        // Happy — ^ ^ eyes
        <>
          <PxRow y={3} startX={4} colors={[S, W, E, S, S, W, E, S]} />
          {/* Sparkle near eye */}
          <Px x={13} y={2} color="#fcd34d" />
        </>
      ) : mood === "stressed" ? (
        // Stressed — X X eyes
        <>
          <PxRow y={3} startX={4} colors={[S, E, W, S, S, E, W, S]} />
        </>
      ) : mood === "tired" ? (
        // Tired — half-closed
        <>
          <PxRow y={3} startX={4} colors={[S, S, E, S, S, S, E, S]} />
        </>
      ) : (
        // Focused — normal
        <>
          <PxRow y={3} startX={4} colors={[S, W, E, S, S, W, E, S]} />
        </>
      )}

      {/* Nose + cheeks */}
      <PxRow y={4} startX={4} colors={[
        blushColor || S, S, S, S, S, S, S, blushColor || S
      ]} />

      {/* Mouth — mood-based */}
      {isIdle ? (
        // Drool/open mouth
        <PxRow y={5} startX={4} colors={[S, S, S, D, D, S, S, S]} />
      ) : mood === "happy" ? (
        // Big smile
        <PxRow y={5} startX={4} colors={[S, mouthColor, mouthColor, mouthColor, mouthColor, mouthColor, mouthColor, S]} />
      ) : mood === "stressed" ? (
        // Wavy stressed mouth
        <PxRow y={5} startX={4} colors={[S, S, mouthColor, S, mouthColor, S, mouthColor, S]} />
      ) : mood === "tired" ? (
        // Yawning
        <PxRow y={5} startX={4} colors={[S, S, D, mouthColor, mouthColor, D, S, S]} />
      ) : (
        // Focused — slight line
        <PxRow y={5} startX={4} colors={[S, S, S, mouthColor, mouthColor, S, S, S]} />
      )}

      {/* Chin */}
      <PxRow y={6} startX={5} colors={[S, S, S, S, S, S]} />

      {/* Sweat drop when stressed */}
      {mood === "stressed" && !isIdle && (
        <>
          <Px x={13} y={3} color={sweatColor} />
          <Px x={13} y={4} color={sweatColor} />
        </>
      )}

      {/* Heart when happy and working */}
      {mood === "happy" && isWorking && (
        <>
          <Px x={14} y={0} color="#ff4466" />
          <Px x={16} y={0} color="#ff4466" />
          <PxRow y={1} startX={13} colors={["#ff4466", "#ff4466", "#ff4466", "#ff4466"]} />
          <PxRow y={2} startX={14} colors={["#ff4466", "#ff4466"]} />
        </>
      )}

      {/* Neck */}
      <PxRow y={7} startX={6} colors={[S, S, S, S]} />

      {/* Body */}
      <PxRow y={8} startX={2} colors={[C, C, C, C, C, C, C, C, C, C, C, C]} />
      <PxRow y={9} startX={2} colors={[C, C, C, C, C, C, C, C, C, C, C, C]} />

      {/* Arms */}
      {isWorking ? (
        <>
          <PxRow y={10} startX={1} colors={[S, S, C, C, C, C, C, C, C, C, C, C, S, S]} />
          <PxRow y={11} startX={0} colors={[S, S, C, C, C, C, C, C, C, C, C, C, C, S, S]} />
        </>
      ) : isWaiting ? (
        <>
          <PxRow y={10} startX={2} colors={[S, C, C, C, C, C, C, C, C, C, C, S]} />
          <PxRow y={11} startX={1} colors={[S, S, C, C, C, C, C, C, C, C, C, S, S]} />
        </>
      ) : (
        <>
          <PxRow y={10} startX={3} colors={[C, C, C, C, C, C, C, C, C, C]} />
          <PxRow y={11} startX={2} colors={[S, C, C, C, C, C, C, C, C, C, C, S]} />
        </>
      )}

      {/* Lower body */}
      <PxRow y={12} startX={4} colors={[C, C, C, C, C, C, C, C]} />
      <PxRow y={13} startX={4} colors={[C, C, C, C, C, C, C, C]} />
      <PxRow y={14} startX={4} colors={[D, D, D, D, D, D, D, D]} />

      {/* Pants */}
      <PxRow y={15} startX={4} colors={[K, K, K, "", "", K, K, K]} />
      <PxRow y={16} startX={4} colors={[K, K, K, "", "", K, K, K]} />
      <PxRow y={17} startX={4} colors={[K, K, K, "", "", K, K, K]} />
      <PxRow y={18} startX={4} colors={[K, K, "", "", "", "", K, K]} />

      {/* Shoes */}
      <PxRow y={19} startX={3} colors={[SH, SH, SH, "", "", "", SH, SH, SH]} />
      <PxRow y={20} startX={3} colors={[SH, SH, SH, "", "", "", SH, SH, SH]} />

      {/* Sleeping Z's */}
      {isIdle && (
        <>
          <text x={14 * P} y={2 * P} fontSize="10" fill="#60a5fa" fontFamily="'Press Start 2P'"
            style={{ animation: "float-z 2s steps(4) infinite" }}>Z</text>
          <text x={15 * P} y={0} fontSize="7" fill="#60a5fa" fontFamily="'Press Start 2P'"
            style={{ animation: "float-z-2 2s steps(4) infinite 0.6s" }}>Z</text>
        </>
      )}

      {/* Tired yawn lines */}
      {mood === "tired" && !isIdle && (
        <>
          <Px x={3} y={5} color="#aaa" />
          <Px x={2} y={4} color="#888" />
        </>
      )}
    </svg>
  );
}
