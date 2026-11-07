/**
 * Reusable 2D SVG equipment renderers.
 *
 * Each component renders the equipment visually. Liquid level is an
 * ILLUSTRATIVE visualization — the actual numeric volume shown in
 * readouts always comes from simulation-core / laboratory-core, never
 * from the SVG geometry. The liquid height is proportional to volume
 * only within a single piece of glassware and is labelled
 * "Illustrative" where relevant.
 */

import type { EquipmentDefinition } from "@virtual-chemistry-lab/laboratory-core";

interface GlasswareLiquidProps {
  /** Current volume in mL */
  volumeMl: number;
  /** Capacity in mL */
  capacityMl: number;
  /** Fill colour (CSS colour), e.g. "#3b82f6" for blue copper sulfate */
  color?: string;
  /** Optional: id for the clip-path so liquid is clipped to the glass outline */
  clipPathId: string;
}

/**
 * Draw graduated tick marks along a vertical glassware body.
 * Coordinates are relative to the glassware's own SVG (not the page).
 */
export function Graduations({
  x,
  yTop,
  yBottom,
  capacityMl,
  graduationMl,
  majorEvery = 5,
}: {
  x: number;
  yTop: number;
  yBottom: number;
  capacityMl: number;
  graduationMl: number;
  majorEvery?: number;
}) {
  const ticks: React.ReactElement[] = [];
  const height = yBottom - yTop;
  const steps = Math.floor(capacityMl / graduationMl);
  for (let i = 0; i <= steps; i++) {
    const v = i * graduationMl;
    const ratio = v / capacityMl;
    // y=0 at top of glass, y=height at bottom; liquid fills from bottom
    const y = yBottom - ratio * height;
    const major = i % majorEvery === 0;
    ticks.push(
      <line
        key={i}
        x1={x}
        x2={x + (major ? 10 : 5)}
        y1={y}
        y2={y}
        stroke="currentColor"
        strokeOpacity={major ? 0.55 : 0.3}
        strokeWidth={major ? 1.2 : 0.8}
        aria-hidden={true}
      />,
    );
    if (major) {
      ticks.push(
        <text
          key={`t${i}`}
          x={x + 14}
          y={y + 3}
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.7}
          aria-hidden={true}
        >
          {Math.round(v)}
        </text>,
      );
    }
  }
  return <g>{ticks}</g>;
}

/** Liquid shape clipped inside a container path */
export function GlasswareLiquid({
  volumeMl,
  capacityMl,
  color = "#60a5fa",
  clipPathId,
}: GlasswareLiquidProps) {
  const fill = Math.max(0, Math.min(1, volumeMl / capacityMl));
  // When fill is 0, render nothing; otherwise draw a rectangle sized to fill.
  if (fill <= 0.001) return null;
  return (
    <g clipPath={`url(#${clipPathId})`}>
      <rect
        x={0}
        y={`${(1 - fill) * 100}%`}
        width="100%"
        height={`${fill * 100}%`}
        fill={color}
        fillOpacity={0.55}
        aria-hidden={true}
        data-volume-illustrative={volumeMl}
      />
      {/* meniscus highlight */}
      <rect
        x={0}
        y={`${(1 - fill) * 100}%`}
        width="100%"
        height={2}
        fill={color}
        fillOpacity={0.8}
        aria-hidden={true}
      />
    </g>
  );
}

/**
 * Generic glass outline container. Takes an SVG path (in 100x100 viewbox
 * coordinates) and uses it as both the outline and clip-path for liquid.
 */
