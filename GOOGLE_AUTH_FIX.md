# Fixing Google Login "Origin Mismatch" Error

The error `Error 400: origin_mismatch` occurs because Google's servers don't recognize the address (URL) your app is running on. You need to whitelist your local development URL in the Google Cloud Console.

## Steps to Fix

1.  **Check your Browser URL**:
    *   Look at the address bar where your app is running.
    *   It is likely **`http://localhost:5173`**.
    *   *Note: If you are using an IP address like `192.168.1.5` or a different port, note that down instead.*

2.  **Go to Google Cloud Console**:
    *   Visit [console.cloud.google.com](https://console.cloud.google.com/)
    *   Ensure you have selected the project that contains the Client ID:
        `80509016220-jmf6jt7oedmudt2pti13vl28fkoetnbs.apps.googleusercontent.com`

3.  **Update Credentials**:
    *   Navigate to **APIs & Services** > **Credentials**.
    *   Click on the **OAuth 2.0 Client ID** you are using.
    *   Look for **"Authorized JavaScript origins"**.
    *   Click **"Add URI"**.
    *   Enter: `http://localhost:5173` (or your specific URL).
    *   *Important: Do not add a trailing slash (e.g., use `http://localhost:5173`, NOT `http://localhost:5173/`).*

4.  **Save and Wait**:
    *   Click **Save**.
    *   **Wait 5 minutes**. Google changes can take a short while to propagate.

5.  **Retest**:
    *   Refresh your app page.
    *   Try logging in again.

## Why did this happen?
Google requires strict security whitelisting for OAuth to prevent malicious sites from using your login credentials. Locally, you must explicitly allow `localhost`.
