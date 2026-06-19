// CVSS v4.0 metric definitions + vector helpers.
// Option ordering matches FIRST's official calculator (most-severe first), so the
// default selection (first option of every Base metric) yields the canonical
// "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H" = 10.0 vector.
// Actual scoring is delegated to @pandatix/js-cvss (FIRST-conformant).

export type CvssOption = { v: string; label: string };
export type CvssMetric = { key: string; name: string; tip?: string; options: CvssOption[] };
export type CvssSubgroup = { name: string; metrics: CvssMetric[] };
export type CvssGroup = {
  id: "base" | "threat" | "environmental" | "supplemental";
  name: string;
  blurb: string;
  optional: boolean; // optional groups omit "X" (Not Defined) values from the vector
  subgroups: CvssSubgroup[];
};

const ND: CvssOption = { v: "X", label: "Not Defined" };

export const CVSS40_GROUPS: CvssGroup[] = [
  {
    id: "base",
    name: "Base Metrics",
    blurb: "Intrinsic characteristics of the vulnerability, constant over time and environments.",
    optional: false,
    subgroups: [
      {
        name: "Exploitability",
        metrics: [
          {
            key: "AV",
            name: "Attack Vector",
            tip: "Context by which exploitation is possible.",
            options: [
              { v: "N", label: "Network" },
              { v: "A", label: "Adjacent" },
              { v: "L", label: "Local" },
              { v: "P", label: "Physical" },
            ],
          },
          {
            key: "AC",
            name: "Attack Complexity",
            tip: "Conditions beyond the attacker's control that must exist.",
            options: [
              { v: "L", label: "Low" },
              { v: "H", label: "High" },
            ],
          },
          {
            key: "AT",
            name: "Attack Requirements",
            tip: "Prerequisite deployment/execution conditions of the vulnerable system.",
            options: [
              { v: "N", label: "None" },
              { v: "P", label: "Present" },
            ],
          },
          {
            key: "PR",
            name: "Privileges Required",
            tip: "Level of privileges an attacker must possess before exploiting.",
            options: [
              { v: "N", label: "None" },
              { v: "L", label: "Low" },
              { v: "H", label: "High" },
            ],
          },
          {
            key: "UI",
            name: "User Interaction",
            tip: "Whether a human other than the attacker must participate.",
            options: [
              { v: "N", label: "None" },
              { v: "P", label: "Passive" },
              { v: "A", label: "Active" },
            ],
          },
        ],
      },
      {
        name: "Vulnerable System Impact",
        metrics: [
          { key: "VC", name: "Confidentiality", options: [ { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" } ] },
          { key: "VI", name: "Integrity", options: [ { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" } ] },
          { key: "VA", name: "Availability", options: [ { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" } ] },
        ],
      },
      {
        name: "Subsequent System Impact",
        metrics: [
          { key: "SC", name: "Confidentiality", options: [ { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" } ] },
          { key: "SI", name: "Integrity", options: [ { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" } ] },
          { key: "SA", name: "Availability", options: [ { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" } ] },
        ],
      },
    ],
  },
  {
    id: "threat",
    name: "Threat Metrics",
    blurb: "Characteristics that change over time as the threat landscape evolves.",
    optional: true,
    subgroups: [
      {
        name: "Threat",
        metrics: [
          {
            key: "E",
            name: "Exploit Maturity",
            tip: "Likelihood of the vulnerability being attacked.",
            options: [ND, { v: "A", label: "Attacked" }, { v: "P", label: "PoC" }, { v: "U", label: "Unreported" }],
          },
        ],
      },
    ],
  },
  {
    id: "environmental",
    name: "Environmental Metrics",
    blurb: "Modify the Base score to reflect the importance of the asset in your environment.",
    optional: true,
    subgroups: [
      {
        name: "Security Requirements",
        metrics: [
          { key: "CR", name: "Confidentiality Req.", options: [ND, { v: "H", label: "High" }, { v: "M", label: "Medium" }, { v: "L", label: "Low" }] },
          { key: "IR", name: "Integrity Req.", options: [ND, { v: "H", label: "High" }, { v: "M", label: "Medium" }, { v: "L", label: "Low" }] },
          { key: "AR", name: "Availability Req.", options: [ND, { v: "H", label: "High" }, { v: "M", label: "Medium" }, { v: "L", label: "Low" }] },
        ],
      },
      {
        name: "Modified Base — Exploitability",
        metrics: [
          { key: "MAV", name: "Mod. Attack Vector", options: [ND, { v: "N", label: "Network" }, { v: "A", label: "Adjacent" }, { v: "L", label: "Local" }, { v: "P", label: "Physical" }] },
          { key: "MAC", name: "Mod. Attack Complexity", options: [ND, { v: "L", label: "Low" }, { v: "H", label: "High" }] },
          { key: "MAT", name: "Mod. Attack Requirements", options: [ND, { v: "N", label: "None" }, { v: "P", label: "Present" }] },
          { key: "MPR", name: "Mod. Privileges Required", options: [ND, { v: "N", label: "None" }, { v: "L", label: "Low" }, { v: "H", label: "High" }] },
          { key: "MUI", name: "Mod. User Interaction", options: [ND, { v: "N", label: "None" }, { v: "P", label: "Passive" }, { v: "A", label: "Active" }] },
        ],
      },
      {
        name: "Modified Base — Vulnerable System",
        metrics: [
          { key: "MVC", name: "Mod. Confidentiality", options: [ND, { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" }] },
          { key: "MVI", name: "Mod. Integrity", options: [ND, { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" }] },
          { key: "MVA", name: "Mod. Availability", options: [ND, { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" }] },
        ],
      },
      {
        name: "Modified Base — Subsequent System",
        metrics: [
          { key: "MSC", name: "Mod. Confidentiality", options: [ND, { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" }] },
          { key: "MSI", name: "Mod. Integrity", tip: "Safety (S) reflects impact on human life/well-being.", options: [ND, { v: "S", label: "Safety" }, { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" }] },
          { key: "MSA", name: "Mod. Availability", tip: "Safety (S) reflects impact on human life/well-being.", options: [ND, { v: "S", label: "Safety" }, { v: "H", label: "High" }, { v: "L", label: "Low" }, { v: "N", label: "None" }] },
        ],
      },
    ],
  },
  {
    id: "supplemental",
    name: "Supplemental Metrics",
    blurb: "Optional context. These do NOT affect the score — they convey extra response insight.",
    optional: true,
    subgroups: [
      {
        name: "Supplemental",
        metrics: [
          { key: "S", name: "Safety", options: [ND, { v: "N", label: "Negligible" }, { v: "P", label: "Present" }] },
          { key: "AU", name: "Automatable", options: [ND, { v: "N", label: "No" }, { v: "Y", label: "Yes" }] },
          { key: "R", name: "Recovery", options: [ND, { v: "A", label: "Automatic" }, { v: "U", label: "User" }, { v: "I", label: "Irrecoverable" }] },
          { key: "V", name: "Value Density", options: [ND, { v: "D", label: "Diffuse" }, { v: "C", label: "Concentrated" }] },
          { key: "RE", name: "Response Effort", options: [ND, { v: "L", label: "Low" }, { v: "M", label: "Moderate" }, { v: "H", label: "High" }] },
          { key: "U", name: "Provider Urgency", options: [ND, { v: "Clear", label: "Clear" }, { v: "Green", label: "Green" }, { v: "Amber", label: "Amber" }, { v: "Red", label: "Red" }] },
        ],
      },
    ],
  },
];

// Canonical serialization order (per spec).
export const VECTOR_ORDER: string[] = [
  "AV", "AC", "AT", "PR", "UI", "VC", "VI", "VA", "SC", "SI", "SA",
  "E",
  "CR", "IR", "AR",
  "MAV", "MAC", "MAT", "MPR", "MUI", "MVC", "MVI", "MVA", "MSC", "MSI", "MSA",
  "S", "AU", "R", "V", "RE", "U",
];

const BASE_KEYS = new Set(["AV", "AC", "AT", "PR", "UI", "VC", "VI", "VA", "SC", "SI", "SA"]);

// Default selection: first option of every metric (Base => severe, optional => Not Defined).
export function defaultValues(): Record<string, string> {
  const values: Record<string, string> = {};
  for (const group of CVSS40_GROUPS) {
    for (const sub of group.subgroups) {
      for (const m of sub.metrics) {
        values[m.key] = m.options[0].v;
      }
    }
  }
  return values;
}

// Build the canonical vector string. Base metrics are always included; optional
// metrics are emitted only when set to a value other than "X" (Not Defined).
export function buildVector(values: Record<string, string>): string {
  const parts = ["CVSS:4.0"];
  for (const key of VECTOR_ORDER) {
    const v = values[key];
    if (v === undefined) continue;
    if (BASE_KEYS.has(key)) parts.push(`${key}:${v}`);
    else if (v !== "X") parts.push(`${key}:${v}`);
  }
  return parts.join("/");
}

export type SevName = "Critical" | "High" | "Medium" | "Low" | "Info";

// Map FIRST rating -> the app's severity token (NONE shown as the slate "Info" colour).
export function ratingToSev(rating: string): SevName {
  switch (rating) {
    case "CRITICAL": return "Critical";
    case "HIGH": return "High";
    case "MEDIUM": return "Medium";
    case "LOW": return "Low";
    default: return "Info";
  }
}

// Human label for the rating row.
export function ratingLabel(rating: string): string {
  return rating.charAt(0) + rating.slice(1).toLowerCase(); // CRITICAL -> Critical
}
