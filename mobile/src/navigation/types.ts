import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type DriverTabParamList = {
  Trip: undefined
  DriverProfile: undefined
}

export type AdminTabParamList = {
  Overview: undefined
  Rutas: undefined
  Conductores: undefined
  Usuarios: undefined
  Precios: undefined
  AdminProfile: undefined
}

export type RootStackParamList = {
  Auth: undefined
  MainApp: NavigatorScreenParams<MainTabParamList>
  DriverMain: NavigatorScreenParams<DriverTabParamList>
  AdminMain: NavigatorScreenParams<AdminTabParamList>
  RouteDetail: { routeId: string }
  PaymentCheckout: { packageId: string }
  Register: undefined
  EditProfile: undefined
  About: undefined
}

export type MainTabParamList = {
  Home: undefined;
  Routes: undefined;
  Tickets: undefined;
  Profile: undefined;
};

export type DriverTabScreenProps<T extends keyof DriverTabParamList> = BottomTabScreenProps<DriverTabParamList, T>

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;
