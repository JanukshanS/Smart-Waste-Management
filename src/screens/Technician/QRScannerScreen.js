import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import QRScanner from '../../components/QRScanner';

const QRScannerScreen = () => {
  const router = useRouter();

  const handleScan = (code) => {
    // You can pass the scanned code back to the calling screen
    // For now, just go back
    console.log('Scanned code:', code);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <QRScanner onScan={handleScan} onCancel={handleCancel} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default QRScannerScreen;

