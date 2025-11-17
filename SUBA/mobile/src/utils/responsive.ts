import { Dimensions, PixelRatio } from 'react-native'

const { width, height } = Dimensions.get('window')

// Reference screen sizes (iPhone 11/12/13/14 non-Pro)
const guidelineBaseWidth = 375
const guidelineBaseHeight = 812

export const scale = (size: number) => {
  const scaled = (width / guidelineBaseWidth) * size
  // Round to nearest pixel for crisp rendering
  return Math.round(PixelRatio.roundToNearestPixel(scaled))
}

export const verticalScale = (size: number) => {
  const scaled = (height / guidelineBaseHeight) * size
  return Math.round(PixelRatio.roundToNearestPixel(scaled))
}

// Moderates the scale; factor 0.25 = 25% toward scaled size
export const moderateScale = (size: number, factor = 0.25) => {
  const s = scale(size)
  return Math.round(size + (s - size) * factor)
}

// Font scaling with respect to device width and user font scale
export const responsiveFont = (size: number, factor = 0.3) => {
  const s = scale(size)
  const base = size + (s - size) * factor
  // Respect user font scale
  const fontScale = PixelRatio.getFontScale?.() ?? 1
  return Math.round(base * Math.max(1, fontScale))
}

export const lineHeightFor = (fontSize: number, ratio = 1.25) => {
  const f = responsiveFont(fontSize)
  return Math.round(f * ratio)
}
