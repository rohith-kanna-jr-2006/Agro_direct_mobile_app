# How to Build and Install Your App

To install the app on your phone (APK file), follow these steps:

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
    *   Scan the QR code with your Android phone's camera (or specific QR app).
    *   Download and Install the APK.

## IMPORTANT: Google Sign In on Built App
The "Built" app uses a different digital signature (SHA-1 fingerprint) than your local development version.

1.  After the build starts, EAS will show you the "Credentials" or you can run `npx eas credentials`.
2.  Find the **SHA-1 Fingerprint** for your "Production" or "Preview" profile.
3.  Go to **Google Cloud Console** -> Credentials.
4.  Create a **NEW** Android Client ID with this **NEW SHA-1**.
5.  Update your code (`app/login.tsx`) with this new `androidClientId` and rebuild (or use OTA updates if configured).

## Manual Web Preview (For Web Apps)
If you are building the web version of "KisanDirect" and want to check responsiveness:

1.  **Open Preview**: Click the Preview button (usually top right) to open the internal browser.
2.  **Inspect**: Right-click anywhere inside the preview window and select **Inspect** (or Inspect Element).
3.  **Toggle Device Toolbar**:
    *   In the DevTools panel that opens, look for the **Device Toolbar icon** (a small phone/tablet icon 📱) in the top-left corner of the Inspector.
    *   Click it (or press `Ctrl + Shift + M`) to toggle Mobile View.
4.  **Select Device**: You can then select "iPhone SE", "Pixel 7", etc., from the dropdown.
