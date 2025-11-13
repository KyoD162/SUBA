// Lightweight region/coordinate types to avoid coupling to react-native-maps types
export type Coordinates = { latitude: number; longitude: number }
export type Region = Coordinates & { latitudeDelta: number; longitudeDelta: number }

export interface BusStop {
  id: string
  name: string
  neighborhood: string
  coordinates: Coordinates
}

export const PUERTO_ORDAZ_CENTER: Region = {
  latitude: 8.2902,
  longitude: -62.7365,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

export const PUERTO_ORDAZ_BUS_STOPS: BusStop[] = [
  {
    id: "po-1",
    name: "Terminal Unare",
    neighborhood: "Unare",
    coordinates: { latitude: 8.3005, longitude: -62.7343 },
  },
  {
    id: "po-2",
    name: "Plaza Alta Vista",
    neighborhood: "Alta Vista",
    coordinates: { latitude: 8.2869, longitude: -62.7442 },
  },
  {
    id: "po-3",
    name: "CC Villa Asia",
    neighborhood: "Villa Asia",
    coordinates: { latitude: 8.283, longitude: -62.7301 },
  },
  {
    id: "po-4",
    name: "Terminal San Félix",
    neighborhood: "San Félix",
    coordinates: { latitude: 8.353, longitude: -62.6505 },
  },
  {
    id: "po-5",
    name: "Parque Castillito",
    neighborhood: "Castillito",
    coordinates: { latitude: 8.288, longitude: -62.7195 },
  },
]