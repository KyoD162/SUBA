import { responsiveFont, lineHeightFor } from "../utils/responsive"

export const TYPOGRAPHY = {
  // Base reference sizes; final fontSize/lineHeight are computed responsively below
  sizes: {
    xs: 13,
    sm: 15,
    base: 17,
    lg: 20,
    xl: 22,
    "2xl": 26,
    "3xl": 30,
    "4xl": 34,
  },
  weights: {
    light: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  lineHeights: {
    // Defaults used as multipliers in helpers below
    tight: 1.15,
    normal: 1.25,
    relaxed: 1.35,
  },
} as const

export const TEXT_STYLES = {
  h1: {
    fontSize: responsiveFont(TYPOGRAPHY.sizes["4xl"]),
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: lineHeightFor(TYPOGRAPHY.sizes["4xl"], TYPOGRAPHY.lineHeights.tight),
  },
  h2: {
    fontSize: responsiveFont(TYPOGRAPHY.sizes["3xl"]),
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: lineHeightFor(TYPOGRAPHY.sizes["3xl"], TYPOGRAPHY.lineHeights.tight),
  },
  h3: {
    fontSize: responsiveFont(TYPOGRAPHY.sizes["2xl"]),
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: lineHeightFor(TYPOGRAPHY.sizes["2xl"], TYPOGRAPHY.lineHeights.normal),
  },
  subtitle: {
    fontSize: responsiveFont(TYPOGRAPHY.sizes.lg),
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: lineHeightFor(TYPOGRAPHY.sizes.lg, TYPOGRAPHY.lineHeights.normal),
  },
  body: {
    fontSize: responsiveFont(TYPOGRAPHY.sizes.base),
    fontWeight: TYPOGRAPHY.weights.normal,
    lineHeight: lineHeightFor(TYPOGRAPHY.sizes.base, TYPOGRAPHY.lineHeights.relaxed),
  },
  bodySm: {
    fontSize: responsiveFont(TYPOGRAPHY.sizes.sm),
    fontWeight: TYPOGRAPHY.weights.normal,
    lineHeight: lineHeightFor(TYPOGRAPHY.sizes.sm, TYPOGRAPHY.lineHeights.relaxed),
  },
  caption: {
    fontSize: responsiveFont(TYPOGRAPHY.sizes.xs),
    fontWeight: TYPOGRAPHY.weights.normal,
    lineHeight: lineHeightFor(TYPOGRAPHY.sizes.xs, TYPOGRAPHY.lineHeights.normal),
  },
} as const
