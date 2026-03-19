import { useMemo } from "react";

interface WorkerProps {
  status: string;
  skinColor: string;
  shirtColor: string;
  hairColor: string;
  hairStyle: "short" | "long" | "spiky" | "bun";
}

export function Worker({
  status,
  skinColor,
  shirtColor,
  hairColor,
  hairStyle,
}: WorkerProps) {
  const isWorking = status === "working";
  const isWaiting = status === "waiting";
  const isIdle = status === "idle";

  const bodyAnimation = isWorking
    ? "worker-typing 1.5s ease-in-out infinite"
    : isWaiting
      ? "worker-waiting 4s ease-in-out infinite"
      : "worker-idle 3s ease-in-out infinite";

  const hair = useMemo(() => {
    switch (hairStyle) {
      case "short":
        return (
          <ellipse cx="20" cy="6" rx="7" ry="5" fill={hairColor} />
        );
      case "long":
        return (
          <>
            <ellipse cx="20" cy="6" rx="7" ry="5" fill={hairColor} />
            <rect x="13" y="6" width="3" height="10" rx="1" fill={hairColor} />
            <rect x="24" y="6" width="3" height="10" rx="1" fill={hairColor} />
          </>
        );
      case "spiky":
        return (
          <>
            <ellipse cx="20" cy="7" rx="7" ry="4" fill={hairColor} />
            <polygon points="15,5 17,0 19,5" fill={hairColor} />
            <polygon points="19,4 21,-1 23,4" fill={hairColor} />
            <polygon points="23,5 25,1 27,6" fill={hairColor} />
          </>
        );
      case "bun":
        return (
          <>
            <ellipse cx="20" cy="7" rx="7" ry="4" fill={hairColor} />
            <circle cx="20" cy="1" r="4" fill={hairColor} />
          </>
        );
    }
  }, [hairStyle, hairColor]);

  return (
    <svg
      viewBox="0 0 40 52"
      width="40"
      height="52"
      style={{ animation: bodyAnimation }}
    >
      {/* Hair (behind head) */}
      {hair}

      {/* Head */}
      <circle cx="20" cy="12" r="7" fill={skinColor} />

      {/* Eyes */}
      {isIdle ? (
        // Closed eyes (sleeping)
        <>
          <line x1="16" y1="12" x2="19" y2="12" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="22" y1="12" x2="25" y2="12" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
        </>
      ) : (
        // Open eyes
        <>
          <circle cx="17" cy="11.5" r="1.2" fill="#333" />
          <circle cx="23" cy="11.5" r="1.2" fill="#333" />
          {/* Eye glint */}
          <circle cx="17.5" cy="11" r="0.4" fill="white" />
          <circle cx="23.5" cy="11" r="0.4" fill="white" />
        </>
      )}

      {/* Mouth */}
      {isWorking ? (
        // Focused / slight smile
        <path d="M18 15 Q20 16.5 22 15" fill="none" stroke="#333" strokeWidth="0.8" />
      ) : isWaiting ? (
        // Neutral
        <line x1="18" y1="15" x2="22" y2="15" stroke="#333" strokeWidth="0.8" strokeLinecap="round" />
      ) : (
        // Sleeping mouth (open slightly)
        <ellipse cx="20" cy="15.5" rx="1.5" ry="1" fill="#444" />
      )}

      {/* Body / shirt */}
      <path
        d="M12 22 Q12 19 20 19 Q28 19 28 22 L28 34 Q28 36 26 36 L14 36 Q12 36 12 34 Z"
        fill={shirtColor}
      />

      {/* Arms */}
      {isWorking ? (
        // Arms forward (typing)
        <g style={{ animation: "hands-typing 0.4s ease-in-out infinite" }}>
          <rect x="6" y="24" width="6" height="4" rx="2" fill={skinColor} />
          <rect x="28" y="24" width="6" height="4" rx="2" fill={skinColor} />
        </g>
      ) : isWaiting ? (
        // Arms on desk / relaxed
        <g style={{ animation: "phone-check 6s ease-in-out infinite" }}>
          <rect x="6" y="26" width="6" height="4" rx="2" fill={skinColor} />
          <rect x="28" y="26" width="6" height="4" rx="2" fill={skinColor} />
        </g>
      ) : (
        // Arms down (sleeping)
        <>
          <rect x="7" y="28" width="5" height="4" rx="2" fill={skinColor} />
          <rect x="28" y="28" width="5" height="4" rx="2" fill={skinColor} />
        </>
      )}

      {/* Legs */}
      <rect x="14" y="36" width="5" height="10" rx="2" fill="#2d3436" />
      <rect x="21" y="36" width="5" height="10" rx="2" fill="#2d3436" />

      {/* Shoes */}
      <rect x="13" y="45" width="7" height="3" rx="1.5" fill="#1a1a2e" />
      <rect x="20" y="45" width="7" height="3" rx="1.5" fill="#1a1a2e" />

      {/* Sleeping Z's */}
      {isIdle && (
        <>
          <text x="28" y="5" fontSize="7" fill="#74b9ff" fontWeight="bold" opacity="0.8"
            style={{ animation: "float-z 2s ease-out infinite" }}>z</text>
          <text x="31" y="0" fontSize="5" fill="#74b9ff" fontWeight="bold" opacity="0.6"
            style={{ animation: "float-z-2 2s ease-out infinite 0.7s" }}>z</text>
        </>
      )}
    </svg>
  );
}
