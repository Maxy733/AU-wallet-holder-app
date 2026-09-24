import React, { useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, View } from 'react-native';

import { Header, PrimaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function CameraScreen({ onScanned }: { onScanned: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const scanHandled = useRef(false);

  const handleScan = (data: string) => {
    if (scanHandled.current || !data.trim()) return;
    scanHandled.current = true;
    onScanned();
  };

  return (
    <View style={themeStyles.screen}>
      <Header eyebrow="QR SCANNER" title="Camera" />
      <View style={styles.content}>
        {!permission ? (
          <Text style={styles.message}>Checking camera access...</Text>
        ) : !permission.granted ? (
          <View style={styles.permissionPanel}>
            <Text style={styles.title}>Camera access needed</Text>
            <Text style={styles.message}>Allow camera access to scan a QR code.</Text>
            {permission.canAskAgain ? (
              <PrimaryButton label="Allow camera" onPress={() => void requestPermission()} />
            ) : (
              <Text style={styles.message}>Enable camera access for AU Wallet in your device settings.</Text>
            )}
          </View>
        ) : (
          <>
            <View style={styles.preview}>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={({ data }) => handleScan(data)}
              />
              <View pointerEvents="none" style={styles.scanFrame} />
            </View>
            <Text style={styles.message}>Point your camera at a QR code to continue.</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20, justifyContent: 'center', gap: 18 },
  permissionPanel: { gap: 14 },
  preview: { flex: 1, overflow: 'hidden', borderRadius: 20, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 230, height: 230, borderWidth: 3, borderColor: 'white', borderRadius: 22 },
  title: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  message: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
