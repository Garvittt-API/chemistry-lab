import type { LessonDiagram } from "@virtual-chemistry-lab/learning-core";

export function DiagramFigure({ diagram }: Readonly<{ diagram: LessonDiagram }>) {
  const titleId = `diag-title-${diagram.id}`;
  const descId = `diag-desc-${diagram.id}`;

  return (
    <figure className="diagram-figure">
      <figcaption>
        <strong>{diagram.title}</strong>
        <p className="card-meta">{diagram.caption}</p>
      </figcaption>

      <svg viewBox="0 0 540 190" role="img" aria-labelledby={`${titleId} ${descId}`}>
        <title id={titleId}>{diagram.title}</title>
        <desc id={descId}>{diagram.textAlternative}</desc>
        <rect
          x="2"
          y="2"
          width="536"
          height="186"
          rx="8"
          fill="var(--color-surface)"
          stroke="var(--color-border)"
        />
        {diagram.kind === "dilution_schematic" ? (
          <g>
            <rect
              x="65"
              y="45"
              width="75"
              height="105"
              rx="6"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
            />
            <rect
              x="68"
              y="85"
              width="69"
              height="62"
              rx="4"
              fill="var(--color-primary)"
              opacity="0.55"
            />
            <text
              x="102"
              y="168"
              textAnchor="middle"
              fontSize="12"
              fill="var(--color-text-primary)"
            >
              Stock c1, V1
            </text>

            <line
              x1="165"
              y1="98"
              x2="255"
              y2="98"
              stroke="var(--color-text-primary)"
              strokeWidth="2"
            />
            <polygon points="255,93 267,98 255,103" fill="var(--color-text-primary)" />
            <text
              x="215"
              y="84"
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-secondary)"
            >
              + pure solvent
            </text>
            <text x="215" y="116" textAnchor="middle" fontSize="11" fill="var(--color-primary)">
              n1 = n2
            </text>

            <rect
              x="295"
              y="32"
              width="110"
              height="118"
              rx="6"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
            />
            <rect
              x="298"
              y="54"
              width="104"
              height="93"
              rx="4"
              fill="var(--color-primary)"
              opacity="0.22"
            />
            <line
              x1="295"
              y1="54"
              x2="405"
              y2="54"
              stroke="var(--color-accent)"
              strokeDasharray="4 3"
              strokeWidth="1.5"
            />
            <text
              x="350"
              y="168"
              textAnchor="middle"
              fontSize="12"
              fill="var(--color-text-primary)"
            >
              Diluted c2 = c1(V1/V2)
            </text>
          </g>
        ) : diagram.kind === "ph_indicator_scale" ? (
          <g>
            {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((ph, idx) => {
              const x = 42 + idx * 54;
              return (
                <g key={ph}>
                  <rect
                    x={x}
                    y="55"
                    width="48"
                    height="44"
                    rx="4"
                    fill="var(--color-primary-soft)"
                    stroke="var(--color-primary)"
                  />
                  <text
                    x={x + 24}
                    y="82"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="var(--color-text-primary)"
                  >
                    pH {ph}
                  </text>
                </g>
              );
            })}
            <text
              x="95"
              y="130"
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-secondary)"
            >
              Acidic ([H+] &gt; [OH-])
            </text>
            <text x="270" y="130" textAnchor="middle" fontSize="11" fill="var(--color-primary)">
              Neutral (25 °C)
            </text>
            <text
              x="445"
              y="130"
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-secondary)"
            >
              Alkaline ([OH-] &gt; [H+])
            </text>
          </g>
        ) : diagram.kind === "galvanic_cell_schematic" ? (
          <g>
            <rect
              x="65"
              y="65"
              width="120"
              height="90"
              rx="4"
              fill="var(--color-surface-subtle)"
              stroke="var(--color-border-strong)"
              strokeWidth="2"
            />
            <rect
              x="355"
              y="65"
              width="120"
              height="90"
              rx="4"
              fill="var(--color-primary-soft)"
              stroke="var(--color-primary)"
              strokeWidth="2"
            />
            <rect x="95" y="42" width="18" height="95" fill="var(--color-text-muted)" />
            <rect x="425" y="42" width="18" height="95" fill="var(--color-accent)" />
            <path
              d="M 104 42 L 104 22 L 434 22 L 434 42"
              fill="none"
              stroke="var(--color-text-primary)"
              strokeWidth="2"
            />
            <path
              d="M 160 85 L 160 52 L 380 52 L 380 85"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="5"
            />
            <text x="270" y="18" textAnchor="middle" fontSize="11" fill="var(--color-text-primary)">
              e- flow (Zn anode -&gt; Cu cathode)
            </text>
            <text x="270" y="68" textAnchor="middle" fontSize="11" fill="var(--color-primary)">
              Salt bridge (ion neutrality)
            </text>
            <text
              x="125"
              y="172"
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-primary)"
            >
              Zn(s) | Zn2+(aq)
            </text>
            <text
              x="415"
              y="172"
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-primary)"
            >
              Cu2+(aq) | Cu(s)
            </text>
          </g>
        ) : diagram.kind === "titration_curve_schematic" ? (
          <g>
            <line
              x1="70"
              y1="25"
              x2="70"
              y2="155"
              stroke="var(--color-text-primary)"
              strokeWidth="2"
            />
            <line
              x1="70"
              y1="155"
              x2="480"
              y2="155"
              stroke="var(--color-text-primary)"
              strokeWidth="2"
            />
            <path
              d="M 75 138 C 180 132, 250 124, 268 110 C 274 95, 276 68, 284 52 C 305 40, 390 36, 465 34"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.8"
            />
            <circle cx="276" cy="84" r="5" fill="var(--color-accent)" />
            <text x="348" y="88" fontSize="11" fill="var(--color-accent)">
              Equivalence point
            </text>
            <text
              x="275"
              y="176"
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-primary)"
            >
              Volume of titrant added (mL)
            </text>
            <text x="36" y="92" textAnchor="middle" fontSize="11" fill="var(--color-text-primary)">
              pH
            </text>
          </g>
        ) : diagram.kind === "reaction_energy_profile" ? (
          <g>
            <line
              x1="65"
              y1="25"
              x2="65"
              y2="158"
              stroke="var(--color-text-primary)"
              strokeWidth="2"
            />
            <line
              x1="65"
              y1="158"
              x2="480"
              y2="158"
              stroke="var(--color-text-primary)"
              strokeWidth="2"
            />
            <path
              d="M 85 112 L 155 112 C 205 112, 225 38, 265 38 C 305 38, 325 132, 375 132 L 455 132"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.8"
            />
            <line
              x1="265"
              y1="38"
              x2="265"
              y2="112"
              stroke="var(--color-accent)"
              strokeDasharray="4 3"
              strokeWidth="1.6"
            />
            <text x="280" y="78" fontSize="11" fill="var(--color-accent)">
              Activation barrier Ea
            </text>
            <text x="115" y="104" fontSize="11" fill="var(--color-text-primary)">
              Reactants
            </text>
            <text x="415" y="124" fontSize="11" fill="var(--color-text-primary)">
              Products
            </text>
          </g>
        ) : (
          <g>
            <text
              x="110"
              y="75"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--color-primary)"
            >
              Linear (180°)
            </text>
            <line
              x1="65"
              y1="105"
              x2="155"
              y2="105"
              stroke="var(--color-text-primary)"
              strokeWidth="2.5"
            />
            <circle cx="65" cy="105" r="8" fill="var(--color-accent)" />
            <circle cx="110" cy="105" r="10" fill="var(--color-primary)" />
            <circle cx="155" cy="105" r="8" fill="var(--color-accent)" />

            <text
              x="275"
              y="75"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--color-primary)"
            >
              Trigonal Planar (120°)
            </text>
            <line
              x1="275"
              y1="112"
              x2="275"
              y2="85"
              stroke="var(--color-text-primary)"
              strokeWidth="2.5"
            />
            <line
              x1="275"
              y1="112"
              x2="248"
              y2="132"
              stroke="var(--color-text-primary)"
              strokeWidth="2.5"
            />
            <line
              x1="275"
              y1="112"
              x2="302"
              y2="132"
              stroke="var(--color-text-primary)"
              strokeWidth="2.5"
            />
            <circle cx="275" cy="112" r="10" fill="var(--color-primary)" />

            <text
              x="435"
              y="75"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--color-primary)"
            >
              Tetrahedral (109.5°)
            </text>
            <line
              x1="435"
              y1="112"
              x2="435"
              y2="85"
              stroke="var(--color-text-primary)"
              strokeWidth="2.5"
            />
            <line
              x1="435"
              y1="112"
              x2="408"
              y2="132"
              stroke="var(--color-text-primary)"
              strokeWidth="2.5"
            />
            <line
              x1="435"
              y1="112"
              x2="462"
              y2="132"
              stroke="var(--color-text-primary)"
              strokeWidth="2.5"
            />
            <line
              x1="435"
              y1="112"
              x2="448"
              y2="122"
              stroke="var(--color-text-secondary)"
              strokeDasharray="3 2"
              strokeWidth="2"
            />
            <circle cx="435" cy="112" r="10" fill="var(--color-primary)" />
          </g>
        )}
      </svg>

      <details>
        <summary className="text-link">Read full accessible text description</summary>
        <p className="card-meta">{diagram.textAlternative}</p>
      </details>
      <p className="card-meta">
        <em>Disclosure:</em> {diagram.disclosureNote}
      </p>
    </figure>
  );
}
