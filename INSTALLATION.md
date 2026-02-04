# Installation & Run Guide

This guide provides step-by-step instructions to set up and run the **KisanSmartApp** (AgroDirect) on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
1.  **Node.js** (v18 or higher recommended) - [Download Here](https://nodejs.org/)
2.  **MongoDB** (Local instance running on `localhost:27017`) - [Download Here](https://www.mongodb.com/try/download/community)

---

## Step 1: Backend Setup (Server)

The backend handles API requests, database connections, and authentication.

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `server/` directory if it doesn't exist, and add the following keys:
    ```env
    PORT=5000
    TWILIO_ACCOUNT_SID=your_twilio_account_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token
    TWILIO_SERVICE_SID=your_twilio_service_sid
    JWT_SECRET=your_secret_key_here
    ```
    > **Note:** For the OTP feature to work, valid Twilio credentials are required. For testing, the app supports a mock OTP `1234` if Twilio fails.

4.  **Start MongoDB:**
    Ensure your local MongoDB service is running.
    ```bash
    # Command varies by OS, e.g., for Windows:
    net start MongoDB
    # Or for macOS/Linux:
    brew services start mongodb-community
    ```

5.  **Run the Backend Server:**
    ```bash
    npm run dev
    ```
    You should see:
    ```
    Server running on port 5000
    MongoDB Connected
    ```

---

## Step 2: Frontend Setup (Client)

The frontend is built with React, Vite, and TypeScript.

1.  **Open a new terminal window** (keep the server running in the first one).

2.  **Navigate to the project root directory:**
    ```bash
    cd .. 
    # Or navigate to the root folder: cd d:\AgroDirect\KisanSmartApp
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure Environment Variables:**
    Ensure a `.env` file exists in the root directory with the following:
    ```env
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    ```

5.  **Run the Frontend Application:**
    ```bash
    npm run dev
    ```
    You should see:
    ```
    VITE vX.X.X  ready in X ms
    ➜  Local:   http://localhost:5173/
    ```

6.  **Access the App:**
    Open your browser and visit `http://localhost:5173`.

---

## Troubleshooting

-   **MongoDB Connection Error:**
    -   Ensure MongoDB is installed and running on port `27017`.
    -   Check the connection string in `server/index.js` if you are using a custom setup.

-   **OTP Not Working:**
    -   If Twilio keys are missing or invalid, the server logs will show an error.
    -   You can use the **Mock OTP: `1234`** to bypass verification during development.

-   **Port Conflicts:**
    -   If Port 5000 is busy, change `PORT` in `server/.env` and update the frontend API calls accordingly.
