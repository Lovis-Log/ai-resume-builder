export function LumeMark({
  className,
  id = "lume",
}: {
  className?: string;
  id?: string;
}) {
  const markGradient = `${id}-mark-gradient`;
  const pageGradient = `${id}-page-gradient`;
  const foldGradient = `${id}-fold-gradient`;
  const shadow = `${id}-mark-shadow`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={markGradient}
          x1="12"
          y1="5"
          x2="58"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#7ed3ff" />
          <stop offset="0.46" stopColor="#4d8bfa" />
          <stop offset="1" stopColor="#a07af7" />
        </linearGradient>
        <linearGradient
          id={pageGradient}
          x1="38"
          y1="10"
          x2="58"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8f0ff" stopOpacity="0.94" />
        </linearGradient>
        <linearGradient
          id={foldGradient}
          x1="52"
          y1="8"
          x2="60"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#d5e6ff" />
          <stop offset="1" stopColor="#8fa9f6" />
        </linearGradient>
        <filter
          id={shadow}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="2.5"
            stdDeviation="3.2"
            floodColor="#4b67d8"
            floodOpacity="0.22"
          />
        </filter>
      </defs>

      <g filter={`url(#${shadow})`}>
        <path
          d="M18 5H36V33A2 2 0 0 0 38 35H50A10 10 0 0 1 60 45V48A10 10 0 0 1 50 58H18A10 10 0 0 1 8 48V15A10 10 0 0 1 18 5Z"
          fill={`url(#${markGradient})`}
        />
        <path
          d="M14.5 15.5A7.5 7.5 0 0 1 22 8"
          stroke="white"
          strokeOpacity="0.58"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M44 10H52.5L60 17.5V37A8 8 0 0 1 52 45H44A8 8 0 0 1 36 37V18A8 8 0 0 1 44 10Z"
          fill={`url(#${pageGradient})`}
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="0.8"
        />
        <path
          d="M52.5 10L60 17.5H54.4A1.9 1.9 0 0 1 52.5 15.6V10Z"
          fill={`url(#${foldGradient})`}
        />
        <path
          d="M44 24H55.5M44 30H55.5M44 36H51"
          stroke="#9bbaf5"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function LumeLogo({
  className,
  markClassName,
  wordmarkClassName,
  tone = "ink",
  id = "lume",
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  tone?: "ink" | "white";
  id?: string;
}) {
  return (
    <span className={["lume-logo", className].filter(Boolean).join(" ")}>
      <LumeMark className={markClassName ?? "lume-mark"} id={id} />
      <span
        className={[
          "lume-wordmark",
          tone === "white" ? "lume-wordmark-white" : "",
          wordmarkClassName ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Lume
      </span>
    </span>
  );
}
