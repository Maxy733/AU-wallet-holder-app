import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  backendErrorMessage,
  HolderAccount,
  isMockApi,
  mockWalletApi,
  OnboardingRequest,
} from '../api';
import { PrimaryButton, SecondaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function OnboardingStatusScreen({
  request,
  holderAccount,
  onRequestChange,
  onRefresh,
  onContinue,
  onCorrect,
  onBackToWallet,
}: {
  request: OnboardingRequest;
  holderAccount: HolderAccount | null;
  onRequestChange: (request: OnboardingRequest) => void;
  onRefresh: () => Promise<void>;
  onContinue: () => void;
  onCorrect: () => void;
  onBackToWallet: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await onRefresh();
    } catch (error) {
      setErrorMessage(backendErrorMessage(error, 'Could not refresh onboarding status.'));
    } finally {
      setLoading(false);
    }
  };

  const simulate = async (status: 'matched' | 'rejected') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      onRequestChange(await mockWalletApi.simulateStatus(status));
      await onRefresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update the mock response.');
    } finally {
      setLoading(false);
    }
  };

  const walletActive = request.verificationStatus === 'matched'
    && holderAccount?.accountStatus === 'active'
    && Boolean(holderAccount.confirmedAt);
  const connectionLabel = {
    under_review: 'Under review',
    matched: walletActive ? 'Connected' : 'Matched - activating',
    rejected: 'Needs correction',
  }[request.verificationStatus];

  const rejectionMessage = request.rejectionReason === 'IDENTITY_INFORMATION_COULD_NOT_BE_CONFIRMED'
    ? 'The issuer could not confirm the submitted identity information. Check the details and submit a corrected request.'
    : 'The issuer could not approve this request. Check the details and submit a corrected request.';

  const statusCopy = {
    under_review: {
      icon: '...',
      color: colors.brown,
      background: colors.sand,
      title: 'Waiting for Assumption University',
      body: 'Your student verification is under review. Wallet features remain locked until this trusted-service connection is approved.',
    },
    matched: {
      icon: '✓',
      color: colors.green,
      background: '#DDF7E9',
      title: walletActive ? 'Assumption University connected' : 'Student record matched',
      body: walletActive
        ? 'Your AU student status is verified. Continue to secure and unlock the wallet features.'
        : 'Assumption University matched your student record. The wallet remains locked until activation is confirmed.',
    },
    rejected: {
      icon: '!',
      color: colors.red,
      background: colors.softRed,
      title: 'Information could not be confirmed',
      body: rejectionMessage,
    },
  }[request.verificationStatus];

  return (
    <View style={themeStyles.screen}>
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: statusCopy.background }]}><Text style={[styles.iconText, { color: statusCopy.color }]}>{statusCopy.icon}</Text></View>
        <Text style={styles.title}>{statusCopy.title}</Text>
        <Text style={styles.body}>{statusCopy.body}</Text>
        <View style={styles.holderPanel}>
          <Text style={styles.holderLabel}>Assumption University connection</Text>
          <Text style={styles.holderStatus}>{connectionLabel}</Text>
          {walletActive ? <Text style={styles.confirmed}>Wallet access enabled</Text> : null}
        </View>
        <Text style={styles.submitted}>Submitted {new Date(request.submittedAt).toLocaleString()}</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        {isMockApi && request.verificationStatus === 'under_review' ? (
          <View style={styles.mockPanel}>
            <Text style={styles.mockTitle}>Mock Assumption University response</Text>
            <Text style={styles.mockBody}>Development controls only. No Supabase or live backend request is made in this mock flow.</Text>
            <View style={styles.mockActions}>
              <Pressable style={styles.mockButton} onPress={() => void simulate('matched')} disabled={loading}><Text style={styles.mockApprove}>Simulate matched</Text></Pressable>
              <Pressable style={styles.mockButton} onPress={() => void simulate('rejected')} disabled={loading}><Text style={styles.mockReject}>Simulate rejected</Text></Pressable>
            </View>
          </View>
        ) : null}
      </View>

      <View style={themeStyles.actionStack}>
        {request.verificationStatus === 'under_review' || (request.verificationStatus === 'matched' && !walletActive) ? <PrimaryButton label={loading ? 'Checking...' : 'Check status'} onPress={() => void refresh()} disabled={loading} /> : null}
        {walletActive ? <PrimaryButton label="Set up wallet security" onPress={onContinue} /> : null}
        {request.verificationStatus === 'rejected' ? <PrimaryButton label="Correct and resubmit" onPress={onCorrect} /> : null}
        {!walletActive ? <SecondaryButton label="Back to wallet" onPress={onBackToWallet} /> : null}
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
  holderPanel: { width: '100%', marginTop: 18, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center' },
  holderLabel: { color: colors.muted, fontSize: 11.5, fontWeight: '700' },
  holderStatus: { marginTop: 4, color: colors.ink, fontSize: 15, fontWeight: '800', textTransform: 'capitalize' },
  confirmed: { marginTop: 4, color: colors.green, fontSize: 11.5, fontWeight: '700' },
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
