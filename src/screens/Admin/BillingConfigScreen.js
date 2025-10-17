import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING } from '../../constants/theme';
import { adminApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const BillingConfigScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await adminApi.getBillingConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load billing configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminApi.updateBillingConfig(config, user._id);
      if (response.success) {
        Alert.alert('Success', 'Billing configuration updated successfully');
        fetchConfig();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save billing configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateRate = (wasteType, value) => {
    setConfig((prev) => ({
      ...prev,
      wasteTypeRates: {
        ...prev.wasteTypeRates,
        [wasteType]: parseFloat(value) || 0,
      },
    }));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Billing Configuration</Text>
        </View>

        {/* Waste Type Rates */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>💰 Waste Type Rates (LKR)</Text>
            {Object.entries(config?.wasteTypeRates || {}).map(([type, rate]) => (
              <View key={type} style={styles.rateRow}>
                <Text style={styles.rateLabel}>{type}:</Text>
                <TextInput
                  style={styles.rateInput}
                  value={rate.toString()}
                  onChangeText={(val) => updateRate(type, val)}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Tax Configuration */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📊 Tax Configuration</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Taxes</Text>
              <Switch
                value={config?.taxConfiguration?.enabled}
                onValueChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    taxConfiguration: { ...prev.taxConfiguration, enabled: val },
                  }))
                }
                trackColor={{ true: COLORS.primary }}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>VAT Rate (%):</Text>
              <TextInput
                style={styles.input}
                value={(config?.taxConfiguration?.vatRate * 100).toString()}
                onChangeText={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    taxConfiguration: {
                      ...prev.taxConfiguration,
                      vatRate: parseFloat(val) / 100 || 0,
                    },
                  }))
                }
                keyboardType="numeric"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Payment Gateway */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>💳 Payment Gateway</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Gateway</Text>
              <Switch
                value={config?.paymentGateway?.enabled}
                onValueChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    paymentGateway: { ...prev.paymentGateway, enabled: val },
                  }))
                }
                trackColor={{ true: COLORS.primary }}
              />
            </View>
            <Text style={styles.inputLabel}>Provider:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={config?.paymentGateway?.provider}
                onValueChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    paymentGateway: { ...prev.paymentGateway, provider: val },
                  }))
                }
              >
                <Picker.Item label="None" value="none" />
                <Picker.Item label="Stripe" value="stripe" />
                <Picker.Item label="PayPal" value="paypal" />
                <Picker.Item label="PayHere" value="payhere" />
                <Picker.Item label="Manual" value="manual" />
              </Picker>
            </View>
          </Card.Content>
        </Card>

        {/* Billing Rules */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>⚙️ Billing Rules</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Minimum Charge (LKR):</Text>
              <TextInput
                style={styles.input}
                value={config?.minimumCharge?.toString()}
                onChangeText={(val) =>
                  setConfig((prev) => ({ ...prev, minimumCharge: parseFloat(val) || 0 }))
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Maximum Charge (LKR):</Text>
              <TextInput
                style={styles.input}
                value={config?.maximumCharge?.toString()}
                onChangeText={(val) =>
                  setConfig((prev) => ({ ...prev, maximumCharge: parseFloat(val) || 0 }))
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Payment Due Days:</Text>
              <TextInput
                style={styles.input}
                value={config?.paymentDueDays?.toString()}
                onChangeText={(val) =>
                  setConfig((prev) => ({ ...prev, paymentDueDays: parseInt(val) || 7 }))
                }
                keyboardType="numeric"
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  card: {
    margin: SPACING.large,
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  rateLabel: {
    fontSize: 16,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  rateInput: {
    width: 100,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.small,
    fontSize: 16,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  inputRow: {
    marginBottom: SPACING.medium,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.medium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  actions: {
    padding: SPACING.large,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default BillingConfigScreen;

