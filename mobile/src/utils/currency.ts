export const EXCHANGE_RATE = 230 // USD to BS rate (example, adjust as needed)

export interface CurrencyAmount {
  usd: number
  bs: number
}

export const formatPuertoOrdazPrice = (usdAmount: number): string => {
  const bsAmount = usdAmount * EXCHANGE_RATE
  return `$${usdAmount.toFixed(2)} USD (≈ BS ${bsAmount.toLocaleString("es-VE")})`
}

export const formatUSD = (amount: number, showSuffix = true): string => {
  return `$${amount.toFixed(2)}${showSuffix ? " USD" : ""}`
}

export const formatBS = (amount: number): string => {
  return `BS ${amount.toLocaleString("es-VE")}`
}

export const convertUSDtoBS = (usdAmount: number): number => {
  return usdAmount * EXCHANGE_RATE
}

export const convertBStoUSD = (bsAmount: number): number => {
  return bsAmount / EXCHANGE_RATE
}
