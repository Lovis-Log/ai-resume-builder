import type { CSSProperties, Ref } from "react";

type LumeSkyProps = {
  /** Layout preset: the marketing hero or the sign-in story panel. */
  variant?: "hero" | "login";
  className?: string;
  style?: CSSProperties;
  stageRef?: Ref<HTMLDivElement>;
};

/**
 * The shared animated sky. A stationary photo/scenery layer sits behind four
 * independently drifting cloud sprites. Motion lives entirely in CSS so the
 * component renders on the server; the hero adds pointer parallax in
 * `HeroClouds`.
 */
export function LumeSky({
  variant = "hero",
  className,
  style,
  stageRef,
}: LumeSkyProps) {
  return (
    <div
      ref={stageRef}
      className={["lume-sky", `lume-sky--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-hidden="true"
    >
      <div className="lume-sky__photo" />

      <div className="lume-sky__depth lume-sky__depth--far">
        <span className="lume-sky__cloud lume-sky__cloud--far" />
      </div>
      <div className="lume-sky__depth lume-sky__depth--wisp">
        <span className="lume-sky__cloud lume-sky__cloud--wisp" />
      </div>
      <div className="lume-sky__depth lume-sky__depth--mid">
        <span className="lume-sky__cloud lume-sky__cloud--mid" />
      </div>
      <div className="lume-sky__depth lume-sky__depth--near">
        <span className="lume-sky__cloud lume-sky__cloud--near" />
      </div>

      <div className="lume-sky__shade" />
    </div>
  );
}
