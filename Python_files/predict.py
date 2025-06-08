# Python_files/predict.py
from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model at startup
try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(os.path.dirname(current_dir), 'models', 'tolac_model.pkl')

    model_data = joblib.load(model_path)
    model = model_data['model']
    feature_names = model_data['feature_names']
    print("✅ Model loaded successfully!")
    print("Available features:", feature_names)
except Exception as e:
    print(f"❌ Error loading model: {str(e)}")
    print("Make sure you've run logreg.py first to create the model.")
    exit(1)

def preprocess_input(data):
    try:
        features = np.zeros(len(feature_names))
        feature_dict = {name: idx for idx, name in enumerate(feature_names)}

        numeric_fields = [
            "Mother's Age", "Prior Births Now Living", "Prior Births Now Dead",
            "Interval Since Last Live Birth", "Number of Prenatal Visits",
            "Pre-pregnancy BMI", "Weight Gain", "Number of Previous Cesareans",
            "Obstetric Estimate"
        ]
        for field in numeric_fields:
            if field in data and field in feature_dict:
                try:
                    features[feature_dict[field]] = float(data[field])
                except (ValueError, TypeError):
                    print(f"Warning: Could not convert {field} to float")

        binary_fields = [
            "Pre-pregnancy Diabetes", "Gestational Diabetes",
            "Pre-pregnancy HTN", "Gestational HTN", "Previous Preterm Birth"
        ]
        for field in binary_fields:
            field_features = [f for f in feature_names if field in f]
            if field in data and field_features:
                value = 1 if data[field] == "Yes" else 0
                for feature in field_features:
                    if feature in feature_dict:
                        features[feature_dict[feature]] = value

        categorical_mappings = {
            "Mother's Race": ["Asian", "Black", "NHOPI", "White", "Other"],
            "Mother's Education": ["Associate", "Bachelors", "College Credit", "Doctorate", "High School/GED", "Masters"],
            "Payment Method": ["Medicaid", "Self-Pay"]
        }
        for field, values in categorical_mappings.items():
            if field in data:
                value = data[field]
                for possible_value in values:
                    feature_name = f"{field}_{possible_value}"
                    if feature_name in feature_dict:
                        features[feature_dict[feature_name]] = 1 if value == possible_value else 0

        return features
    except Exception as e:
        raise ValueError(f"Error processing input data: {str(e)}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            print("❌ No data received")
            return jsonify({'error': 'No data provided'}), 400

        print("\n📥 Received data:")
        print(data)

        try:
            features = preprocess_input(data)
            print("\n✅ Preprocessed features:")
            print(features)
        except Exception as e:
            print(f"❌ Preprocessing error: {str(e)}")
            return jsonify({'error': f'Data preprocessing failed: {str(e)}'}), 400

        try:
            probability = model.predict_proba([features])[0][1]
            success_percentage = round(probability * 100, 1)
            risk_level = "Low" if probability >= 0.7 else "Medium" if probability >= 0.4 else "High"

            print(f"\n✅ Prediction successful: {success_percentage}% ({risk_level} Risk)")

            return jsonify({
                'success': True,
                'prediction': {
                    'probability': success_percentage,
                    'risk_level': risk_level,
                    'message': get_recommendation_message(success_percentage)
                }
            })
        except Exception as e:
            print(f"❌ Prediction error: {str(e)}")
            return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

    except Exception as e:
        print(f"❌ Server error: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

def get_recommendation_message(success_percentage):
    if success_percentage >= 70:
        return "Your chances for a successful VBAC are favorable. Consider discussing your birth plan with your healthcare provider."
    elif success_percentage >= 40:
        return "You have a moderate chance of VBAC success. Carefully weigh the benefits and risks with your healthcare team."
    else:
        return "Your VBAC success probability is lower than average. Please consult with your healthcare provider about the safest delivery option for you."

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print(f"\n🚀 Starting server on port {port}...")
    print("Press Ctrl+C to stop the server")
    app.run(host='0.0.0.0', port=port, debug=True)
