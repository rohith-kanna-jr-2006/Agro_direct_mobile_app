# How to Run and Build the App

This guide covers how to run the app locally for development and how to build the APK for installation on an Android device.

## 1. Run Locally (Development)

To work on the app day-to-day, you need to run both the **Backend Server** and the **Frontend App** simultaneously.

### Step 1: Start the Backend Server
This handles the database, API requests, and authentication.

1.  Open a **New Terminal** in VS Code.
2.  Navigate to the server folder:
    ```powershell
    cd server
    ```
3.  Start the server:
    ```powershell
    node index.js
    ```
    *   You should see: `Server running on port 5000` and `MongoDB Connected`.
    *   **Keep this terminal open and running.**

### Step 2: Start the Frontend App
This runs the React Native mobile application.

1.  Open a **Second Terminal** (Click the `+` icon in VS Code terminal).
2.  Ensure you are in the main project folder (`AgroDirect\KisanSmartApp`):
    *   If you are in `server`, type `cd ..` to go back up.
3.  Start the Expo development server:
    ```powershell
    npx expo start
    ```
    *   This will display a **QR Code** in the terminal.

### Step 3: Run on Your Device
1.  **Physical Android Phone**:
    *   Install the **Expo Go** app from the Google Play Store.
    *   Connect your phone to the same Wi-Fi as your computer.
    *   Open Expo Go and scan the QR code from the terminal.
2.  **Android Emulator** (if installed):
    *   Press `a` in the terminal to open the app in the Android Emulator.
3.  **Web Browser**:
    *   Press `w` in the terminal to run the web version (useful for quick UI checks).

---

## 2. Build and Install (APK)

To install the standalone app on your phone (APK file) without needing Expo Go:

1.  **Stop the current Expo server** (Press `Ctrl + C` in the terminal running `npx expo start`).

2.  **Login to Expo** (if you haven't already):
    ```powershell
    npx eas login
    ```

3.  **Build the Android APK**:
    Run this command and follow the prompts. Say "Yes" to everything (generating keystore, etc.).
    ```powershell
    npx eas build -p android --profile preview
    ```

4.  **Wait for the Build**:
    *   This will happen in the cloud and may take 10-15 minutes.
    *   When finished, it will provide a **Link** and a **QR Code**.

5.  **Install**:
    *   Scan the QR code with your Android phone's camera.
    *   Download and install the APK.

---

## 3. Important Notes & Troubleshooting

### Backend Connection Issues
If the app says "Network Error" or data isn't loading:
1.  Ensure the **Backend Server** (Step 1) is still running.
2.  Your phone must be on the **same Wi-Fi** as your computer.
3.  If you still have issues, check `utils/api.ts` and ensure the IP address logic is correct for your network. You may need to manually update `MANUAL_IP` with your computer's IP address (find it by running `ipconfig` in a terminal).

### Google Sign In on Built App
The "Built" APK uses a different digital signature than the local development version.
1.  After the build starts, run `npx eas credentials` to see the **SHA-1 Fingerprint**.
2.  Add this SHA-1 to your **Google Cloud Console** credentials as a new Android Client ID.
3.  Update `androidClientId` in `app/login.tsx` if necessary.

### Manual Web Preview
To check responsiveness in the web version:
1.  Press `w` to run on web.
2.  Right-click -> **Inspect**.
3.  Click the **Device Toolbar icon** (📱) or press `Ctrl + Shift + M`.
