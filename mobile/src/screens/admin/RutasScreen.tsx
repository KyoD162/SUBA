"use client"

import React from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View } from "react-native"
import { COLORS, SPACING, globalStyles } from "../../theme"
import AdminHeader from "../../components/AdminHeader"

const RutasScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={[globalStyles.screenPadding, { paddingBottom: SPACING.md }]}>
        <AdminHeader name="Admin" />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
})

export default RutasScreen
