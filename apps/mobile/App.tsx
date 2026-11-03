import { StyleSheet, Text, View } from "react-native";

import { EXPERIMENT_SCHEMA_VERSION } from "@virtual-chemistry-lab/experiment-schema";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Phase 01 foundation</Text>
      <Text accessibilityRole="header" style={styles.title}>
        Virtual Chemistry Lab
      </Text>
      <Text style={styles.body}>
        The mobile entry point is ready for shared educational content. Simulations are not part of
        this phase.
      </Text>
      <Text style={styles.detail}>Experiment schema {EXPERIMENT_SCHEMA_VERSION}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: "#53616e",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
  container: {
    backgroundColor: "#f5f7f9",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  detail: {
    color: "#126782",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 24,
  },
  eyebrow: {
    color: "#126782",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#17212b",
    fontSize: 36,
    fontWeight: "700",
    marginTop: 8,
  },
});
