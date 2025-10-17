import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { COLORS, SPACING } from "../../constants/theme";
import { technicianApi } from "../../api";

const RegisterDeviceScreen = () => {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [binId, setBinId] = useState("");
  const [loading, setLoading] = useState(false);

  const deviceTypes = [
    { value: "", label: "Select Device Type" },
    { value: "fill-sensor", label: "Fill Level Sensor" },
    { value: "weight-sensor", label: "Weight Sensor" },
    { value: "temperature-sensor", label: "Temperature Sensor" },
    { value: "gps-tracker", label: "GPS Tracker" },
    { value: "iot-module", label: "IoT Communication Module" },
  ];

  const handleSubmit = async () => {
    if (!deviceId.trim()) {
      Alert.alert("Error", "Device ID is required");
      return;
    }

    if (!deviceType) {
      Alert.alert("Error", "Please select a device type");
      return;
    }

    if (!binId.trim()) {
      Alert.alert("Error", "Bin ID is required");
      return;
    }

    try {
      setLoading(true);

      const deviceData = {
        deviceId: deviceId.trim(),
        deviceType,
        binId: binId.trim(),
      };

      const response = await technicianApi.registerDevice(deviceData);

      if (response.success) {
        Alert.alert("Success", "Device registered successfully", [
          {
            text: "Register Another",
            onPress: () => {
              setDeviceId("");
              setDeviceType("");
              setBinId("");
            },
          },
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error registering device:", error);
      Alert.alert("Error", error.message || "Failed to register device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Register Device</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Device ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Device ID *</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={styles.input}
                placeholder="Enter device ID"
                value={deviceId}
                onChangeText={setDeviceId}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push("/technician/qr-scanner")}
              >
                <Text style={styles.scanButtonText}>📷</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              Scan or enter the device's unique identifier
            </Text>
          </View>

          {/* Device Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Device Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={deviceType}
                onValueChange={(itemValue) => setDeviceType(itemValue)}
                style={styles.picker}
              >
                {deviceTypes.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Bin ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bin ID *</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={styles.input}
                placeholder="Enter bin ID"
                value={binId}
                onChangeText={setBinId}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push("/technician/qr-scanner")}
              >
                <Text style={styles.scanButtonText}>📷</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              Scan or enter the bin this device will be attached to
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Register Device</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>📱 Device Registration</Text>
          <Text style={styles.helpText}>
            1. Scan or manually enter the device ID{"\n"}
            2. Select the appropriate device type{"\n"}
            3. Associate the device with a smart bin{"\n"}
            4. Verify all information before submitting
          </Text>
        </View>

        {/* Device Types Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Device Types:</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Fill Sensor:</Text> Measures bin fill
            level{"\n"}• <Text style={styles.bold}>Weight Sensor:</Text>{" "}
            Measures waste weight{"\n"}•{" "}
            <Text style={styles.bold}>Temperature Sensor:</Text> Monitors
            temperature{"\n"}• <Text style={styles.bold}>GPS Tracker:</Text>{" "}
            Tracks bin location{"\n"}•{" "}
            <Text style={styles.bold}>IoT Module:</Text> Enables communication
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  form: {
    padding: SPACING.large,
  },
  inputGroup: {
    marginBottom: SPACING.large,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.small,
  },
  inputWithButton: {
    flexDirection: "row",
    gap: SPACING.small,
  },
  scanButton: {
    backgroundColor: COLORS.secondary,
    width: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scanButtonText: {
    fontSize: 24,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: "center",
    marginTop: SPACING.large,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  helpSection: {
    margin: SPACING.large,
    padding: SPACING.medium,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  infoSection: {
    margin: SPACING.large,
    marginTop: 0,
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "600",
    color: COLORS.text,
  },
});

export default RegisterDeviceScreen;
