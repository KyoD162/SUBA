import { StyleSheet } from "react-native"
import { COLORS } from "./colors"
import { SPACING, RADIUS } from "./spacing"
import { scale, verticalScale } from "../utils/responsive"

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  screenPadding: {
    paddingHorizontal: scale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.md),
  },
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: scale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.xl),
    marginVertical: verticalScale(SPACING.md),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  gap: {
    gap: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: verticalScale(SPACING.lg),
  },
})
