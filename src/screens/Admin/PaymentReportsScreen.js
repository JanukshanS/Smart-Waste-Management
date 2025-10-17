import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import { adminApi } from '../../api';

const PaymentReportsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPaymentReports();
      if (response.success) {
        setReport(response.data);
      }
    } catch (err) {
      console.error('Error fetching payment reports:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReport();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Payment Reports</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : report ? (
          <>
            {/* Summary */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>💰 Revenue Summary</Text>
                <Text style={styles.bigNumber}>LKR {report.summary?.totalRevenue?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.bigNumberLabel}>Total Revenue</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{report.summary?.paidRequests || 0}</Text>
                    <Text style={styles.summaryLabel}>Paid</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{report.summary?.pendingRequests || 0}</Text>
                    <Text style={styles.summaryLabel}>Pending</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{report.summary?.paymentSuccessRate || 0}%</Text>
                    <Text style={styles.summaryLabel}>Success Rate</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Revenue by Waste Type */}
            {report.revenueByWasteType && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.cardTitle}>📊 Revenue by Waste Type</Text>
                  {Object.entries(report.revenueByWasteType).map(([type, revenue]) => (
                    <View key={type} style={styles.revenueRow}>
                      <Text style={styles.revenueLabel}>{type}</Text>
                      <Text style={styles.revenueValue}>LKR {revenue.toFixed(2)}</Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Outstanding Payments */}
            {report.outstandingPayments && report.outstandingPayments.count > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.cardTitle}>⚠️ Outstanding Payments</Text>
                  <Text style={styles.outstandingAmount}>
                    LKR {report.outstandingPayments.totalAmount?.toFixed(2) || '0.00'}
                  </Text>
                  <Text style={styles.outstandingCount}>
                    {report.outstandingPayments.count} pending payments
                  </Text>
                </Card.Content>
              </Card>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No report data available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  loader: {
    marginTop: SPACING.large * 2,
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
  bigNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  bigNumberLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.medium,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  revenueLabel: {
    fontSize: 16,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  outstandingAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.error,
    textAlign: 'center',
  },
  outstandingCount: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.large * 2,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default PaymentReportsScreen;

