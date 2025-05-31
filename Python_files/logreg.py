import pandas as pd
import numpy as np
import argparse
import os
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, roc_curve
import statsmodels.api as sm
import matplotlib.pyplot as plt

# Parse command-line arguments
parser = argparse.ArgumentParser(description="Train and export logistic regression model.")
parser.add_argument("csv_file", type=str, help="Path to the input CSV file")
args = parser.parse_args()

# Load data
print("Loading data...")
data = pd.read_csv(args.csv_file)
print(f"Data loaded: {data.shape[0]} rows, {data.shape[1]} columns")

# Factor mappings
factor_mappings = {
    'Birth Place': {1: "Hospital", 2: "Freestanding birth center", 3: "Home (intended)", 
                    4: "Home (not)", 5: "Home (unknown)", 6: "Clinic", 7: "Other"},
    "Mother's Race/Hispanic": {1: "White", 2: "Black", 3: "AIAN", 4: "Asian", 5: "NHOPI", 
                                6: "multirace", 7: "Hispanic"},
    "Mother's Education": {1: "8th grade or less", 2: "9-12th grade", 3: "High school/GED", 
                            4: "College credit", 5: "Associate degree", 6: "Bachelor's", 
                            7: "Master's", 8: "Doctorate"},
    'TOLAC Attempted (if cesarean)': {'Y': "Y", 'X': "Not applicable"},
    'Delivery Method': {2: "VBAC", 4: "Repeat C-section"},
    'Payment': {1: "Medicaid", 2: "Private Insurance", 3: "Self-Pay", 4: "Indian Health Service", 
                5: "CHAMPUS/TRICARE", 6: "Other Gov", 8: "Other"}
}

# Convert categorical columns
for col, mapping in factor_mappings.items():
    if col in data.columns:
        data[col] = pd.Categorical(data[col].map(mapping))

# Convert numerical columns and handle missing values
numeric_cols = [
    "Prior births now living", "Prior births now dead", 
    "Number of Prenatal Visits", "Cigarettes before pregnancy",
    "1st Tri Cigarettes", "2nd Tri Cigarettes", "3rd Tri Cigarettes",
    "Weight gain", "Interval Since Last Live Birth"
]

for col in numeric_cols:
    if col in data.columns:
        # Convert to float and fill missing values with median
        data[col] = pd.to_numeric(data[col], errors='coerce')
        data[col] = data[col].fillna(data[col].median())

# Create binary outcome variable
data['Delivery_Method_Binary'] = (data['Delivery Method'] == "VBAC").astype(int)

# Select features for the model
feature_cols = [
    "Mother's Age",
    "Prior Births Now Living",
    "Prior Births Now Dead",
    "Interval Since Last Live Birth",
    "Number of Prenatal Visits",
    "Pre-pregnancy BMI",
    "Weight Gain",
    "Number of Previous Cesareans",
    "Obstetric Estimate",
    "Pre-pregnancy Diabetes",
    "Gestational Diabetes",
    "Pre-pregnancy HTN",
    "Gestational HTN",
    "Previous Preterm Birth",
    "Mother's Race/Hispanic",
    "Mother's Education",
    "Payment"
]

# Create feature matrix
X = data[feature_cols].copy()
y = data['Delivery_Method_Binary']

# Convert Yes/No columns to binary
binary_cols = [
    "Pre-pregnancy Diabetes",
    "Gestational Diabetes",
    "Pre-pregnancy HTN",
    "Gestational HTN",
    "Previous Preterm Birth"
]

for col in binary_cols:
    if col in X.columns:
        X[col] = (X[col] == 'Y').astype(int)

# One-hot encode categorical variables
categorical_cols = ["Mother's Race/Hispanic", "Mother's Education", "Payment"]
X = pd.get_dummies(X, columns=categorical_cols, drop_first=True)

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Drop constant columns
constant_cols = [col for col in X_train.columns if X_train[col].nunique() == 1]
X_train.drop(columns=constant_cols, inplace=True)
X_test.drop(columns=constant_cols, inplace=True)

# Convert to float64 to ensure compatibility
X_train = X_train.astype('float64')
X_test = X_test.astype('float64')
y_train = y_train.astype('float64')
y_test = y_test.astype('float64')

# Statsmodels summary
print("\n[Statsmodels Summary]")
X_train_sm = sm.add_constant(X_train)
logit_model = sm.Logit(y_train, X_train_sm).fit()
print(logit_model.summary())

# Sklearn training for export
print("\n[Fitting scikit-learn model for export]")
sk_model = LogisticRegression(max_iter=1000, solver="liblinear")
sk_model.fit(X_train, y_train)

# Save model and feature names
os.makedirs("models", exist_ok=True)
model_data = {
    'model': sk_model,
    'feature_names': X_train.columns.tolist()
}
joblib.dump(model_data, "models/tolac_model.pkl")
print("Model saved to models/tolac_model.pkl")

# Predict and AUC
pred_probs = sk_model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, pred_probs)
print(f"\n[Test Set AUROC: {auc:.4f}]")

# Plot ROC
plt.figure(figsize=(8, 6))
fpr, tpr, _ = roc_curve(y_test, pred_probs)
plt.plot(fpr, tpr, label=f'AUC = {auc:.2f}')
plt.plot([0, 1], [0, 1], 'k--')
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()

# Cross-validation
cv_scores = cross_val_score(sk_model, X_train, y_train, cv=5, scoring='roc_auc')
print(f"\nCross-validated AUROC: {np.mean(cv_scores):.4f} (+/- {np.std(cv_scores)*2:.4f})")
