# AU Wallet (W3C Verifiable Credential App Simulation)

An elegant, user-centric mobile wallet prototype built with React Native and Expo. This application simulates a decentralized identity environment allowing students at Assumption University to securely receive, store, and selectively disclose their official academic transcripts using W3C Verifiable Credential (VC) and Passkey standards.

## 🚀 The Core Value: Traditional vs. Decentralized Verification
* **Traditional Verification:** Takes days or weeks, relies heavily on third-party background check agencies, requires manual database administration, and risks forged PDFs.
* **W3C Decentralized Flow (<1s Verify):** Cryptographic math confirms authenticity instantly. The verifier checks the issuer's public key signature and the holder's device signature in milliseconds, entirely eliminating operational debt.

---

## 🛠️ Key Architectural Features Simulated

* **Account-First Onboarding:** Registers with a personal email, submits admission number, date of birth, and passport number for issuer review, and enables local wallet PIN setup only after approval.
* **Selective Disclosure Engine:** Fully functional UX toggles allow users to maintain complete control over their data privacy. Students can share their degree and major while explicitly keeping sensitive records like GPA or academic standing hidden from prospective employers.
* **Audit Trail / Disclosure Receipts:** Includes a historic verification tab serving as a cryptographic ledger showing exactly what data left the device, when it was sent, and to which transaction session ID (e.g., `JOB-2026-001`).

---

## 📱 User Interface Walkthrough

1. **Welcome & Authentication:** The gateway welcoming students to sign in passwordless via university identity infrastructure.
2. **Wallet Dashboard:** Displays active VC passes (e.g., *Bachelor of Science in Computer Science*) along with pending issuance offers or employer verification requests.
3. **Selective Sharing Matrix:** The control panel where users switch fields on or off before executing a Verifiable Presentation (VP).
4. **Receipt Page:** Mimics the verifier's endpoint view, mapping trust chains and displaying verification QR codes.

---

## ⚙️ Development Setup & Installation

This project is built using **React Native** and managed via **Expo**. 

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your local machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/au_wallet.git](https://github.com/YOUR_USERNAME/au_wallet.git)
cd au_wallet

```

### 2. Install Dependencies

Install the required packages (including `expo-linear-gradient` for card styling):

```bash
npm install

```

### 3. Start the Development Server

```bash
npx expo start

```

### How to View the App:

* **Physical Device:** Configure the API base URL with the computer's LAN address or a shared HTTPS backend. `localhost` on the phone refers to the phone itself.
* **iOS Simulator:** Press `i` in the terminal window (requires Xcode installed on macOS).
* **Android Emulator:** Press `a` in the terminal window (requires Android Studio installed on Windows/Linux).

---

## 🛡️ Technical Stack & Standards Mapping

* **Frontend Framework:** React Native (Expo Managed Workflow)
* **Data Standards Simulated:** W3C Verifiable Credentials Data Model v2.0 (JSON-LD / JWT payloads)
* **Authentication Standard:** WebAuthn / Passkeys (Device-bound biometrics)
* **Exchange Protocols:** OpenID for Verifiable Credential Issuance (OpenID4VCI) & Presentations (OpenID4VP)

---

## Wallet backend integration

The wallet treats email authentication and issuer approval as separate steps:

1. The user creates an account with a personal email and confirms it.
2. The user submits admission number, date of birth, and passport number.
3. AU Registrar reviews the submission.
4. Only an approved user can create a device-local wallet PIN and enter the wallet.

The wallet calls the NestJS backend only. It does not call the backend database provider directly.

### Environment and mock mode

Create `.env.local` in the project root:

```env
EXPO_PUBLIC_USE_MOCK_API=true
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

Mock mode is enabled unless `EXPO_PUBLIC_USE_MOCK_API=false`. When live integration is approved, set the API URL to an address reachable by the test device:

With `EXPO_PUBLIC_USE_MOCK_API=true`, registration, login, trusted-service verification and holder activation stay inside the device mock. The wallet does not call the NestJS backend or Supabase.

- Same-computer web testing: `http://localhost:3000`
- Android emulator: `http://10.0.2.2:3000`
- Physical phone: the computer's current LAN address, for example `http://192.168.1.9:3000`
- Shared testing: a deployed HTTPS backend

### Implemented frontend contract

- `POST /auth/register`
- `POST /auth/resend-confirmation`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /holder-accounts/me`
- `GET /issuer-providers`
- `GET /vc/academic-transcripts/offers/me`
- `POST /vc/academic-transcripts/offers/:offerId/accept`
- `POST /onboarding-verification/requests`
- `GET /onboarding-verification/requests/me`

The credential-offer response shapes and authorization requirements are in
`docs/credential-offer-api-contract.md`. Pending UI is data-driven: the wallet
does not show an offer unless the authenticated API returns one.

Protected requests send the access token as:

```http
Authorization: Bearer <access-token>
```

Access and refresh tokens are stored in Expo SecureStore, restored when the app starts, and cleared on logout or when token refresh fails. A successful refresh replaces both stored tokens, and the original protected request is retried only once. Passwords, tokens and passport values are never logged. The passport input is cleared and discarded immediately after the onboarding request completes.

If SecureStore is unavailable, such as in a browser preview, mock tokens and the mock PIN verifier remain in memory only and disappear when the app restarts. They are never written to AsyncStorage.

After onboarding reports `matched`, the wallet calls `GET /holder-accounts/me` again and requires an `active` account with `confirmedAt` set before enabling device-local wallet PIN creation. The PIN is never sent to the backend.

### Registration and onboarding flow

Current mock personal-wallet flow:

```text
Register with a personal email
-> return and log in through the mock account flow
-> see an empty wallet with no pending credential requests
-> choose Assumption University from Trusted Services
-> select Thai Nationality or Foreigner
-> submit admission number, date of birth and Thai national ID or passport number
-> simulate an under-review decision as matched or rejected
-> matched enables wallet PIN setup and wallet features
```

Issuer-provider cards are loaded from authenticated `GET /issuer-providers`. Availability, connection enablement, mock labeling and connection status come from the backend. Provider artwork remains local and is selected by `issuerCode`; coming-soon providers cannot connect.

Live backend flow when mock mode is disabled:

```text
Register with personal email
→ check confirmation email
→ manually return and log in
→ submit admission number, date of birth and passport number
→ wait in under_review
→ matched activates wallet, or rejected allows correction and resubmission
```

There is no OTP, application callback, deep link, password-recovery callback, graduation-date input, university-email input or passport-document upload in this integration.

For Android development:

```bash
npx expo run:android
npx expo start --dev-client
```
