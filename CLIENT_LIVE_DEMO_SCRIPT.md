# AU Wallet Client Live-Demo Script

Prepared for the client demonstration on 10 August 2026.

## Recommended format

- Target duration: 8-10 minutes, followed by questions.
- Recommended mode for the presentation: mock API.
- Demonstrate on a physical phone using the already working Expo Go or development-client setup.
- Use only a synthetic academic fixture. Keep the passport or Thai national ID field masked and never include its value in screenshots, terminal output, recordings, or messages.
- Describe this as the current mobile-wallet prototype. Do not describe the simulated credential, QR code, signature, or verification result as production cryptography.

## Pre-demo checklist

Complete this at least 30 minutes before the meeting.

1. In VS Code, open the project:

   ```powershell
   cd "D:\Sem_1_2026\Senior Project 2\AU-wallet-holder-app"
   code .
   ```

2. For the reliable mock demonstration, set `.env.local` to:

   ```env
   EXPO_PUBLIC_USE_MOCK_API=true
   EXPO_PUBLIC_API_BASE_URL=<leave the current backend URL here>
   ```

   The API URL is ignored while mock mode is enabled. Do not add Supabase keys.

3. Start Expo with a clean cache:

   ```powershell
   npx expo start --lan --clear
   ```

4. Connect the phone and laptop to the same Wi-Fi. Disable any VPN if it prevents LAN discovery.
5. Open the application and make sure it begins at Welcome. If an old session appears, sign out. If the screen is stale, reload the application or press `r` in the Expo terminal.
6. Turn on Do Not Disturb, hide notification previews, increase screen brightness, and keep the phone connected to power.
7. Prepare these values privately before the meeting:

   - A fictional first and last name.
   - A fictional personal email.
   - A password that satisfies the displayed rules.
   - A synthetic AU admission/student number.
   - A fictional date of birth.
   - A securely provided synthetic passport or Thai national ID value. Do not place it in this script.
   - A six-digit demonstration wallet PIN. Do not say it aloud or show it in notes.

8. Do one complete rehearsal. Then register again only if needed for the real presentation; avoid creating multiple live accounts while debugging.

## Opening — 30 seconds

**Action:** Hold on the Welcome screen.

**Say:**

> Today I will demonstrate the current AU Wallet prototype from a student's point of view. The main idea is that a person first creates a personal wallet account. The wallet begins empty and is not automatically treated as an AU student account. The holder then chooses Assumption University as a trusted issuer, verifies student status, secures the wallet locally, receives a credential offer, and controls which academic fields are shared.

> For today's presentation I am using the mock issuer response so we can demonstrate the complete journey without waiting for a registrar decision. I will identify clearly which parts are working application flows and which parts are still simulated.

## Part 1 — Create a personal wallet account

**Action:** Tap **Create account**.

**Say:**

> The account starts with a personal email rather than requiring a university email. This separates ownership of the wallet from any single university connection.

**Action:** Enter the fictional first name, last name, personal email, and password.

**Say while entering the password:**

> Password input is hidden by default, with an option to show or hide it. The form also moves with the keyboard so lower fields and action buttons remain accessible.

**Action:** Tap **Create account**.

**Expected result:** The **Mock account ready** screen appears.

**Say:**

> In mock mode, no confirmation email is sent and no Supabase account is created. In live mode, this same point tells the student to check the confirmation email and return to log in.

**Action:** Tap **Return to login**, enter the same mock credentials, and tap **Log in**.

## Part 2 — Show the empty personal wallet

**Expected result:** The wallet opens with no credential and with wallet features locked.

**Say:**

> This is an important part of the design. Registration creates a personal wallet, not an academic credential. The wallet is deliberately empty, and there is no pending credential request before the holder connects an issuer.

> The name displayed here comes from the registration form. The wallet does not use a fixed demonstration name.

## Part 3 — Explore trusted issuers

**Action:** Point to the Assumption University card and its AU logo. Do not connect yet.

**Say:**

> Trusted services are presented separately from the credentials stored in the wallet. Assumption University is the active connection option in this prototype.

**Action:** Tap **See more services**.

**Say:**

> The provider catalogue is on a separate page so the main wallet remains clear. Provider names, descriptions, availability, connection status, and whether a provider is a mock are represented through the issuer-provider API contract. Coming-soon issuers are visible but cannot be connected.

