import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackendApiError, isMockApi, mockWalletApi, OnboardingRequest } from '../api';
import { PrimaryButton, SecondaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function OnboardingStatusScreen({
  request,
  onRequestChange,
  onRefresh,
  onContinue,
  onCorrect,
  onSignOut,
}: {
  request: OnboardingRequest;
  onRequestChange: (request: OnboardingRequest) => void;
  onRefresh: () => Promise<void>;
  onContinue: () => void;
  onCorrect: () => void;
  onSignOut: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await onRefresh();
    } catch (error) {
      setErrorMessage(error instanceof BackendApiError ? error.message : 'Could not refresh onboarding status.');
    } finally {
      setLoading(false);
    }
  };

  const simulate = async (status: 'matched' | 'rejected') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      onRequestChange(await mockWalletApi.simulateStatus(status));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update the mock response.');
    } finally {
      setLoading(false);
    }
  };

  const statusCopy = {
    under_review: {
      icon: '...',
      color: colors.brown,
      background: colors.sand,
      title: 'Waiting for issuer review',
      body: 'Your academic verification request is under review. Your wallet remains pending until the issuer decides.',
    },
    matched: {
      icon: '✓',
      color: colors.green,
      background: '#DDF7E9',
      title: 'Approved — wallet active',
      body: 'The issuer matched and approved your academic record. You can now secure and use your wallet.',
    },
    rejected: {
      icon: '!',
      color: colors.red,
      background: colors.softRed,
      title: 'Information could not be confirmed',
      body: 'We could not confirm the submitted information. Check your details and submit a corrected request.',
    },
  }[request.verificationStatus];

  return (
    <View style={themeStyles.screen}>
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: statusCopy.background }]}><Text style={[styles.iconText, { color: statusCopy.color }]}>{statusCopy.icon}</Text></View>
        <Text style={styles.title}>{statusCopy.title}</Text>
        <Text style={styles.body}>{statusCopy.body}</Text>
        <Text style={styles.submitted}>Submitted {new Date(request.submittedAt).toLocaleString()}</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        {isMockApi && request.verificationStatus === 'under_review' ? (
          <View style={styles.mockPanel}>
            <Text style={styles.mockTitle}>Mock issuer response</Text>
            <Text style={styles.mockBody}>Development controls only. These are replaced by GET /onboarding-verification/requests/me when live.</Text>
            <View style={styles.mockActions}>
              <Pressable style={styles.mockButton} onPress={() => void simulate('matched')} disabled={loading}><Text style={styles.mockApprove}>Simulate matched</Text></Pressable>
              <Pressable style={styles.mockButton} onPress={() => void simulate('rejected')} disabled={loading}><Text style={styles.mockReject}>Simulate rejected</Text></Pressable>
            </View>
          </View>
        ) : null}
      </View>

      <View style={themeStyles.actionStack}>
        {request.verificationStatus === 'under_review' ? <PrimaryButton label={loading ? 'Checking...' : 'Check status'} onPress={() => void refresh()} disabled={loading} /> : null}
        {request.verificationStatus === 'matched' ? <PrimaryButton label="Continue to wallet security" onPress={onContinue} /> : null}
        {request.verificationStatus === 'rejected' ? <PrimaryButton label="Correct and resubmit" onPress={onCorrect} /> : null}
        <SecondaryButton label="Sign out" onPress={onSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', paddingBottom: 130 },
  icon: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 28, fontWeight: '800' },
  title: { marginTop: 22, color: colors.ink, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  body: { marginTop: 11, color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  submitted: { marginTop: 13, color: colors.muted, fontSize: 11.5 },
  error: { marginTop: 14, color: colors.red, fontSize: 12.5, textAlign: 'center' },
  mockPanel: { width: '100%', marginTop: 24, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  mockTitle: { color: colors.ink, fontSize: 12.5, fontWeight: '700' },
  mockBody: { marginTop: 5, color: colors.muted, fontSize: 10.5, lineHeight: 15 },
  mockActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  mockButton: { flex: 1, minHeight: 36, borderRadius: 10, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  mockApprove: { color: colors.green, fontSize: 11.5, fontWeight: '700' },
  mockReject: { color: colors.red, fontSize: 11.5, fontWeight: '700' },
});
