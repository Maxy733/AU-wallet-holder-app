# AU Wallet (W3C Verifiable Credential App Simulation)

An elegant, user-centric mobile wallet prototype built with React Native and Expo. This application simulates a decentralized identity environment allowing students at Assumption University to securely receive, store, and selectively disclose their official academic transcripts using W3C Verifiable Credential (VC) and Passkey standards.

## 🚀 The Core Value: Traditional vs. Decentralized Verification
* **Traditional Verification:** Takes days or weeks, relies heavily on third-party background check agencies, requires manual database administration, and risks forged PDFs.
* **W3C Decentralized Flow (<1s Verify):** Cryptographic math confirms authenticity instantly. The verifier checks the issuer's public key signature and the holder's device signature in milliseconds, entirely eliminating operational debt.

---

## 🛠️ Key Architectural Features Simulated

* **Account-First Onboarding:** Simulates secure university identity proofing (validating Student ID, university email, passport credentials, and graduation dates) before binding a local security PIN or biometric trigger to the device storage container.
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

* **Physical Device (Recommended):** Download the **Expo Go** app from the iOS App Store or Google Play Store, and scan the terminal's QR code with your phone camera.
* **iOS Simulator:** Press `i` in the terminal window (requires Xcode installed on macOS).
* **Android Emulator:** Press `a` in the terminal window (requires Android Studio installed on Windows/Linux).

---

## 🛡️ Technical Stack & Standards Mapping

* **Frontend Framework:** React Native (Expo Managed Workflow)
* **Data Standards Simulated:** W3C Verifiable Credentials Data Model v2.0 (JSON-LD / JWT payloads)
* **Authentication Standard:** WebAuthn / Passkeys (Device-bound biometrics)
* **Exchange Protocols:** OpenID for Verifiable Credential Issuance (OpenID4VCI) & Presentations (OpenID4VP)

```

```
