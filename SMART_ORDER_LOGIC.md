# Smart Order Logic & NLP Structure

## 1. Intent & Entity Detection (JSON Model)

When the user enters text, the backend (or local logic) analyzes it to extract the **Intent** and **Entities**.

### JSON Structure

```json
{
  "intent": "create_order",
  "confidence": 0.95,
  "entities": {
    "location_entity": {
      "value": "Madurai", 
      "detected": true  
    },
    "product_entity": {
      "value": "Tomato", 
      "variant": "Grade A",
      "detected": true
    },
    "quantity_entity": {
      "value": 50, 
      "unit": "kg", 
      "detected": true
    },
    "payment_method": {
      "value": "UPI", 
      "detected": true
    }
  },
  "missing_slots": [] 
}
```

### Slot Filling Logic (Node.js Example)

The logic checks for missing required fields ("Slots") and transitions the state accordingly.

```javascript
function processOrder(userState, userInput) {
    // 1. Extract Entities from Input
    const extracted = extractEntities(userInput);
    
    // 2. Merge with existing state
    userState = { ...userState, ...extracted };

    // 3. Check for Missing Slots
    if (!userState.location) {
        return {
            response: "Which location do you want delivery to?",
            next_step: "SELECT_LOCATION",
            suggestions: ["Madurai", "Chennai", "Trichy"]
        };
    }

    if (!userState.product) {
        // Fetch products available in the selected location
        const availableProducts = getProductsForLocation(userState.location);
        return {
            response: `In ${userState.location}, we have the following. Which one?`,
            next_step: "SELECT_PRODUCT",
            suggestions: availableProducts.map(p => p.name) // e.g., ["Tomatoes", "Onions"]
        };
    }

    if (!userState.quantity) {
        return {
            response: "How many kg?",
            next_step: "SELECT_QUANTITY",
            suggestions: ["10kg", "50kg", "100kg"]
        };
    }

    if (!userState.payment) {
        return {
            response: "Payment via UPI or Cash?",
            next_step: "SELECT_PAYMENT",
            suggestions: ["UPI", "Cash"]
        };
    }

    // 4. All Slots Filled -> Confirmation
    return {
        response: `Order Summary: ${userState.quantity}kg ${userState.product} to ${userState.location}. Confirm?`,
        next_step: "CONFIRM_ORDER",
        suggestions: ["Confirm", "Cancel"]
    };
}
```

## 3. State Management (Client-Side Pseudo-code)

```javascript
/* State Machine tracking the conversation flow */

// Initial State
let state = {
   step: "IDLE", 
   data: {} 
};

function onMessageReceived(msg) {
    if (state.step === "IDLE") {
        // Analyze NLP
        state.data = parseNLP(msg); 
        
        if (hasAllSlots(state.data)) {
            state.step = "CONFIRM_ORDER";
            showConfirmation(state.data);
        } else {
            // Trigger first missing slot
            state.step = determineNextStep(state.data);
            showChips(state.step);
        }
    } 
    
    else if (state.step === "SELECT_LOCATION") {
        state.data.location = msg; 
        state.step = "SELECT_PRODUCT"; 
        // Fetch and show product chips...
    }
    
    // ... handle other steps similarly
}
```
