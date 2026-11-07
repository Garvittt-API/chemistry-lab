import { parseMolecule, type BondOrder, type Molecule, type StructureSource } from "./schema.js";

type V3 = readonly [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (v: V3, n: number): V3 => [v[0] * n, v[1] * n, v[2] * n];
const normalize = (v: V3): V3 => scale(v, 1 / Math.hypot(...v));
const atom = (id: string, element: string, positionAngstrom: V3) => ({
  id,
  element,
  positionAngstrom,
  formalCharge: 0,
});
const bond = (id: string, fromAtomId: string, toAtomId: string, order: BondOrder = "single") => ({
  id,
  fromAtomId,
  toAtomId,
  order,
});

const ACCESSED = "2026-11-07";
const PUBCHEM = "https://pubchem.ncbi.nlm.nih.gov/";
const NIST = "https://cccbdb.nist.gov/";

function source(
  kind: StructureSource["kind"],
  citation: string,
  coordinateNote: string,
  references: string[],
  limitations: string[] = [
    "Ball-and-stick atom radii are schematic; interatomic distances, not atom radii, carry the coordinate information.",
    "This static structure does not represent molecular vibrations, conformational ensembles, electron density or quantum-chemical accuracy.",
  ],
): StructureSource {
  return {
    kind,
    citation,
    accessedOn: ACCESSED,
    modelId: kind === "experimental" ? "reference-coordinates" : "idealized-vsepr-construction",
    modelVersion: "1.0.0",
    coordinateNote,
    assumptions: [
      "Coordinates use ångström in a right-handed Cartesian frame; rendering applies only a uniform visual scale.",
      "Connectivity and bond orders are educational neutral-molecule representations, not a valence or reaction model.",
    ],
    limitations,
    referenceUrls: references,
    url: references[0],
  };
}

const nistSource = (citation: string, note: string) =>
  source(
    "experimental",
    citation,
    note,
    [NIST, PUBCHEM],
    [
      "The coordinate set is an equilibrium or reference geometry reconstructed from the cited bond parameters, not a measured time-dependent configuration.",
      "Atom radii are schematic; only coordinate-derived distances and angles should be read quantitatively.",
    ],
  );

const idealSource = (name: string, cid: number) =>
  source(
    "idealized_geometry_model",
    `Connectivity cross-checked against PubChem CID ${cid}; coordinates constructed with the documented idealized VSEPR geometry model (109.47° at tetrahedral centers).`,
    `Idealized educational construction for ${name}, using 1.09 Å C–H, 1.54 Å C–C, 1.43 Å C–O and 0.96 Å O–H model lengths where applicable. These are not optimized or experimental coordinates.`,
    [
      `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
      "https://ncert.nic.in/textbook/pdf/kech104.pdf",
    ],
    [
      "Idealized local geometry and conventional model bond lengths are used; values are not experimental measurements or computational optimization results.",
      "A single arbitrary conformer is shown. Conformational energies, torsional preferences, thermal motion and electron density are not modelled.",
      "Atom radii are schematic in ball-and-stick mode; space-filling radii are conventional visualization radii, not physical boundaries.",
    ],
  );

const tetra: readonly V3[] = (
  [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ] as const
).map((value) => normalize(value));
const waterLength = 0.958;
const waterHalfAngle = (104.5 * Math.PI) / 360;
const ammoniaAngle = (106.7 * Math.PI) / 180;
const ammoniaZ = Math.sqrt((2 * Math.cos(ammoniaAngle) + 1) / 3);
const ammoniaR = Math.sqrt(1 - ammoniaZ * ammoniaZ);

const methanolO = scale(tetra[0]!, 1.43);
const ethanolC2 = scale(tetra[0]!, 1.54);
const ethanolO = add(ethanolC2, scale(tetra[1]!, -1.43));

const records: readonly unknown[] = [
  {
    schemaVersion: "1.0.0",
    id: "water",
    structureVersion: "1.0.0",
    name: "Water",
    formula: "H2O",
    description: "A bent triatomic molecule with two O–H bonds and two lone pairs on oxygen.",
    atoms: [
      atom("o1", "O", [0, 0, 0]),
      atom("h1", "H", [
        -waterLength * Math.sin(waterHalfAngle),
        0,
        waterLength * Math.cos(waterHalfAngle),
      ]),
      atom("h2", "H", [
        waterLength * Math.sin(waterHalfAngle),
        0,
        waterLength * Math.cos(waterHalfAngle),
      ]),
    ],
    bonds: [bond("oh1", "o1", "h1"), bond("oh2", "o1", "h2")],
    geometry: {
      centralAtomId: "o1",
      molecularShape: "bent",
      electronDomainGeometry: "tetrahedral",
      bondingDomains: 2,
      lonePairs: 2,
      idealAngleDegrees: 109.47,
      explanation:
        "Four electron domains give tetrahedral electron-domain geometry; two lone pairs leave a bent atoms-only shape. The 109.47° value is ideal VSEPR, while the coordinate-derived 104.5° H–O–H angle is experimental reference geometry.",
      angleAtomIds: ["h1", "o1", "h2"],
    },
    source: nistSource(
      "NIST CCCBDB, water experimental geometry (r(OH) = 0.958 Å, ∠HOH = 104.5°); connectivity corroborated by PubChem CID 962.",
      "Reference geometry reconstructed from r(OH) = 0.958 Å and ∠HOH = 104.5°; not an idealized 109.5° angle.",
    ),
    reviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: "1.0.0",
    id: "carbon-dioxide",
    structureVersion: "1.0.0",
    name: "Carbon dioxide",
    formula: "CO2",
    description:
      "A linear molecule with two C=O double bonds and no lone pair on the central carbon.",
    atoms: [
      atom("o1", "O", [-1.16, 0, 0]),
      atom("c1", "C", [0, 0, 0]),
      atom("o2", "O", [1.16, 0, 0]),
    ],
    bonds: [bond("co1", "c1", "o1", "double"), bond("co2", "c1", "o2", "double")],
    geometry: {
      centralAtomId: "c1",
      molecularShape: "linear",
      electronDomainGeometry: "linear",
      bondingDomains: 2,
      lonePairs: 0,
      idealAngleDegrees: 180,
      explanation:
        "Two electron domains arrange linearly. Each double bond counts as one VSEPR domain.",
      angleAtomIds: ["o1", "c1", "o2"],
    },
    source: nistSource(
      "NIST CCCBDB, carbon dioxide experimental reference geometry (r(CO) approximately 1.160 Å); PubChem CID 280.",
      "Linear reference geometry with r(C=O) = 1.160 Å and O–C–O = 180°.",
    ),
    reviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: "1.0.0",
    id: "methane",
    structureVersion: "1.0.0",
    name: "Methane",
    formula: "CH4",
    description: "A tetrahedral molecule with four equivalent C–H single bonds.",
    atoms: [
      atom("c1", "C", [0, 0, 0]),
      ...tetra.map((position, i) => atom(`h${i + 1}`, "H", scale(position, 1.09))),
    ],
    bonds: tetra.map((_, i) => bond(`ch${i + 1}`, "c1", `h${i + 1}`)),
    geometry: {
      centralAtomId: "c1",
      molecularShape: "tetrahedral",
      electronDomainGeometry: "tetrahedral",
      bondingDomains: 4,
      lonePairs: 0,
      idealAngleDegrees: 109.47,
      explanation:
        "Four bonding domains and no central lone pairs produce ideal tetrahedral geometry. Coordinates use exactly tetrahedral directions; the 1.09 Å C–H length is a conventional model value.",
      angleAtomIds: ["h1", "c1", "h2"],
    },
    source: idealSource("methane", 297),
    reviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: "1.0.0",
    id: "ammonia",
    structureVersion: "1.0.0",
    name: "Ammonia",
    formula: "NH3",
    description:
      "A trigonal pyramidal molecule with three N–H bonds and one lone pair on nitrogen.",
    atoms: [
      atom("n1", "N", [0, 0, 0]),
      ...[0, 1, 2].map((i) => {
        const phi = (i * 2 * Math.PI) / 3;
        return atom(`h${i + 1}`, "H", [
          1.012 * ammoniaR * Math.cos(phi),
          1.012 * ammoniaR * Math.sin(phi),
          -1.012 * ammoniaZ,
        ]);
      }),
    ],
    bonds: [0, 1, 2].map((i) => bond(`nh${i + 1}`, "n1", `h${i + 1}`)),
    geometry: {
      centralAtomId: "n1",
      molecularShape: "trigonal_pyramidal",
      electronDomainGeometry: "tetrahedral",
      bondingDomains: 3,
      lonePairs: 1,
      idealAngleDegrees: 109.47,
      explanation:
        "Four electron domains give tetrahedral electron-domain geometry; one lone pair leaves a trigonal pyramidal shape. The coordinate-derived 106.7° angle differs from the ideal 109.47° value.",
      angleAtomIds: ["h1", "n1", "h2"],
    },
    source: nistSource(
      "NIST CCCBDB, ammonia experimental reference geometry (r(NH) approximately 1.012 Å, ∠HNH approximately 106.7°); PubChem CID 222.",
      "Three-fold-symmetric reference geometry reconstructed from r(NH) = 1.012 Å and ∠HNH = 106.7°.",
    ),
    reviewStatus: "pending_scientific_review",
  },
  ...[
    {
      id: "oxygen",
      name: "Oxygen",
      formula: "O2",
      element: "O",
      length: 1.2075,
      cid: 977,
      order: "double" as const,
    },
    {
      id: "nitrogen",
      name: "Nitrogen",
      formula: "N2",
      element: "N",
      length: 1.0977,
      cid: 947,
      order: "triple" as const,
    },
    {
      id: "hydrogen",
      name: "Hydrogen",
      formula: "H2",
      element: "H",
      length: 0.7414,
      cid: 783,
      order: "single" as const,
    },
  ].map(({ id, name, formula, element, length, cid, order }) => ({
    schemaVersion: "1.0.0",
    id,
    structureVersion: "1.0.0",
    name,
    formula,
    description: `A homonuclear diatomic molecule with a ${order} bond.`,
    atoms: [atom("a1", element, [-length / 2, 0, 0]), atom("a2", element, [length / 2, 0, 0])],
    bonds: [bond("a1-a2", "a1", "a2", order)],
    geometry: {
      centralAtomId: "a1",
      molecularShape: "diatomic" as const,
      explanation:
        "Every diatomic molecule is linear by definition; there is no bond angle at either atom.",
    },
    source: nistSource(
      `NIST CCCBDB, ${name.toLowerCase()} experimental equilibrium bond length r = ${length} Å; connectivity corroborated by PubChem CID ${cid}.`,
      `Diatomic reference geometry with internuclear distance ${length} Å.`,
    ),
    reviewStatus: "pending_scientific_review" as const,
  })),
  {
    schemaVersion: "1.0.0",
    id: "methanol",
    structureVersion: "1.0.0",
    name: "Methanol",
    formula: "CH4O",
    description: "The simplest alcohol, with a tetrahedral carbon, one C–O bond and one O–H bond.",
    atoms: [
      atom("c1", "C", [0, 0, 0]),
      atom("o1", "O", methanolO),
      ...[1, 2, 3].map((i) => atom(`h${i}`, "H", scale(tetra[i]!, 1.09))),
      atom("ho", "H", add(methanolO, scale(tetra[1]!, -0.96))),
    ],
    bonds: [
      bond("co", "c1", "o1"),
      ...[1, 2, 3].map((i) => bond(`ch${i}`, "c1", `h${i}`)),
      bond("oh", "o1", "ho"),
    ],
    geometry: {
      centralAtomId: "c1",
      molecularShape: "tetrahedral",
      electronDomainGeometry: "tetrahedral",
      bondingDomains: 4,
      lonePairs: 0,
      idealAngleDegrees: 109.47,
      explanation:
        "The carbon has four bonding domains and idealized tetrahedral coordination. Oxygen's bent local geometry is also idealized in this model.",
      angleAtomIds: ["h1", "c1", "o1"],
    },
    source: idealSource("methanol", 887),
    reviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: "1.0.0",
    id: "ethanol",
    structureVersion: "1.0.0",
    name: "Ethanol",
    formula: "C2H6O",
    description:
      "A two-carbon alcohol shown as one arbitrary idealized conformer, not a conformational analysis.",
    atoms: [
      atom("c1", "C", [0, 0, 0]),
      atom("c2", "C", ethanolC2),
      atom("o1", "O", ethanolO),
      ...[1, 2, 3].map((i) => atom(`h1${i}`, "H", scale(tetra[i]!, 1.09))),
      ...[2, 3].map((i) => atom(`h2${i}`, "H", add(ethanolC2, scale(tetra[i]!, -1.09)))),
      atom("ho", "H", add(ethanolO, scale(tetra[0]!, -0.96))),
    ],
    bonds: [
      bond("cc", "c1", "c2"),
      bond("co", "c2", "o1"),
      ...[1, 2, 3].map((i) => bond(`c1h${i}`, "c1", `h1${i}`)),
      ...[2, 3].map((i) => bond(`c2h${i}`, "c2", `h2${i}`)),
      bond("oh", "o1", "ho"),
    ],
    geometry: {
      centralAtomId: "c2",
      molecularShape: "tetrahedral",
      electronDomainGeometry: "tetrahedral",
      bondingDomains: 4,
      lonePairs: 0,
      idealAngleDegrees: 109.47,
      explanation:
        "Both carbon centers use ideal tetrahedral directions. The displayed conformer is illustrative and no relative energy is claimed.",
      angleAtomIds: ["c1", "c2", "o1"],
    },
    source: idealSource("ethanol", 702),
    reviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: "1.0.0",
    id: "benzene",
    structureVersion: "1.0.0",
    name: "Benzene",
    formula: "C6H6",
    description:
      "A planar six-carbon aromatic ring with delocalized aromatic bonds; no alternating single/double bond localization is implied.",
    atoms: [
      ...[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI) / 3;
        return atom(`c${i + 1}`, "C", [1.397 * Math.cos(angle), 1.397 * Math.sin(angle), 0]);
      }),
      ...[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI) / 3;
        return atom(`h${i + 1}`, "H", [2.487 * Math.cos(angle), 2.487 * Math.sin(angle), 0]);
      }),
    ],
    bonds: [
      ...[0, 1, 2, 3, 4, 5].map((i) =>
        bond(`cc${i + 1}`, `c${i + 1}`, `c${((i + 1) % 6) + 1}`, "aromatic"),
      ),
      ...[0, 1, 2, 3, 4, 5].map((i) => bond(`ch${i + 1}`, `c${i + 1}`, `h${i + 1}`)),
    ],
    geometry: {
      centralAtomId: "c1",
      molecularShape: "planar_ring",
      electronDomainGeometry: "trigonal planar at each carbon",
      bondingDomains: 3,
      lonePairs: 0,
      idealAngleDegrees: 120,
      explanation:
        "Each carbon has three electron domains in an ideal trigonal-planar arrangement. Aromatic bonds are rendered as equivalent delocalized connections rather than fixed alternating bond orders.",
      angleAtomIds: ["c2", "c1", "c6"],
    },
    source: source(
      "idealized_geometry_model",
      "Benzene connectivity and aromatic representation cross-checked against PubChem CID 241 and NCERT Class XI Chemical Bonding; regular-hexagon idealized geometry.",
      "Regular planar hexagon with 1.397 Å C–C and 1.09 Å C–H model distances and 120° internal angles; not a claimed optimized structure.",
      [
        "https://pubchem.ncbi.nlm.nih.gov/compound/241",
        "https://ncert.nic.in/textbook/pdf/kech104.pdf",
      ],
    ),
    reviewStatus: "pending_scientific_review",
  },
];

export const MOLECULE_CATALOG: readonly Molecule[] = Object.freeze(
  records.map((record) => Object.freeze(parseMolecule(record))),
);
