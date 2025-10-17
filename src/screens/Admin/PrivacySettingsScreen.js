import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING } from '../../constants/theme';
import { adminApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const PrivacySettingsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminApi.getPrivacySettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Error fetching privacy settings:', err);
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminApi.updatePrivacySettings(settings, user._id);
      if (response.success) {
        Alert.alert('Success', 'Privacy settings updated successfully');
        fetchSettings();
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      Alert.alert('Error', 'Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminApi.exportPrivacyReport();
      if (response.success) {
        Alert.alert('Success', 'Privacy report exported successfully');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to export privacy report');
    }
  };

  const updateSetting = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
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
          <Text style={styles.title}>Privacy Settings</Text>
        </View>

        {/* Data Encryption */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🔒 Data Encryption</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Encryption</Text>
              <Switch
                value={settings?.dataEncryption?.enabled}
                onValueChange={(val) => updateSetting('dataEncryption', 'enabled', val)}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
            <Text style={styles.hint}>
              Algorithm: {settings?.dataEncryption?.algorithm || 'AES-256'}
            </Text>
          </Card.Content>
        </Card>

        {/* Data Retention */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📅 Data Retention</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto-delete Old Data</Text>
              <Switch
                value={settings?.dataRetention?.autoDelete}
                onValueChange={(val) => updateSetting('dataRetention', 'autoDelete', val)}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
            <Text style={styles.inputLabel}>Retention Period (days):</Text>
            <TextInput
              style={styles.input}
              value={settings?.dataRetention?.days?.toString()}
              onChangeText={(val) =>
                updateSetting('dataRetention', 'days', parseInt(val) || 365)
              }
              keyboardType="numeric"
            />
          </Card.Content>
        </Card>

        {/* Anonymization */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🎭 Data Anonymization</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Anonymization</Text>
              <Switch
                value={settings?.anonymization?.enabled}
                onValueChange={(val) => updateSetting('anonymization', 'enabled', val)}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
            <Text style={styles.hint}>{settings?.anonymization?.rules}</Text>
          </Card.Content>
        </Card>

        {/* Audit Logging */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📝 Audit Logging</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Logging</Text>
              <Switch
                value={settings?.auditLogging?.enabled}
                onValueChange={(val) => updateSetting('auditLogging', 'enabled', val)}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
            <Text style={styles.inputLabel}>Logging Level:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings?.auditLogging?.level}
                onValueChange={(val) => updateSetting('auditLogging', 'level', val)}
              >
                <Picker.Item label="Off" value="off" />
                <Picker.Item label="Basic" value="basic" />
                <Picker.Item label="Detailed" value="detailed" />
                <Picker.Item label="Verbose" value="verbose" />
              </Picker>
            </View>
          </Card.Content>
        </Card>

        {/* Compliance */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>⚖️ Compliance</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>GDPR Compliance</Text>
              <Switch
                value={settings?.compliance?.gdpr?.enabled}
                onValueChange={(val) => updateSetting('compliance', 'gdpr', { enabled: val })}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>CCPA Compliance</Text>
              <Switch
                value={settings?.compliance?.ccpa?.enabled}
                onValueChange={(val) => updateSetting('compliance', 'ccpa', { enabled: val })}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.exportButton]}
            onPress={handleExport}
          >
            <Text style={styles.exportButtonText}>Export Privacy Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
    backgroundColor: '#F5F7FA',
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
  hint: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SPACING.small,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
    marginTop: SPACING.small,
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
    marginTop: SPACING.small,
  },
  actions: {
    padding: SPACING.large,
    gap: SPACING.medium,
  },
  button: {
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: COLORS.secondary,
  },
  exportButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
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

export default PrivacySettingsScreen;

