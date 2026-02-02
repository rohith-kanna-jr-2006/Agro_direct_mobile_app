# Buyer Purchase Flow: Vegetable Procurement

This document outlines the detailed user flow for a Buyer purchasing vegetables on the KisanSmartApp, focusing on the journey from discovery to successful order placement.

---

## Page 1: The Marketplace (Home)

**Context:** The user opens the app looking to buy fresh produce (e.g., Tomatoes).

### UI Elements
-   **Header:** App Logo, Location Selector ("Current Location: Coimbatore"), Notification Bell.
-   **Search Bar:** prominent input field with a **Microphone Icon** for voice search.
-   **Filters:** Horizontal scrollable chips: "Nearest Farmer", "Lowest Price", "Organic", "Bulk Available".
-   **Vegetable Cards (Grid View):** Each card displays:
    -   Image of the produce.
    -   Price per kg (e.g., "₹25/kg").
    -   **AI Quality Grade Badge:** (e.g., "Grade A", "Export Quality") highlighted in Green/Gold.
    -   Distance (e.g., "5 km away").
-   **Floating Action Button:** "Post Requirement" (for bulk buyers).

### User Action
-   User taps the **Microphone Icon** and says "Fresh Tomatoes".
-   User selects the **"Distance"** filter to find local farmers.
-   User taps on a **Tomato Card** that shows "Grade A" quality.

### Backend Logic
-   **Search Query:** NLP processes voice input "Fresh Tomatoes" -> queries `Product` database for category "Tomato".
-   **Geospatial Query:** Filters results using `$near` with the user's GPS coordinates.
-   **Ranking:** sorts results based on availability and distance.

---

## Page 2: Product Detail Screen

**Context:** User views specific details of the selected tomato listing to ensure quality and fit.

### UI Elements
-   **Hero Image:** High-resolution carousel of the produce.
-   **Product Info:** Title ("Hybrid Tomato - Grade A"), Price (₹25/kg).
-   **Harvest Details:**
    -   "Harvested On: [Yesterday's Date]" (Dynamic).
    -   "Shelf Life: 5 Days".
-   **Farmer Profile Card:** Small avatar, Name ("Ramesh Farm"), Rating (4.5 Stars), and "Verified Farmer" badge.
-   **Quantity Selector:** +/- Counter or Text Input (default "1 kg").
-   **Primary Button:** "Add to Cart" (or "Buy Now").

### User Action
-   User reviews the **Harvest Date** to ensure freshness.
-   User increases quantity to **10 kg** using the selector.
-   User clicks **"Add to Cart"**.

### Backend Logic
-   **Stock Check:** Validates if `requested_qty <= available_stock`.
-   **Cart Management:** Creates or updates a temporary `Cart` session for the user with `productId` and `quantity`.

---

## Page 3: Cart & Logistics Review

**Context:** User reviews the items and sees the total cost including logistics.

### UI Elements
-   **Order List:** Summary of items (Tomato x 10kg = ₹250).
-   **Logistics Section:**
    -   "Delivery Partner: AgroLogistics".
    -   **Delivery Cost:** Calculated field (e.g., "₹40" based on 5km distance).
    -   "Est. Delivery: Today, 6 PM".
-   **Bill Summary:**
    -   Item Total: ₹250
    -   Delivery: ₹40
    -   **Grand Total: ₹290**
-   **Primary Button:** "Proceed to Checkout".

### User Action
-   User checks the **Grand Total**.
-   User clicks **"Proceed to Checkout"**.

### Backend Logic
-   **Distance Calculation:** Calculates distance between `Farmer.location` and `Buyer.location` using Google Maps API / Haversine formula.
-   **Cost Engine:** Applies logic: `Base Fee + (Rate_Per_Km * Distance) * Weight_Factor`.

---

## Page 4: Secure Checkout (Payment)

**Context:** User selects delivery location and payment method securely.

### UI Elements
-   **Address Section:** Map snippet showing a Pin at the user's location. Option to "Change Address".
-   **Payment Modes:** Radio buttons:
    -   UPI (GPay/PhonePe) - *Recommended*.
    -   Credit/Debit Card.
    -   Cash on Delivery (COD).
-   **Trust Badge:** "🛡️ **Escrow Protection**: Your money is held safely until you confirm delivery."
-   **Primary Button:** "Pay ₹290" (or "Confirm Order" for COD).

### User Action
-   User confirms the **Address Pin**.
-   User selects **UPI** as payment mode.
-   User reads the **Escrow Note** and feels secure.
-   User clicks **"Pay ₹290"**.

### Backend Logic
-   **Order Creation:** Creates `Order` record with status `Pending`.
-   **Payment Gateway:** Initiates transaction (e.g., Razorpay/Stripe).
-   **Escrow Logic:** Flags funds as `Held` in the financial ledger, not immediately transferred to the farmer.

---

## Page 5: Order Confirmation (Success)

**Context:** Transaction is successful, and the order is placed.

### UI Elements
-   **Animation:** Large Green Checkmark animation.
-   **Success Message:** "Order Placed Successfully!"
-   **Order Details:** "Order ID: #ORD-98765".
-   **Action Buttons:**
    -   **"Track Shipment"**: Links to a live map view.
    -   **"Chat with Farmer"**: Opens a chat window.
    -   "Continue Shopping".

### User Action
-   User sees the **Success Tick**.
-   User clicks **"Track Shipment"** to see where the driver is.

### Backend Logic
-   **Notification:** Sends push notifications to:
    -   **Farmer:** "New Order Received! Pack 10kg Tomatoes."
    -   **Buyer:** "Order Confirmed."
-   **Inventory Update:** Deducts 10kg from Farmer's stock (`Product.stock = Product.stock - 10`).
-   **Logistics Dispatch:** Triggers a job for the delivery partner.
