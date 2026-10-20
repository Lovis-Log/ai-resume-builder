export const A4 = {
  widthMm: 210,
  heightMm: 297,
  marginMm: 15,
  widthPt: 595.28,
  heightPt: 841.89,
  marginPt: 42,
} as const;

export const RESUME_FONT = {
  regular: "SourceSans3-Regular",
  semibold: "SourceSans3-SemiBold",
  bold: "SourceSans3-Bold",
} as const;

export const resumeTypography = {
  nameSizePt: 19,
  contactSizePt: 9.5,
  headingSizePt: 10.5,
  bodySizePt: 10,
  metaSizePt: 9.5,
  lineHeight: 1.32,
} as const;

export const resumeColors = {
  text: "#171717",
  muted: "#525252",
  rule: "#d4d4d4",
} as const;
