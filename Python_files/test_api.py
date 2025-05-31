import requests
import json

# Sample test data that matches our form fields
test_data = {
    "Mother's Age": 30,
    "Prior Births Now Living": 1,
    "Prior Births Now Dead": 0,
    "Interval Since Last Live Birth": 24,
    "Number of Prenatal Visits": 12,
    "Pre-pregnancy BMI": 25,
    "Weight Gain": 25,
    "Number of Previous Cesareans": 1,
    "Obstetric Estimate": 39,
    "Pre-pregnancy Diabetes": "No",
    "Gestational Diabetes": "No",
    "Pre-pregnancy HTN": "No",
    "Gestational HTN": "No",
    "Previous Preterm Birth": "No",
    "Mother's Race": "White",
    "Mother's Education": "Bachelors",
    "Payment Method": "Self-Pay"
}

def test_endpoint(url):
    print(f"\n🔍 Testing endpoint: {url}")
    print("\n📤 Sending test data:")
    print(json.dumps(test_data, indent=2))

    try:
        # Make the POST request to our prediction endpoint
        response = requests.post(url, json=test_data, timeout=5)
        
        print("\n📥 Response status code:", response.status_code)
        
        if response.ok:
            result = response.json()
            print("\n✅ Prediction result:")
            print(json.dumps(result, indent=2))
        else:
            print("\n❌ Error response:")
            print(json.dumps(response.json(), indent=2))
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Error: Could not connect to the server at {url}")
    except requests.exceptions.Timeout:
        print(f"\n❌ Error: Request timed out after 5 seconds")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

# Test both localhost and the IP address
test_endpoint('http://localhost:5001/predict')
test_endpoint('http://192.168.68.136:5001/predict') 