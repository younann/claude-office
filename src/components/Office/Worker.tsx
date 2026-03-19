interface WorkerProps {
  status: string;
  skinColor: string;
  shirtColor: string;
  hairColor: string;
  hairStyle: "short" | "long" | "spiky" | "bun";
  pantsColor: string;
}

export function Worker({
  status,
  skinColor,
  shirtColor,
  hairColor,
  hairStyle,
  pantsColor,
}: WorkerProps) {
  const isWorking = status === "working";
  const isWaiting = status === "waiting";
  const isIdle = status === "idle";

  // Darker shade for skin shadows
  const skinShadow = adjustColor(skinColor, -25);
  const shirtShadow = adjustColor(shirtColor, -20);

  const bodyAnim = isWorking
    ? "worker-typing 2s ease-in-out infinite"
    : isWaiting
      ? "worker-waiting 5s ease-in-out infinite"
      : "worker-idle 4s ease-in-out infinite";

  return (
    <svg viewBox="0 0 60 90" width="60" height="90" style={{ animation: bodyAnim }}>
      <defs>
        <radialGradient id={`skin-${hairStyle}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor={skinColor} />
          <stop offset="100%" stopColor={skinShadow} />
        </radialGradient>
        <linearGradient id={`shirt-${hairStyle}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shirtColor} />
          <stop offset="100%" stopColor={shirtShadow} />
        </linearGradient>
      </defs>

      {/* === HAIR (back layer) === */}
      {hairStyle === "long" && (
        <>
          <path d={`M20 12 Q16 14 16 28 Q16 32 19 32 L19 18 Q20 12 30 11 Q24 10 20 12`} fill={hairColor} opacity="0.9" />
          <path d={`M40 12 Q44 14 44 28 Q44 32 41 32 L41 18 Q40 12 30 11 Q36 10 40 12`} fill={hairColor} opacity="0.9" />
        </>
      )}

      {/* === HEAD === */}
      <ellipse cx="30" cy="16" rx="12" ry="13" fill={`url(#skin-${hairStyle})`} />

      {/* Ear left */}
      <ellipse cx="18" cy="17" rx="2.5" ry="3.5" fill={skinShadow} />
      <ellipse cx="18.3" cy="17" rx="1.5" ry="2.5" fill={skinColor} />
      {/* Ear right */}
      <ellipse cx="42" cy="17" rx="2.5" ry="3.5" fill={skinShadow} />
      <ellipse cx="41.7" cy="17" rx="1.5" ry="2.5" fill={skinColor} />

      {/* === HAIR (front layer) === */}
      {hairStyle === "short" && (
        <path d={`M18 13 Q18 4 30 3 Q42 4 42 13 Q42 9 36 8 Q30 7.5 24 8 Q18 9 18 13`} fill={hairColor} />
      )}
      {hairStyle === "long" && (
        <path d={`M17 15 Q17 3 30 2 Q43 3 43 15 Q43 8 36 6 Q30 5 24 6 Q17 8 17 15`} fill={hairColor} />
      )}
      {hairStyle === "spiky" && (
        <>
          <path d={`M18 14 Q18 5 30 4 Q42 5 42 14 Q40 8 30 7 Q20 8 18 14`} fill={hairColor} />
          <polygon points="22,6 24,0 26,7" fill={hairColor} />
          <polygon points="28,5 30,-1 32,5" fill={hairColor} />
          <polygon points="34,6 36,1 38,7" fill={hairColor} />
        </>
      )}
      {hairStyle === "bun" && (
        <>
          <path d={`M18 14 Q18 4 30 3 Q42 4 42 14 Q40 8 30 7 Q20 8 18 14`} fill={hairColor} />
          <circle cx="30" cy="1" r="5.5" fill={hairColor} />
          <circle cx="30" cy="1.5" r="4" fill={adjustColor(hairColor, 8)} />
        </>
      )}

      {/* === FACE === */}
      {isIdle ? (
        // Sleeping face
        <>
          {/* Closed eyes — curved lines */}
          <path d="M23 16 Q25 18 27 16" fill="none" stroke="#444" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M33 16 Q35 18 37 16" fill="none" stroke="#444" strokeWidth="1.2" strokeLinecap="round" />
          {/* Slight blush */}
          <circle cx="22" cy="20" r="3" fill="#ff9999" opacity="0.15" />
          <circle cx="38" cy="20" r="3" fill="#ff9999" opacity="0.15" />
          {/* Open mouth breathing */}
          <ellipse cx="30" cy="23" rx="2" ry="1.5" fill="#c0392b" opacity="0.5" />
        </>
      ) : (
        <>
          {/* Eyebrows */}
          <path d={`M22 ${isWorking ? "12" : "12.5"} Q25 ${isWorking ? "10.5" : "11"} 27 ${isWorking ? "12" : "12"}`}
            fill="none" stroke={adjustColor(hairColor, -20)} strokeWidth="1" strokeLinecap="round" />
          <path d={`M33 ${isWorking ? "12" : "12"} Q35 ${isWorking ? "10.5" : "11"} 38 ${isWorking ? "12" : "12.5"}`}
            fill="none" stroke={adjustColor(hairColor, -20)} strokeWidth="1" strokeLinecap="round" />

          {/* Eyes */}
          <g style={isWaiting ? { animation: "look-around 5s ease-in-out infinite" } : undefined}>
            {/* Eye whites */}
            <ellipse cx="25" cy="16" rx="3.2" ry="2.8" fill="white" />
            <ellipse cx="35" cy="16" rx="3.2" ry="2.8" fill="white" />
            {/* Iris */}
            <circle cx={isWorking ? "25.5" : "25"} cy="16.2" r="2" fill="#3d2b1f" />
            <circle cx={isWorking ? "35.5" : "35"} cy="16.2" r="2" fill="#3d2b1f" />
            {/* Pupil */}
            <circle cx={isWorking ? "25.8" : "25"} cy="16" r="1" fill="#111" />
            <circle cx={isWorking ? "35.8" : "35"} cy="16" r="1" fill="#111" />
            {/* Eye glint */}
            <circle cx="24.2" cy="15.2" r="0.6" fill="white" opacity="0.9" />
            <circle cx="34.2" cy="15.2" r="0.6" fill="white" opacity="0.9" />
          </g>

          {/* Nose — subtle */}
          <path d="M29 19 Q30 20.5 31 19" fill="none" stroke={skinShadow} strokeWidth="0.7" />

          {/* Mouth */}
          {isWorking ? (
            // Slight focused smile
            <path d="M26 23 Q30 25.5 34 23" fill="none" stroke="#c0392b" strokeWidth="0.9" opacity="0.6" />
          ) : (
            // Neutral / slight frown
            <path d="M27 23.5 Q30 23 33 23.5" fill="none" stroke="#c0392b" strokeWidth="0.8" opacity="0.5" />
          )}
        </>
      )}

      {/* === NECK === */}
      <rect x="26" y="27" width="8" height="5" rx="2" fill={skinShadow} />

      {/* === BODY / SHIRT === */}
      <path
        d={`M16 35 Q16 30 22 29 L26 29 Q30 31 34 29 L38 29 Q44 30 44 35 L46 55 Q46 57 44 57 L16 57 Q14 57 14 55 Z`}
        fill={`url(#shirt-${hairStyle})`}
      />
      {/* Collar */}
      <path d="M26 29 L30 34 L34 29" fill="none" stroke={shirtShadow} strokeWidth="1" />
      {/* Shirt fold lines */}
      <line x1="25" y1="40" x2="26" y2="50" stroke={shirtShadow} strokeWidth="0.5" opacity="0.4" />
      <line x1="35" y1="40" x2="34" y2="50" stroke={shirtShadow} strokeWidth="0.5" opacity="0.4" />

      {/* === ARMS === */}
      {isWorking ? (
        <g style={{ animation: "hands-typing 0.5s ease-in-out infinite" }}>
          {/* Left arm extended forward */}
          <path d="M16 35 Q10 38 8 42 Q6 46 10 47" fill={shirtColor} stroke={shirtShadow} strokeWidth="0.5" />
          <circle cx="10" cy="47" r="3" fill={skinColor} />
          {/* Right arm extended forward */}
          <path d="M44 35 Q50 38 52 42 Q54 46 50 47" fill={shirtColor} stroke={shirtShadow} strokeWidth="0.5" />
          <circle cx="50" cy="47" r="3" fill={skinColor} />
        </g>
      ) : isWaiting ? (
        <g style={{ animation: "phone-check 8s ease-in-out infinite" }}>
          {/* Left arm on desk */}
          <path d="M16 35 Q10 40 9 46 Q8 50 12 50" fill={shirtColor} stroke={shirtShadow} strokeWidth="0.5" />
          <circle cx="12" cy="50" r="3" fill={skinColor} />
          {/* Right arm holding chin */}
          <path d="M44 35 Q48 38 46 44 Q44 48 40 46" fill={shirtColor} stroke={shirtShadow} strokeWidth="0.5" />
          <circle cx="40" cy="46" r="3" fill={skinColor} />
        </g>
      ) : (
        // Sleeping — arms slumped on desk
        <>
          <path d="M16 35 Q8 42 10 50 Q11 54 15 52" fill={shirtColor} stroke={shirtShadow} strokeWidth="0.5" />
          <circle cx="14" cy="52" r="3" fill={skinColor} />
          <path d="M44 35 Q52 42 50 50 Q49 54 45 52" fill={shirtColor} stroke={shirtShadow} strokeWidth="0.5" />
          <circle cx="46" cy="52" r="3" fill={skinColor} />
        </>
      )}

      {/* === LEGS (seated) === */}
      <path d={`M18 57 Q18 62 16 70 Q15 74 18 74 L22 74 Q24 74 24 72 Q24 64 24 57`} fill={pantsColor} />
      <path d={`M36 57 Q36 62 38 70 Q39 74 42 74 L38 74 Q36 74 36 72 Q36 64 36 57`} fill={pantsColor} />

      {/* Shoes */}
      <path d="M15 73 Q14 76 16 77 L22 77 Q25 77 25 75 Q25 73 22 73 Z" fill="#1a1a2e" />
      <path d="M35 73 Q34 76 36 77 L42 77 Q45 77 45 75 Q45 73 42 73 Z" fill="#1a1a2e" />

      {/* === SLEEPING Z's === */}
      {isIdle && (
        <>
          <text x="44" y="8" fontSize="9" fill="#74b9ff" fontWeight="bold" fontFamily="serif"
            style={{ animation: "float-z 2.5s ease-out infinite" }}>z</text>
          <text x="49" y="2" fontSize="7" fill="#74b9ff" fontWeight="bold" fontFamily="serif"
            style={{ animation: "float-z-2 2.5s ease-out infinite 0.8s" }}>z</text>
          <text x="53" y="-3" fontSize="5" fill="#74b9ff" fontWeight="bold" fontFamily="serif"
            style={{ animation: "float-z 2.5s ease-out infinite 1.5s" }}>z</text>
        </>
      )}
    </svg>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