**Action:** Return to the wallet, then tap **Connect** on Assumption University.

## Part 4 — Verify AU student status

**Expected result:** The **Connect Assumption University** form appears.

**Say:**

> The holder chooses between Thai Nationality and Foreigner. A Thai holder provides a Thai national ID; a foreign holder provides a passport number. Both document fields are masked and include a show-or-hide control.

**Action:** Choose the nationality type planned for the demonstration. Enter the synthetic admission number.

**Action:** Tap **Date of birth**, select a date from the native calendar, and confirm it.

**Say:**

> Date of birth uses the phone's native calendar. The user no longer needs to type separators manually, and future dates are blocked.

**Action:** Enter the synthetic identity-document value privately. Keep the field hidden. Tap **Submit student verification**.

**Say:**

> The wallet does not log or permanently retain the passport or Thai national ID value. The submitted admission number becomes the student ID shown later in the wallet experience.

## Part 5 — Explain the approval boundary

**Expected result:** The request status is **Under review** and wallet features remain locked.

**Say:**

> Submission does not activate the wallet by itself. The request first enters an under-review state. For live integration, the issuer must match the student record and the holder account must become active with a confirmation timestamp.

**Action:** In the clearly labelled development panel, tap **Simulate matched**.

**Say before tapping:**

> This button is a development control used only in mock mode. It stands in for the registrar's approval action so that we can complete the client demonstration immediately.

**Expected result:** The screen shows that Assumption University is connected and wallet access is enabled.

**Action:** Tap **Set up wallet security**.

## Part 6 — Set up the device-local wallet PIN

**Action:** Enter the prepared six-digit PIN, tap **Create PIN**, enter it again, and tap **Confirm PIN**.

**Say:**

> The wallet PIN is created only after AU verification and holder activation. It is device-local and is never sent to the backend. The confirm action remains accessible above the iPhone keyboard and below the form on Android.

**Expected result:** The wallet opens with features enabled and an AU Registrar credential offer under Pending.

## Part 7 — Accept the credential offer

**Say before opening the offer:**

> Identity verification and credential issuance are separate stages. Connecting AU proves that this wallet belongs to a verified student, but it does not silently issue a credential.

**Action:** Tap **AU Registrar wants to issue a credential**.

**Say:**

> The student can review the issuer and credential claims before accepting. The holder name shown in the preview comes from registration.

**Action:** Tap **Approve & continue**.

**Expected result:** A verification-in-progress state appears, followed by the wallet containing the Education Transcript VC.

**Say:**

> The prototype now simulates the issuer verification and storage step. In production, this stage will be replaced by signed credential issuance and validation against the issuer's trust material.

## Part 8 — Demonstrate selective disclosure

**Action:** From the wallet, tap the Employer A verification request. Confirm the wallet PIN without exposing it.

**Say:**

> Before sharing, the wallet asks the holder to unlock it again. This prevents someone who briefly gains access to an unlocked phone from immediately sharing academic data.

**Expected result:** The selective-sharing screen appears.

**Action:** Keep Degree, Major, and Graduation date enabled. Keep GPA and Academic standing disabled.

**Say:**

> The employer asks for several possible fields, but the student controls what is disclosed. In this example, the student shares the qualification details while withholding GPA and academic standing.

**Action:** Tap **Share proof**.

**Expected result:** The simulated Employer A verification result appears.

**Say:**

> This verifier result and QR code are currently a UX simulation. They demonstrate the intended trust chain and disclosed-field experience; production cryptographic verification is a later integration step.

**Action:** Tap **Done**, open **History**, and open the disclosure receipt if available.

**Say:**

> The wallet keeps an activity record so the holder can understand what was shared, with whom, and for which purpose. The current receipt and cryptographic metadata are demonstration data.

## Optional profile view — 30 seconds

**Action:** Open **Settings**.

**Say:**

> The profile uses the first and last name entered during registration and the admission number submitted during student verification. Linked-issuer and security settings are represented here for the next stage of development.

## Closing — 45 seconds

**Say:**

> What is working today is the complete mobile experience: personal account registration and login, an initially empty wallet, issuer discovery, AU student-verification submission, Thai and foreign document paths, native date selection, approval states, device-local PIN security, credential-offer review, selective disclosure controls, and activity receipts.

