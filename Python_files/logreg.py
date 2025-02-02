import pandas as pd
import numpy as np
import statsmodels.api as sm
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, roc_curve, auc
import matplotlib.pyplot as plt
import os

# Define the years to process
years = list(range(2017, 2024))

for year in years:
    file_path = f"csv_files/natality_{year}.csv"
    
    if os.path.exists(file_path):
        print(f"Processing Year: {year}")

        # Load the data
        df = pd.read_csv(file_path)
        print(df.columns)

        # Convert categorical variables to factors
        categorical_cols = ["Birth Place", "Mother's Race/Hispanic", "Mother's Education",
                            "TOLAC Attempted (if cesarean)", "Delivery Method", "Payment"]
        for col in categorical_cols:
            if col in df.columns:
                df[col] = df[col].astype("category")

        # Convert numerical columns to numeric dtype
        numeric_cols = ["Prior Births Now Living", "Prior Births Now Dead", "Interval Since Last Live Birth",
                        "Number of Prenatal Visits", "Cigarettes Before Pregnancy", "1st Tri Cigarettes", 
                        "2nd Tri Cigarettes", "3rd Tri Cigarettes", "Pre-pregnancy BMI", "Weight Gain"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')

        # Convert Delivery Method to a binary outcome variable
        df["Delivery_Method_Binary"] = np.where(df["Delivery Method"] == "VBAC", 1, 0)

        # Define features and target variable
        features = ["Birth Place", "Mother's Age", "Mother's Race/Hispanic", "Mother's Education",
                    "Prior Births Now Living", "Prior Births Now Dead", "Interval Since Last Live Birth",
                    "Number of Prenatal Visits", "Cigarettes Before Pregnancy", "1st Tri Cigarettes", 
                    "2nd Tri Cigarettes", "3rd Tri Cigarettes", "Pre-pregnancy BMI", "Weight Gain", 
                    "Pre-pregnancy Diabetes", "Gestational Diabetes", "Pre-pregnancy HTN", "Gestational HTN", 
                    "Previous Preterm Birth", "Previous Cesarean", "Number of Previous Cesareans", "Gonorrhea", 
                    "Syphilis", "Chlamydia", "Hep B", "Hep C", "Payment", "Plurality", "Obstetric Estimate"]
        X = df[features]
        y = df["Delivery_Method_Binary"]

        # Convert categorical variables to dummy variables
        X = pd.get_dummies(X, drop_first=True)

        # Ensure all columns are numeric
        X = X.apply(pd.to_numeric, errors='coerce')
        y = pd.to_numeric(y, errors='coerce')

        # Handle missing values
        X.fillna(0, inplace=True)
        y.fillna(0, inplace=True)

        # Ensure data types are numeric
        X = X.astype(float)
        y = y.astype(float)
        
        # Drop any remaining non-numeric columns
        X = X.select_dtypes(include=[np.number])

        # Check data balance
        print("y_train value counts before splitting:")
        print(y.value_counts())

        # Ensure at least some positive cases exist in y
        if len(y.unique()) == 1:
            print(f"Skipping Year {year} - Only one class present in y.")
            continue

        # Split the dataset into training (70%) and testing (30%)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=123)

        # Add a constant for logistic regression
        X_train = sm.add_constant(X_train, has_constant='add')
        X_test = sm.add_constant(X_test, has_constant='add')

        # Fit the logistic regression model
        logit_model = sm.Logit(y_train, X_train)
        result = logit_model.fit()
        print(result.summary())

        # Predict probabilities on the test dataset
        y_pred_probs = result.predict(X_test)

        # Compute AUROC
        roc_auc = roc_auc_score(y_test, y_pred_probs)
        print(f"Year {year} - AUC Score: {roc_auc:.4f}")

        # Plot ROC Curve
        fpr, tpr, _ = roc_curve(y_test, y_pred_probs)
        plt.figure()
        plt.plot(fpr, tpr, color='blue', lw=2, label=f'Year {year} - ROC curve (area = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], color='grey', linestyle='--')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title(f'Receiver Operating Characteristic (ROC) Curve - {year}')
        plt.legend(loc='lower right')
        plt.show()
    else:
        print(f"File for year {year} not found, skipping...")
