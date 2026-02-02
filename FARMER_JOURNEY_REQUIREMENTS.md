# Farmer User Journey & Requirements (Simplified for Slides)

## 1. Requirements (The "Barrier to Entry")

### Legal/KYC
*   **Identity**: Valid Aadhaar-linked Mobile Number for OTP login.
*   **Trust Verification**: Integration with government **PM-KISAN database API** to automatically verify landholding status (removes fake profiles).
*   **Bank Account**: IFSC Code for receiving payments.
*   **Land Document**: Optional manual upload if PM-KISAN verification is not available.

### Technical
*   **Smartphone**: Android (min. version 8.0).
*   **Permissions**: Camera (product photos), Location (pickup coordinates), Microphone (voice commands).

## 2. Step-by-Step "Add Product" Flow

| Step | Action (Farmer) | App Logic (Backend) |
| :--- | :--- | :--- |
| **1. Select Crop** | Taps microphone icon and says "Tomato" (or selects Tomato icon). | NLP Engine converts voice to text; selects Category ID: VEG_01. |
| **2. Quality Scan** | Points camera at the heap of tomatoes. | AI Model scans image -> Detects color/size -> Assigns "Grade A". |
| **3. Pricing** | Enters quantity (e.g., "100 kg"). App shows: "Market Price is ₹20. Sell for ₹18?" | Price Algorithm checks local Mandi rates and suggests a competitive price. |
| **4. Location** | Taps "Use Current Location". | GPS Module fetches Lat/Long coordinates for the delivery truck. |
| **5. Go Live** | Taps big Green "Sell Now" button. | Product is listed on Buyer Marketplace instantly. |

## 3. Trust & Verification FAQ

**Q: "How do you ensure the farmer isn't fake?"**
**A:** "In Step 1 (Requirements), we require a valid Aadhaar linked Mobile Number for OTP login. For higher trust, we integrate with the government's PM-KISAN database API to verify their landholding status automatically."
