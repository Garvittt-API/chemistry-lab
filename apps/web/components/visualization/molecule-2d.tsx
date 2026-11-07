import type { Molecule, Selection } from "@virtual-chemistry-lab/molecular-visualization";

/** Orthographic accessible fallback: no perspective, WebGL or depth perception required. */
export function Molecule2d({
  molecule,
  selection,
  onSelect,
}: {
  molecule: Molecule;
  selection: Selection;
  onSelect: (selection: Selection) => void;
}) {
  // Choose the two widest axes instead of always using XY: water is authored
  // in XZ and benzene in XY. This is an explicitly labelled orthographic
  // projection; coordinates themselves are never changed.
  const ranges = ([0, 1, 2] as const).map((axis) => {
    const values = molecule.atoms.map((atom) => atom.positionAngstrom[axis]);
    return { axis, range: Math.max(...values) - Math.min(...values) };
  });
  const axes = ranges
    .sort((a, b) => b.range - a.range)
    .slice(0, 2)
    .map((entry) => entry.axis);
  const horizontalAxis = axes[0] ?? 0;
  const verticalAxis = axes[1] ?? 1;
  const extent = Math.max(
    2,
    ...molecule.atoms.flatMap((atom) => [
      Math.abs(atom.positionAngstrom[horizontalAxis]),
      Math.abs(atom.positionAngstrom[verticalAxis]),
    ]),
  );
  const scale = 125 / extent;
  const x = (value: number) => 160 + value * scale;
  const y = (value: number) => 160 - value * scale;
  const projected = (atom: (typeof molecule.atoms)[number]) =>
    [atom.positionAngstrom[horizontalAxis], atom.positionAngstrom[verticalAxis]] as const;
  return (
    <svg
      className="molecule-2d"
      viewBox="0 0 320 320"
      role="group"
      aria-label={`Two-dimensional orthographic projection of ${molecule.name}. Use the atom and bond lists for complete information.`}
    >
      {molecule.bonds.map((bond) => {
        const from = molecule.atoms.find((atom) => atom.id === bond.fromAtomId)!;
        const to = molecule.atoms.find((atom) => atom.id === bond.toAtomId)!;
        const fromProjected = projected(from);
        const toProjected = projected(to);
        return (
          <line
            key={bond.id}
            x1={x(fromProjected[0])}
            y1={y(fromProjected[1])}
            x2={x(toProjected[0])}
            y2={y(toProjected[1])}
            className={
              selection?.kind === "bond" && selection.id === bond.id
                ? "molecule-2d-bond selected"
                : "molecule-2d-bond"
            }
            strokeWidth={bond.order === "single" ? 3 : 6}
          />
        );
      })}
      {molecule.atoms.map((atom) => {
        const position = projected(atom);
        return (
          <g
            key={atom.id}
            role="button"
            tabIndex={0}
            aria-label={`Select ${atom.element} atom ${atom.id}`}
            onClick={() => onSelect({ kind: "atom", id: atom.id })}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect({ kind: "atom", id: atom.id });
              }
            }}
          >
            <circle
              cx={x(position[0])}
              cy={y(position[1])}
              r={atom.element === "H" ? 9 : 13}
              className={`molecule-2d-atom element-${atom.element.toLowerCase()} ${selection?.kind === "atom" && selection.id === atom.id ? "selected" : ""}`}
            />
            <text x={x(position[0])} y={y(position[1]) + 4} textAnchor="middle">
              {atom.element}
            </text>
          </g>
        );
      })}
      <text x={12} y={306} className="molecule-2d-axis-note">
        Projection axes: {["X", "Y", "Z"][horizontalAxis]} / {["X", "Y", "Z"][verticalAxis]}
      </text>
    </svg>
  );
}
