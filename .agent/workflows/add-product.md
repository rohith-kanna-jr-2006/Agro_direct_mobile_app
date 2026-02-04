---
description: Comprehensive workflow for the AI-assisted 5-step Add Product flow in the Farmer App.
---

### Add Product Workflow

**Step 1: Crop Selection** – Use Voice Recognition (Mic button + Vibration) or Manual Selection from the interactive grid.
- **Voice Input**: Tap the Mic button. The app vibrates and simulates listening for 2 seconds before selecting "Tomato".
- **Manual Input**: Select a crop directly from the MOCK_CROPS grid.
- **Navigation**: Click "Next: Check Quality" to proceed.

**Step 2: Quality Scan** – Capture produce photos via camera; high-speed Mock AI analyzes the image to assign a grade (e.g., "Grade A").
- **Capture**: Use the camera icon to take a photo of the produce.
- **AI Grading**: A 2-second simulation mocks AI grading to assign "Grade A".
- **Navigation**: Click "Next: Set Price". Pre-fills price based on (Market Price - 2).

**Step 3: Economics** – Set Quantity and Price with real-time "Market Insights" suggesting a competitive rate for faster sales.
- **Insights**: View current market price and recommended pricing.
- **Quantity**: Adjust weight (default 50kg) using + / - buttons or manual entry.
- **Price**: Pre-filled from Step 2, editable by the user.
- **Navigation**: Click "Next: Location".

**Step 4: Logistics** – One-tap Geolocation fetch and delivery mode selection (Buyer Pickup vs. Field Drop).
- **Geolocation**: Use "My Current Location" to fetch address (simulated 1.5s delay).
- **Delivery**: Toggle between "Buyer Pickup" and "I will Drop".
- **Navigation**: Click "Next: Confirm" (enabled only after location is set).

**Step 5: Go Live** – Final confirmation with Total Earnings calculation and direct API submission to sync with the buyer marketplace.
- **Summary**: Review image, crop details, grade, quantity, and price.
- **Earnings**: View automatically calculated Total Expected Earnings (Price * Quantity).
- **Submission**: Tap "SELL NOW" to save the product via API and return to the dashboard.
