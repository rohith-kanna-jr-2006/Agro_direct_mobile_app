# Auth0 Integration for MFA

This project now supports Auth0 for secure authentication with Multi-Factor Authentication (MFA).

## Setup Instructions

1.  **Create Auth0 Application**:
    *   Go to [Auth0 Dashboard](https://manage.auth0.com/).
    *   Create a new Application of type "Single Page Web Applications".
    *   In Settings, locate "Domain" and "Client ID".

2.  **Configure Environment Variables**:
    *   Open `.env` in the project root.
    *   Update the following variables with your actual Auth0 credentials:
        ```env
        VITE_AUTH0_DOMAIN=your-auth0-domain.us.auth0.com
        VITE_AUTH0_CLIENT_ID=your-client-id
        ```

3.  **Configure Auth0 Settings**:
    *   **Allowed Callback URLs**: `http://localhost:5173`
    *   **Allowed Logout URLs**: `http://localhost:5173`
    *   **Allowed Web Origins**: `http://localhost:5173`
    *   *Note: If you deploy the app, add the production URL here as well.*

4.  **Enable MFA**:
    *   In Auth0 Dashboard, go to **Security > Multi-factor Authentication**.
    *   Enable "One-time Password" or any other factor you prefer.
    *   Define the policy (e.g., "Always" or "Adaptive") to enforce MFA.

## Usage

*   A "Login with Auth0 (MFA)" button has been added to the Login screen.
*   Clicking it will redirect to the Auth0 Universal Login page where MFA will be enforced if configured.
