import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  useWindowDimensions,
} from "react-native";
import {
  NavigationContainer,
  NavigationProp,
  useNavigation,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import { styles } from "../theme/styles";
import { colors } from "../theme/constants";
import type { Screen, ShareFields, HistoryEvent } from "../types";

import { WelcomeScreen } from "../screens/WelcomeScreen";
import { IdentityAuthScreen } from "../screens/IdentityAuthScreen";
import CreatePinScreen from "../screens/CreatePinScreen";
import { IdentityProofingScreen } from "../screens/IdentityProofingScreen";
import { VerifyingScreen } from "../screens/VerifyingScreen";
import WalletScreen from "../screens/WalletScreen";
import { OfferScreen } from "../screens/OfferScreen";
import { SuccessScreen } from "../screens/SuccessScreen";
import { CredentialScreen } from "../screens/CredentialScreen";
import { ShareScreen } from "../screens/ShareScreen";
import { VerificationScreen } from "../screens/VerificationScreen";
import { ReceiptScreen } from "../screens/ReceiptScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { BottomNav } from "../components";

export type RootStackParamList = {
  welcome: undefined;
  identity_auth: undefined;
  create_pin: undefined;
  identity_proofing: undefined;
  verifying: undefined;
  wallet: undefined;
  offer: undefined;
  success: undefined;
  credential: undefined;
  share: undefined;
  verification: undefined;
  receipt: undefined;
  history: undefined;
  settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppNavigation = NavigationProp<RootStackParamList>;

type ScreenFrameProps = {
  children: React.ReactNode;
  activeScreen?: "wallet" | "history" | "settings";
};

function ScreenFrame({ children, activeScreen }: ScreenFrameProps) {
  const navigation = useNavigation<AppNavigation>();
  const { width, height } = useWindowDimensions();

  const phoneWidth = Math.min(375, Math.max(320, width - 32));
  const phoneHeight = Math.min(760, Math.max(640, height - 32));

  const go = useCallback(
    (screen: Screen) => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  return (
    <SafeAreaView
      style={[
        styles.appShell,
        {
          flex: 1,
          width: "100%",
        },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <View
        style={[
          styles.phone,
          {
            width: phoneWidth,
            height: phoneHeight,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          {children}
        </View>

        {activeScreen && <BottomNav active={activeScreen} go={go} />}
      </View>
    </SafeAreaView>
  );
}

type VerifyingRouteProps = NativeStackScreenProps<
  RootStackParamList,
  "verifying"
>;

type VerifyingWrapperProps = VerifyingRouteProps & {
  setHistory: React.Dispatch<React.SetStateAction<HistoryEvent[]>>;
};

function VerifyingWrapper({ navigation, setHistory }: VerifyingWrapperProps) {
  const go = useCallback(
    (screen: Screen) => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory([
        {
          id: "initial-issue",
          type: "issue",
          title: "Issued: Education Transcript VC",
          subtitle: "From AU Registrar",
          targetScreen: "credential",
        },
      ]);

      // Remove verifying from the navigation history.
      navigation.replace("wallet");
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [navigation, setHistory]);

  return (
    <ScreenFrame>
      <VerifyingScreen go={go} />
    </ScreenFrame>
  );
}

export default function RootStack() {
  const [shareFields, setShareFields] = useState<ShareFields>({
    degree: true,
    major: true,
    graduation: true,
    gpa: false,
    standing: false,
  });

  const [history, setHistory] = useState<HistoryEvent[]>([]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="welcome"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="welcome">
          {({ navigation }) => (
            <ScreenFrame>
              <WelcomeScreen
                onSignIn={() => navigation.navigate("create_pin")}
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="identity_auth">
          {({ navigation }) => (
            <ScreenFrame>
              <IdentityAuthScreen
                go={(screen) =>
                  navigation.navigate(screen as keyof RootStackParamList)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="create_pin">
          {({ navigation }) => (
            <ScreenFrame>
              <CreatePinScreen
                go={(screen) =>
                  navigation.navigate(screen as keyof RootStackParamList)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="identity_proofing">
          {({ navigation }) => (
            <ScreenFrame>
              <IdentityProofingScreen
                go={(screen) =>
                  navigation.navigate(screen)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="verifying">
          {(props) => <VerifyingWrapper {...props} setHistory={setHistory} />}
        </Stack.Screen>

        <Stack.Screen name="wallet">
          {({ navigation }) => (
            <ScreenFrame activeScreen="wallet">
              <WalletScreen />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="offer">
          {({ navigation }) => (
            <ScreenFrame>
              <OfferScreen
                go={(screen) =>
                  navigation.navigate(screen)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="success">
          {({ navigation }) => (
            <ScreenFrame>
              <SuccessScreen
                go={(screen) =>
                  navigation.navigate(screen)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="credential">
          {({ navigation }) => (
            <ScreenFrame>
              <CredentialScreen
                go={(screen) =>
                  navigation.navigate(screen)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="share">
          {({ navigation }) => (
            <ScreenFrame>
              <ShareScreen
                fields={shareFields}
                setFields={setShareFields}
                go={(screen) =>
                  navigation.navigate(screen)
                }
                onShare={() => {
                  const sharedCount =
                    Object.values(shareFields).filter(Boolean).length;

                  const newHistoryEvent: HistoryEvent = {
                    id: `share-${Date.now()}`,
                    type: "share",
                    title: "Shared proof with Employer A",
                    subtitle:
                      `Education Transcript VC · ` +
                      `${sharedCount} field${sharedCount === 1 ? "" : "s"}`,
                    targetScreen: "receipt",
                    sharedFields: {
                      ...shareFields,
                    },
                  };

                  setHistory((previousHistory) => [
                    newHistoryEvent,
                    ...previousHistory,
                  ]);

                  navigation.navigate("verification");
                }}
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="verification">
          {({ navigation }) => (
            <ScreenFrame>
              <VerificationScreen
                go={(screen) =>
                  navigation.navigate(screen)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="receipt">
          {({ navigation }) => (
            <ScreenFrame>
              <ReceiptScreen
                go={(screen) =>
                  navigation.navigate(screen)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="history">
          {({ navigation }) => (
            <ScreenFrame activeScreen="history">
              <HistoryScreen
                history={history}
                go={(screen) =>
                  navigation.navigate(screen)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>

        <Stack.Screen name="settings">
          {({ navigation }) => (
            <ScreenFrame activeScreen="settings">
              <SettingsScreen
                go={(screen) =>
                  navigation.navigate(screen)
                }
              />
            </ScreenFrame>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
