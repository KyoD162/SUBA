import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { PaperProvider } from "react-native-paper"
import { RootNavigator } from "./src/navigation/RootNavigator"
import { SUBA_THEME } from "./src/theme/paperTheme"

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={SUBA_THEME}>
          <RootNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
