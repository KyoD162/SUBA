"use client"

import React from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View } from "react-native"
import { COLORS, globalStyles } from "../../theme"
import AdminHeader from "../../components/AdminHeader"

const PreciosScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={globalStyles.screenPadding}>
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

export default PreciosScreen