export function GlassContainer({
  def,
  clipPathId,
  outlinePath,
  children,
}: {
  def: EquipmentDefinition;
  clipPathId: string;
  outlinePath: string;
  children?: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      width={def.visualWidth}
      height={def.visualHeight}
      role="img"
      aria-label={def.accessibilityLabel}
      className="lab-equipment-svg"
    >
      <defs>
        <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
          {/* Use bounding-box units so the liquid rect (percent-based) clips correctly */}
          <path d={outlinePath} transform="scale(0.01,-0.01) translate(0,-100)" />
        </clipPath>
      </defs>
      {children}
      {/* Outline drawn AFTER liquid so glass edges show over the fill */}
      <path
        d={outlinePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Path for a simple beaker silhouette, 100x100 viewbox. */
export const BEAKER_PATH =
  "M 15 5 L 15 20 L 10 85 L 10 92 Q 10 95 13 95 L 87 95 Q 90 95 90 92 L 90 85 L 85 20 L 85 5";

/** Path for a measuring cylinder, 100x100. */
export const CYLINDER_PATH =
  "M 30 5 L 30 18 L 22 90 Q 22 95 28 95 L 72 95 Q 78 95 78 90 L 70 18 L 70 5";

/** Path for a conical flask (Erlenmeyer), 100x100. */
export const CONICAL_FLASK_PATH =
  "M 40 5 L 40 30 L 10 90 Q 8 95 13 95 L 87 95 Q 92 95 90 90 L 60 30 L 60 5";

/** pH meter icon representation (stylised bench box + electrode). */
export function PhMeterIcon({ reading, label }: { reading: number | null; label?: string }) {
  const display = reading === null || !Number.isFinite(reading) ? "-.--" : reading.toFixed(2);
  return (
    <div className="lab-ph-meter" role="img" aria-label={label ?? "pH meter"}>
      <div className="lab-ph-meter-display" aria-live="polite">
        <span className="lab-ph-meter-value">{display}</span>
        <span className="lab-ph-meter-unit">pH</span>
      </div>
      <div className="lab-ph-meter-body">
        <div className="lab-ph-meter-electrode" aria-hidden={true} />
      </div>
      <div className="lab-ph-meter-label">{label ?? "pH meter"}</div>
    </div>
  );
}

/**
 * Renders the piece of equipment at its location. This is a lightweight
 * component; it does NOT manage dragging — positioning is handled by the
 * parent LabWorkspace.
 */
export function EquipmentSprite({
  def,
  volumeMl,
  liquidColor,
  phReading,
  selected,
  onClick,
  onKeyDown,
}: {
  def: EquipmentDefinition;
  volumeMl?: number;
  liquidColor?: string;
  phReading?: number | null;
  selected?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const hasLiquid =
    def.supportedOperations.includes("hold_liquid") &&
    def.capacityMl !== undefined &&
    volumeMl !== undefined;

  // Choose a path based on category.
  let path = BEAKER_PATH;
  if (def.category === "measuring_cylinder") path = CYLINDER_PATH;
  else if (def.category === "conical_flask") path = CONICAL_FLASK_PATH;

  const clipId = `clip-${def.id}-${Math.random().toString(36).slice(2, 7)}`;

  if (def.category === "ph_meter") {
    return (
      <div
        className={classNames("lab-equipment", selected && "lab-equipment-selected")}
        onClick={onClick}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-label={def.accessibilityLabel}
      >
        <PhMeterIcon reading={phReading ?? null} />
      </div>
    );
  }

  // Glassware is drawn inline (no GlassContainer component needed; we want
  // the clip path referenced by percentage-based liquid).
  return (
    <div
      className={classNames("lab-equipment", selected && "lab-equipment-selected")}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label={def.accessibilityLabel}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        width={def.visualWidth}
        height={def.visualHeight}
        className="lab-equipment-svg"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>
        {hasLiquid ? (
          <GlasswareLiquid
            volumeMl={volumeMl!}
            capacityMl={def.capacityMl!}
            color={liquidColor ?? "#60a5fa"}
            clipPathId={clipId}
          />
        ) : null}
        {/* Graduations (for cylinders and beakers) */}
        {def.category === "measuring_cylinder" &&
        def.capacityMl !== undefined &&
        def.graduationMl ? (
          <g transform="translate(0,0)">
            <Graduations
              x={72}
              yTop={20}
              yBottom={90}
              capacityMl={def.capacityMl}
              graduationMl={def.graduationMl}
              majorEvery={Math.ceil(def.capacityMl / 10)}
            />
          </g>
        ) : null}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="lab-equipment-label">{def.label}</div>
    </div>
  );
}

function classNames(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(" ");
}