> The wallet also has a live NestJS API adapter for authentication, holder status, onboarding requests, and issuer providers. The wallet never contains Supabase service keys and does not connect directly to the database provider.

> The next production work is the real registrar approval interface, signed credential issuance, verifier-side cryptographic validation, production recovery and biometric policy, and operational testing across supported devices.

> I would now like your feedback on the onboarding wording, the amount of information shown during AU verification, and whether the issuer catalogue and selective-sharing controls match the experience you expect for students.

## Five-minute shortened route

If time is limited, use this sequence:

1. Begin with an already registered mock account.
2. Log in and show the empty wallet.
3. Open **See more services**, then return and connect AU.
4. Show nationality selection and the native date picker, but use a pre-prepared synthetic fixture.
5. Submit, explain **Under review**, and tap **Simulate matched**.
6. Create and confirm the wallet PIN.
7. Accept the pending AU credential offer.
8. Open the employer request, unlock, hide GPA and standing, then share.
9. Close with the production-versus-simulation boundary.

## Live-backend alternative

Use this only if the backend and test account are confirmed before the meeting.

1. Set:

   ```env
   EXPO_PUBLIC_USE_MOCK_API=false
   EXPO_PUBLIC_API_BASE_URL=http://<backend-host>:3000
   ```

2. From the phone's normal browser, open:

   ```text
   http://<backend-host>:3000/auth/me
   ```

3. Continue only if the browser reaches the route and receives HTTP 401 with `ACCESS_TOKEN_INVALID_OR_EXPIRED`. That response means connectivity succeeded.
4. Restart Expo using `npx expo start --lan --clear`.
5. Use one approved development email, confirm it through the standard email link, manually return to the app, and log in.
6. Submit one securely provided synthetic academic fixture.
7. Stop at **Under review** unless the issuer frontend and an authorized issuer operator are available to approve the request.
8. Do not repeatedly register new accounts while diagnosing connectivity.

### Today's connectivity finding

The backend URL currently configured in `.env.local` timed out from the laptop during preparation. Recheck it before the meeting. Unless the phone-browser connectivity test succeeds, use the mock route above.

## Recovery lines for common demo problems

### The backend cannot be reached

**Say:**

> The mobile flow is available in a self-contained demonstration mode, so I will continue with the same application states while the external backend environment is unavailable.

Then enable mock mode and restart Expo.

### Expo shows Network request failed

Check the following without exposing credentials:

- Whether the phone browser can open `/auth/me`.
- The configured API base URL.
- Whether the phone and laptop share a reachable network.
- Whether a VPN is active.
- The phone platform and Expo SDK/client compatibility.
- The sanitized error message.

### The application opens on an old screen

**Say:**

> I am clearing the previous local demonstration session before continuing.

Sign out, reload the application, or restart with:

```powershell
npx expo start --lan --clear
```

### The issuer remains under review

In mock mode, use **Simulate matched**. In live mode, do not claim approval; explain that an authorized issuer action is required.

### The keyboard covers an action

Drag the form slightly to scroll. On iOS, use the action button above the keyboard. Avoid rotating the phone during the demonstration.

## Likely client questions and suggested answers

### Is this production-ready?

> It is a working mobile prototype with live API integration points, but production credential signing, verifier cryptography, recovery policy, security review, and full device testing are still required.

### Why does registration use a personal email?

> The wallet belongs to the person rather than to one university account. Institutions are added later as trusted issuer connections, so the same wallet model can support more than one service.

### Is the passport or Thai national ID stored in the wallet?

> The mobile input is cleared after submission and is not logged or permanently stored by the wallet. The production backend must apply its approved retention and privacy policy to any verification data it receives.

### Where are login tokens and the wallet PIN stored?

> Authentication tokens and the PIN verifier use the phone's secure storage. The PIN itself is not sent to the backend. In browser previews where secure storage is unavailable, mock values remain only in memory.

### Can another university be added?

> Yes. The issuer-provider contract already represents provider identity, availability, connection enablement, mock status, and connection status. The other providers currently shown are coming-soon examples.

### What happens when verification fails?

> The request moves to a rejected state with a user-friendly explanation, and the holder can correct the information and resubmit.

### Is the displayed QR proof real?

> Not yet. It currently demonstrates the intended verifier experience and selective-disclosure result. Real signed credentials and verifier validation are part of the production integration stage.

