export const PUERTO_ORDAZ_CENTER = {
  latitude: 8.2876,
  longitude: -62.7189,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

export const PUERTO_ORDAZ_NEIGHBORHOODS = [
  "Unare",
  "Alta Vista",
  "Villa Asia",
  "San Félix",
  "Castillito",
  "El Roble",
  "Centro",
  "Manoa",
  "Los Olivos",
  "Chirica",
  "Villa Colombia",
]

export const PUERTO_ORDAZ_LANDMARKS = [
  { name: "Parque Cachamay", coordinates: { latitude: 8.3125, longitude: -62.7089 } },
  { name: "Parque La Llovizna", coordinates: { latitude: 8.2654, longitude: -62.6812 } },
  { name: "Represa Macagua", coordinates: { latitude: 8.2243, longitude: -62.6654 } },
  { name: "Puente Angostura", coordinates: { latitude: 8.1243, longitude: -63.5443 } },
  { name: "Orinokia Mall", coordinates: { latitude: 8.2976, longitude: -62.7289 } },
  { name: "CVG", coordinates: { latitude: 8.2876, longitude: -62.7389 } },
]

export interface BusStop {
  id: string
  name: string
  neighborhood: string
  coordinates: {
    latitude: number
    longitude: number
  }
  routes: string[]
}

export const PUERTO_ORDAZ_BUS_STOPS: BusStop[] = [
  {
    id: "stop_1",
    name: "Terminal Unare",
    neighborhood: "Unare",
    coordinates: { latitude: 8.2876, longitude: -62.7189 },
    routes: ["A1", "B5", "C3"],
  },
  {
    id: "stop_2",
    name: "Plaza Alta Vista",
    neighborhood: "Alta Vista",
    coordinates: { latitude: 8.2956, longitude: -62.7289 },
    routes: ["A1", "D2"],
  },
  {
    id: "stop_3",
    name: "Centro Comercial Villa Asia",
    neighborhood: "Villa Asia",
    coordinates: { latitude: 8.3056, longitude: -62.7389 },
    routes: ["B5", "C3"],
  },
  {
    id: "stop_4",
    name: "Terminal San Félix",
    neighborhood: "San Félix",
    coordinates: { latitude: 8.2756, longitude: -62.6989 },
    routes: ["A1", "B5", "D2"],
  },
  {
    id: "stop_5",
    name: "Parque Castillito",
    neighborhood: "Castillito",
    coordinates: { latitude: 8.3156, longitude: -62.7489 },
    routes: ["C3", "D2"],
  },
]
