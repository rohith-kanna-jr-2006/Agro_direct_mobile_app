# AI Order Flow Logic & Requirements

## 1. Natural Language Processing (NLP) Logic

### Intent & Entity Extraction (JSON Structure)

When the user says: *"I need 50kg of Tomatoes delivered to Madurai"*

The AI processes this input and generates the following JSON structure:

```json
{
  "intent": "purchase_order",
  "confidence_score": 0.98,
  "entities": {
    "product": {
      "value": "Tomato",
      "canonical": "tomato",
      "type": "vegetable",
      "confidence": 0.99
    },
    "quantity": {
      "value": 50,
      "unit": "kg",
      "normalized_value": 50.0,
      "confidence": 0.97
    },
    "location": {
      "value": "Madurai",
      "type": "city",
      "coordinates": { "lat": 9.9252, "lng": 78.1198 },
      "confidence": 0.95
    }
  },
  "missing_slots": [
    "quality_grade", 
    "payment_mode"
  ],
  "context": {
    "user_id": "usr_12345",
    "language": "ta-IN" 
  }
}
```

### Language Translation Logic

**Objective:** Enable seamless communication in local languages (e.g., Tamil).

**Flow:**
1.  **Input (Audio)**: User speaks in Tamil.
2.  **Speech-to-Text (STT)**: Convert Tamil Audio -> Tamil Text. 
    *   *Service: Google STT / OpenAI Whisper*
3.  **Translation (Input)**: Translate Tamil Text -> English Text.
    *   *Service: Google Translate API / DeepL*
    *   *Example: "எனக்கு 50 கிலோ தக்காளி மதுரைக்கு வேண்டும்" -> "I need 50kg of tomatoes delivered to Madurai."*
4.  **NLP Processing**: Analyze English Text -> Extract Intents & Entities (as per JSON above).
5.  **Logic Core**: Determine next step (e.g., Ask for Grade).
6.  **Response Generation**: Generate English Response.
    *   *Example: "Sure! Do you want Grade A (₹20/kg) or Grade B (₹15/kg)?"*
7.  **Translation (Output)**: Translate English Response -> Tamil Text.
    *   *Example: "நிச்சயமாக! உங்களுக்கு தரம் A (₹20/கிலோ) அல்லது தரம் B (₹15/கிலோ) வேண்டுமா?"*
8.  **Text-to-Speech (TTS)**: Convert Tamil Text -> Tamil Audio.
    *   *Service: Google TTS / Amazon Polly*
9.  **Output (Audio)**: Play Tamil Audio to user.

---

## 2. Chat UI Design (Requirements)

*   **Component Name**: `ChatScreen`
*   **Microphone Button**: Prominently placed at the bottom center.
*   **Bubbles**:
    *   *User*: Right-aligned, distinct color (e.g., Primary Green).
    *   *AI Bot*: Left-aligned, neutral background (e.g., Light Gray/White).
*   **Quick Reply Chips**: Horizontal scrollable list above the input area.
    *   *Example Content*: [Grade A] [Grade B], [UPI] [COD].

---

## 3. State Management (Pseudo-code)

A finite state machine tracks the conversation progress.

```typescript
// Define States
enum OrderState {
  IDLE = "IDLE",
  LISTENING = "LISTENING", 
  PROCESSING_INTENT = "PROCESSING_INTENT",
  AWAITING_QUALITY = "AWAITING_QUALITY",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  CONFIRMATION = "CONFIRMATION",
  PLACED = "PLACED"
}

// State Machine Logic
class OrderStateMachine {
  currentState = OrderState.IDLE;
  orderData = {};

  transition(action, payload) {
    switch (this.currentState) {
      case OrderState.IDLE:
        if (action === "USER_SPEAKS") {
          this.currentState = OrderState.PROCESSING_INTENT;
          this.processInput(payload);
        }
        break;

      case OrderState.PROCESSING_INTENT:
        if (payload.missing_slots.includes("quality_grade")) {
          this.currentState = OrderState.AWAITING_QUALITY;
          this.reply("Please select a quality grade.");
        }
        break;

      case OrderState.AWAITING_QUALITY:
        if (action === "SELECT_GRADE") {
          this.orderData.grade = payload.grade;
          this.currentState = OrderState.AWAITING_PAYMENT;
          this.calculateTotal();
          this.reply("Total is ₹1000. Payment mode?");
        }
        break;

      case OrderState.AWAITING_PAYMENT:
        if (action === "SELECT_PAYMENT") {
          this.orderData.payment = payload.payment;
          this.currentState = OrderState.CONFIRMATION; // Or directly PLACED
          this.placeOrder();
        }
        break;
        
      case OrderState.CONFIRMATION:
        this.currentState = OrderState.PLACED;
        this.reply("Order Placed Successfully!");
        break;
    }
  }
}
```
