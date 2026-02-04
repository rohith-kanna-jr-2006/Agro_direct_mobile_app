from flask import Flask, request, jsonify
# import tensorflow as tf # Commented out until user installs it
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing import image
import numpy as np
import os
import random

app = Flask(__name__)

# 1. Load the model ONCE when the server starts (Faster)
print("Loading AI Model...")
MODEL_PATH = '../crop_quality_model.h5'
class_names = ['Grade_A', 'Grade_B'] # Must match your training folder names

model = None
if os.path.exists(MODEL_PATH):
    try:
        import tensorflow as tf
        from tensorflow.keras.models import load_model
        model = load_model(MODEL_PATH)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Warning: Model file {MODEL_PATH} not found. Using mock predictions.")

def predict_image(img_path):
    if model:
        import tensorflow as tf
        from tensorflow.keras.preprocessing import image
        # Preprocess image to match training (180x180)
        img = image.load_img(img_path, target_size=(180, 180))
        img_array = image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0) # Create a batch
        img_array = img_array / 255.0  # Rescale like we did in training

        predictions = model.predict(img_array)
        score = tf.nn.softmax(predictions[0])
        
        predicted_class = class_names[np.argmax(score)]
        confidence = 100 * np.max(score)
        
        return predicted_class, confidence
    else:
        # Mock Prediction
        grade = random.choice(class_names)
        confidence = random.uniform(85, 99)
        return grade, confidence

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    filepath = os.path.join('temp', file.filename)
    file.save(filepath)
    
    try:
        grade, confidence = predict_image(filepath)
        # Clean up temp file
        os.remove(filepath)
        return jsonify({'quality': grade, 'confidence': f"{confidence:.2f}%"})
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs('temp', exist_ok=True)
    app.run(port=5001) # Runs on a different port than Node
