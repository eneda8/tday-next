/**
 * MongoDB Charts embed IDs — single source of truth.
 * Base URL: https://charts.mongodb.com/charts-todai-fevei/embed/charts
 */

export const CHARTS_BASE_URL =
  "https://charts.mongodb.com/charts-todai-fevei/embed/charts";

export interface ChartDef {
  id: string;
  label: string;
  height: number;
  maxDataAge: number;
}

// ─── Today's Charts (/charts) ───────────────────────────────────────

export const TODAY_SUMMARY: ChartDef[] = [
  { id: "dab42b0e-905e-459c-951b-6a8dde5b28ed", label: "Global Average Rating", height: 250, maxDataAge: 10 },
  { id: "9bcf696d-d0ab-4a34-8e56-d5c976347c85", label: "Average for Your Country", height: 250, maxDataAge: 10 },
  { id: "b81d67c6-565d-430f-bb45-991edacab471", label: "Average for Your Gender", height: 250, maxDataAge: 10 },
  { id: "ba242af0-3dd7-4999-9cf2-2ba5ec0a2eff", label: "Average for Your Age Group", height: 250, maxDataAge: 10 },
];

export const TODAY_BREAKDOWNS: ChartDef[] = [
  { id: "24c74dab-b794-4f89-b9aa-23a0564a8aaa", label: "Average Rating by Country", height: 500, maxDataAge: 60 },
  { id: "0ae29aff-b511-4cdf-a83a-1f7fdea5e4af", label: "Average Rating by Region", height: 394, maxDataAge: 10 },
  { id: "3d402d54-0338-46ff-ae2f-400d23fbed7a", label: "Average Rating by Gender", height: 394, maxDataAge: 10 },
  { id: "6cefcd4d-caef-4025-9446-9ddbf2c3a6e9", label: "Average Rating by Age Group", height: 394, maxDataAge: 10 },
];

export const TODAY_SAMPLE_SIZE: ChartDef[] = [
  { id: "b82528a0-adaa-4f23-9621-e572b80c25e4", label: "Sample Size by Country", height: 394, maxDataAge: 60 },
  { id: "073eab0e-24cf-49ad-9ef2-9c9d0022f507", label: "Sample Size by Gender", height: 394, maxDataAge: 60 },
  { id: "86e51a70-5ef7-4cbf-a468-a6099a182d86", label: "Sample Size by Age Group", height: 394, maxDataAge: 60 },
];

// ─── All Charts (/charts/all) ───────────────────────────────────────

export const ALL_SUMMARY: ChartDef[] = [
  { id: "dda07755-dc27-41e9-a57f-cbc6b8178aff", label: "Today's Rating", height: 250, maxDataAge: 60 },
  { id: "747e6d0c-f114-4a1a-8e3b-5d79e9880d79", label: "This Week", height: 250, maxDataAge: 86400 },
  { id: "6aa59531-621f-488f-83d3-631c94646129", label: "This Month", height: 250, maxDataAge: 86400 },
  { id: "91b22579-fc43-4bee-8881-55d5ab2da61b", label: "This Year", height: 250, maxDataAge: 86400 },
  { id: "7faa43e0-08fa-42d9-bbe8-6072122e3d34", label: "All-Time Average", height: 250, maxDataAge: 86400 },
];

export const ALL_OVER_TIME: ChartDef[] = [
  { id: "ef218cef-a54b-4dee-9063-bfdaa383d753", label: "Average Over Week", height: 350, maxDataAge: 60 },
  { id: "4a62cf03-d728-4fb7-85d2-9d477e0f70ed", label: "Average by Day of Week", height: 350, maxDataAge: 86400 },
  { id: "3a13ea75-b655-48bb-8d78-cfdabeec7daf", label: "Average Over Month", height: 350, maxDataAge: 86400 },
  { id: "a066bcfa-1834-4606-b88f-aa26c4635eb5", label: "Average Over Year", height: 350, maxDataAge: 86400 },
];

export const ALL_BREAKDOWNS: ChartDef[] = [
  { id: "24c74dab-b794-4f89-b9aa-23a0564a8aaa", label: "Average Rating by Country", height: 500, maxDataAge: 60 },
  { id: "0ae29aff-b511-4cdf-a83a-1f7fdea5e4af", label: "Average Rating by Region", height: 394, maxDataAge: 60 },
  { id: "3d402d54-0338-46ff-ae2f-400d23fbed7a", label: "Average Rating by Gender", height: 394, maxDataAge: 60 },
  { id: "6cefcd4d-caef-4025-9446-9ddbf2c3a6e9", label: "Average Rating by Age Group", height: 394, maxDataAge: 60 },
];

export const ALL_USER_COUNT: ChartDef[] = [
  { id: "37f61c17-7378-4954-8f82-4c0965d3982b", label: "User Count by Country", height: 394, maxDataAge: 86400 },
  { id: "461c817f-117e-4c3f-bac4-7b7a366a41d1", label: "User Count by Gender", height: 394, maxDataAge: 86400 },
  { id: "d2629454-49e8-443c-9a9a-4a0a29b7e031", label: "User Count by Age Group", height: 394, maxDataAge: 86400 },
];

// ─── My Charts (/charts/me) ────────────────────────────────────────

export const MY_SUMMARY: ChartDef[] = [
  { id: "e822dab6-5603-40f4-b95f-bf677559ee8c", label: "My Day", height: 250, maxDataAge: 60 },
  { id: "590bc492-d062-44a2-8f69-f0916fb6fa4f", label: "My Week", height: 250, maxDataAge: 3600 },
  { id: "671a6f8d-8b73-4d1a-8f69-9c6c5462325c", label: "My Month", height: 250, maxDataAge: 60 },
  { id: "7f4cfe42-ca41-4ad8-9813-49ada3fc61dc", label: "My Year", height: 250, maxDataAge: 60 },
  { id: "32aa6180-f28e-4b46-bc8f-c6bc3b28d570", label: "My All-Time", height: 250, maxDataAge: 60 },
];

export const MY_GRAPHS: ChartDef[] = [
  { id: "3e56620a-ac24-464e-9793-3f5065281e6f", label: "My Week", height: 350, maxDataAge: 3600 },
  { id: "bf813e4f-506b-46e3-a5b6-b2f61d8608da", label: "Avg by Day of Week", height: 350, maxDataAge: 60 },
  { id: "6a242e47-3cd5-4e76-bf01-b84e09f79fc7", label: "My Month", height: 350, maxDataAge: 60 },
  { id: "660cd833-bf1c-443f-9ee2-103ee7d4cb98", label: "My Year", height: 350, maxDataAge: 60 },
];
