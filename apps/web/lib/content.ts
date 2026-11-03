export type ExperimentDiscipline =
  | "General Chemistry"
  | "Analytical Chemistry"
  | "Organic Chemistry"
  | "Physical Chemistry";

export type ExperimentLevel = "Secondary" | "Upper-secondary" | "Undergraduate";
export type ExperimentDifficulty = "Introductory" | "Intermediate";

export type DemoExperiment = {
  id: string;
  title: string;
  discipline: ExperimentDiscipline;
  level: ExperimentLevel;
  difficulty: ExperimentDifficulty;
  duration: string;
  summary: string;
  objectives: string[];
};

export const demoExperiments: DemoExperiment[] = [
  {
    id: "solution-preparation-metadata",
    title: "Demonstration: solution preparation metadata",
    discipline: "General Chemistry",
    level: "Upper-secondary",
    difficulty: "Introductory",
    duration: "10 min read",
    summary:
      "An interface example showing how learning objectives, safety context and review status will be presented.",
    objectives: [
      "Identify the metadata needed before a learning activity is reviewed.",
      "Distinguish content description from a scientific model.",
    ],
  },
  {
    id: "acid-base-terminology-metadata",
    title: "Demonstration: acid–base terminology",
    discipline: "Analytical Chemistry",
    level: "Undergraduate",
    difficulty: "Intermediate",
    duration: "12 min read",
    summary:
      "A clearly labelled placeholder for a future reviewed learning module about analytical language.",
    objectives: [
      "Preview how theory and equations will be grouped on an experiment page.",
      "Locate the boundary between explanatory content and future simulation controls.",
    ],
  },
  {
    id: "molecular-structure-metadata",
    title: "Demonstration: molecular structure metadata",
    discipline: "Organic Chemistry",
    level: "Secondary",
    difficulty: "Introductory",
    duration: "8 min read",
    summary: "A demonstration record for testing discovery, filtering and detail-page layouts.",
    objectives: [
      "Explore the responsive structure of a future molecular learning experience.",
      "Understand how reviewed references will be surfaced to learners.",
    ],
  },
];

export const subjectCatalog = [
  {
    name: "General Chemistry",
    description: "Foundational language, quantities, matter and laboratory reasoning.",
    accent: "teal",
  },
  {
    name: "Organic Chemistry",
    description: "Carbon-based structures, functional groups and reaction concepts.",
    accent: "ochre",
  },
  {
    name: "Inorganic Chemistry",
    description: "Elements, compounds, coordination and material properties.",
    accent: "blue",
  },
  {
    name: "Physical Chemistry",
    description: "Energy, equilibrium, kinetics and the behavior of chemical systems.",
    accent: "violet",
  },
  {
    name: "Analytical Chemistry",
    description: "Measurement, uncertainty, separation and evidence-based interpretation.",
    accent: "green",
  },
  {
    name: "Environmental Chemistry",
    description: "Chemical processes in air, water, soil and changing environments.",
    accent: "teal",
  },
  {
    name: "Biochemistry",
    description: "Molecules and reactions that support living systems.",
    accent: "rose",
  },
  {
    name: "Industrial Chemistry",
    description: "Process thinking, materials, scale and responsible production.",
    accent: "ochre",
  },
  {
    name: "Materials Chemistry",
    description: "Structure, properties and the design of useful materials.",
    accent: "blue",
  },
  {
    name: "Electrochemistry",
    description: "Charge transfer, cells, interfaces and electrical measurement.",
    accent: "violet",
  },
] as const;

export type Subject = (typeof subjectCatalog)[number];
