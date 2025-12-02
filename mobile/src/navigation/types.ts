import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  MainApp: NavigatorScreenParams<MainTabParamList>;
  RouteDetail: { routeId: string };
  PaymentCheckout: { packageId: string };
  Register: undefined;
  About: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Routes: undefined;
  Tickets: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;
