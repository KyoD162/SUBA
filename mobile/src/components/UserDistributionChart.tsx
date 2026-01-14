import React, { useMemo, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import Svg, { Path, Circle, G } from "react-native-svg"
import { COLORS, SPACING } from "../theme"

type Slice = {
  label: string
  value: number
  color: string
}

interface Props {
  data?: {
    riders?: number
    drivers?: number
    admins?: number
  }
  size?: number
}

type SelectedSlice = Slice & {
  position: {
    x: number
    y: number
  }
}

const UserDistributionChart: React.FC<Props> = ({ data, size = 160 }) => {
  // Convert data prop to slices format
  const chartData: Slice[] = useMemo(() => {
    if (data && (data.riders || data.drivers || data.admins)) {
      return [
        { label: "Pasajeros", value: data.riders || 0, color: COLORS.success },
        { label: "Conductores", value: data.drivers || 0, color: COLORS.primary },
        { label: "Administradores", value: data.admins || 0, color: COLORS.primaryDark },
      ].filter(s => s.value > 0)
    }
    // Default data for demo
    return [
      { label: "Estudiantes", value: 45, color: COLORS.success },
      { label: "Adultos", value: 35, color: COLORS.primary },
      { label: "Discapacidad", value: 10, color: COLORS.primaryDark },
      { label: "Tercera Edad", value: 10, color: "#A9D6E5" },
    ]
  }, [data])

  const total = chartData.reduce((acc, d) => acc + d.value, 0)
  const radius = size / 2
  const [selectedSlice, setSelectedSlice] = useState<SelectedSlice | null>(null)

  const segments = useMemo(() => {
    let cumulativeAngle = 0
    return chartData.map(slice => {
      const sliceAngle = total === 0 ? 0 : (slice.value / total) * 360
      const startAngle = cumulativeAngle
      const endAngle = cumulativeAngle + sliceAngle
      const midAngle = startAngle + sliceAngle / 2
      cumulativeAngle = endAngle
      return {
        slice,
        startAngle,
        endAngle,
        labelPosition: polarToCartesian(radius, radius, radius * 0.6, midAngle),
      }
    })
  }, [chartData, radius, total])

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Distribución de Usuarios</Text>
      <View style={styles.chartRow}>
        <View style={[styles.chartWrapper, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map(({ slice, startAngle, endAngle, labelPosition }, idx) => {
              const path = describeArc(radius, radius, radius, startAngle, endAngle)
              const isSelected = selectedSlice?.label === slice.label
              return (
                <G
                  key={idx}
                  onPressIn={() =>
                    setSelectedSlice({
                      ...slice,
                      position: labelPosition,
                    })
                  }
                >
                  <Path
                    d={path}
                    fill={slice.color}
                    opacity={isSelected ? 1 : 0.85}
                    stroke={isSelected ? COLORS.surface : undefined}
                    strokeWidth={isSelected ? 2 : 0}
                  />
                </G>
              )
            })}
          </Svg>
          {selectedSlice && (
            <View
              style={[
                styles.tooltip,
                {
                  left: selectedSlice.position.x,
                  top: selectedSlice.position.y,
                },
              ]}
            >
              <Text style={styles.tooltipText}>{`${selectedSlice.label}: ${selectedSlice.value}`}</Text>
            </View>
          )}
        </View>
        <View style={styles.legend}>
          {chartData.map((s, i) => (
            <View key={i} style={styles.legendItem}>
              <View style={{ marginRight: 6 }}>
                <Svg width={12} height={12} viewBox="0 0 12 12">
                  <Circle cx={6} cy={6} r={6} fill={s.color} />
                </Svg>
              </View>
              <Text style={styles.legendText}>{`${s.label} ${total > 0 ? Math.round((s.value / total) * 100) : 0}%`}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

function describeArc(x: number, y: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, r, endAngle)
  const end = polarToCartesian(x, y, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  return `M ${x} ${y} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginTop: SPACING.lg,
  },
  title: {
    fontWeight: "600",
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  legend: {
    marginLeft: SPACING.md,
    flex: 1,
    gap: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tooltip: {
    position: "absolute",
    pointerEvents: "none",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    transform: [{ translateX: -40 }, { translateY: -24 }],
    zIndex: 10,
  },
  tooltipText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
})

export default UserDistributionChart
