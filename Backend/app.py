import os
import numpy as np
import librosa
import tensorflow as tf
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask
app = Flask(__name__)
CORS(app)  # Allow CORS for frontend requests

from tensorflow.keras.layers import Layer
import tensorflow.keras.backend as K

class Attention(Layer):
    def build(self, input_shape):
        self.W = self.add_weight(name='att_weight', shape=(input_shape[-1], 1),
                                 initializer='glorot_uniform', trainable=True)
        self.b = self.add_weight(name='att_bias', shape=(input_shape[1], 1),
                                 initializer='zeros', trainable=True)
        super().build(input_shape)

    def call(self, x):
        e = K.tanh(K.dot(x, self.W) + self.b)
        a = K.softmax(e, axis=1)
        output = x * a
        return K.sum(output, axis=1)


# Load the model and label encoder
model = tf.keras.models.load_model("esc50_crnn_model.h5", custom_objects={"Attention": Attention})
with open("label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)

# Audio preprocessing
def extract_features(path):
    y, sr = librosa.load(path, sr=22050)
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    log_S = librosa.power_to_db(S, ref=np.max)
    log_S = librosa.util.fix_length(log_S, size=216, axis=1)
    log_S = librosa.util.normalize(log_S)
    return log_S.T[..., np.newaxis][np.newaxis, ...]  # shape: (1, 216, 128, 1)

@app.route("/predict", methods=["POST"])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    temp_path = "temp.wav"
    file.save(temp_path)

    try:
        features = extract_features(temp_path)
        preds = model.predict(features)[0]
        class_idx = np.argmax(preds)
        label = label_encoder.inverse_transform([class_idx])[0]
        confidence = float(preds[class_idx])
        os.remove(temp_path)  # Clean up

        return jsonify({
            "label": label,
            "confidence": confidence
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
