import pandas as pd
import numpy as np
import argparse
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, roc_curve
import statsmodels.api as sm
import matplotlib.pyplot as plt

# Parse command-line arguments
parser = argparse.ArgumentParser(description="Run logistic regression on a user-specified CSV file.")
parser.add_argument("csv_file", type=str, help="Path to the input CSV file")
args = parser.parse_args()

# Load data
print("Loading final_data...")
final_data = pd.read_csv(args.csv_file)
print("Data loaded successfully from:", args.csv_file)
print("First few rows:")
print(final_data.head())

# Convert categorical variables to factors
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

for col, mapping in factor_mappings.items():
    if col in final_data.columns:
        final_data[col] = final_data[col].map(mapping).astype("category")

print("Categorical variables converted. Sample data:")
print(final_data.head())

# Convert continuous variables to numeric
num_cols = ["Prior births now living", "Prior births now dead", "Number of Prenatal Visits", 
            "Cigarettes before pregnancy", "1st Tri Cigarettes", "2nd Tri Cigarettes", 
            "3rd Tri Cigarettes", "Weight gain", "Interval Since Last Live Birth"]
for col in num_cols:
    if col in final_data.columns:
        final_data[col] = pd.to_numeric(final_data[col], errors='coerce')

print("Continuous variables converted to numeric. Checking for NaNs:")
print(final_data.isnull().sum())

# Create binary variable for delivery method
final_data['Delivery_Method_Binary'] = (final_data['Delivery Method'] == "VBAC").astype(int)

# One-hot encode before splitting
final_data = pd.get_dummies(final_data, drop_first=True)
print("Data after one-hot encoding. Sample data:")
print(final_data.head())

# Split data into training and testing sets
train_data, test_data = train_test_split(final_data, test_size=0.3, random_state=123)
print("Data split into training and test sets.")

# Define independent variables
predictors = [col for col in train_data.columns if col != 'Delivery_Method_Binary']

X_train = train_data[predictors]
y_train = train_data['Delivery_Method_Binary']
X_test = test_data[predictors]
y_test = test_data['Delivery_Method_Binary']

# Debug: Print data types and check for constant columns
print("Checking X_train column types:")
print(X_train.dtypes)
print("Checking y_train NaN count:")
print(y_train.isnull().sum())

# Remove constant columns (zero variance)
constant_cols = [col for col in X_train.columns if X_train[col].nunique() == 1]
if constant_cols:
    print("Removing constant columns:", constant_cols)
    X_train = X_train.drop(columns=constant_cols)
    X_test = X_test.drop(columns=constant_cols, errors='ignore')

# Ensure all predictor columns are numeric
X_train = X_train.astype(int)
X_test = X_test.astype(int)

# Drop NaN rows (if any remain)
X_train = X_train.dropna()
y_train = y_train.loc[X_train.index]
X_test = X_test.dropna()
y_test = y_test.loc[X_test.index]

# Check for collinearity (highly correlated features)
corr_matrix = X_train.corr().abs()
high_corr_pairs = [(i, j) for i in corr_matrix.columns for j in corr_matrix.columns if i != j and corr_matrix.loc[i, j] > 0.95]
if high_corr_pairs:
    print("Warning: Highly correlated features detected:", high_corr_pairs)
    cols_to_remove = list(set(j for i, j in high_corr_pairs))
    print("Removing highly correlated columns:", cols_to_remove)
    X_train = X_train.drop(columns=cols_to_remove)
    X_test = X_test.drop(columns=cols_to_remove, errors='ignore')

# Fit logistic regression model
print("Fitting logistic regression model...")
logistic_model = sm.Logit(y_train, sm.add_constant(X_train)).fit()
print(logistic_model.summary())

# Predict probabilities on the test dataset
predicted_probabilities = logistic_model.predict(sm.add_constant(X_test))

# Debug: Check predicted probabilities and y_test
print("Predicted probabilities sample:", predicted_probabilities[:10])
print("y_test sample:", y_test[:10])
print("Lengths - y_test:", len(y_test), ", predicted_probabilities:", len(predicted_probabilities))

# Check for NaNs
print("Are there NaNs in predicted_probabilities?", np.any(np.isnan(predicted_probabilities)))
print("Are there NaNs in y_test?", np.any(np.isnan(y_test)))

# Calculate AUROC
auc_value = roc_auc_score(y_test, predicted_probabilities)
print(f"AUROC: {auc_value}")

# Plot ROC curve
fpr, tpr, _ = roc_curve(y_test, predicted_probabilities)
plt.figure()
plt.plot(fpr, tpr, label=f'ROC curve (area = {auc_value:.2f}')
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.legend(loc="lower right")
plt.show()

# Perform cross-validation
logistic_reg = LogisticRegression(max_iter=500, solver='liblinear')
scores = cross_val_score(logistic_reg, X_train, y_train, cv=5, scoring='roc_auc')
print(f"Cross-validated AUROC: {np.mean(scores)}")
