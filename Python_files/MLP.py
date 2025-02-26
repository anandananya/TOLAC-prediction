import pandas as pd
import numpy as np
import argparse
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_class_weight
from sklearn.inspection import permutation_importance
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, LeakyReLU, Input
from tensorflow.keras.regularizers import l2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
import matplotlib.pyplot as plt

# Parse command-line arguments
parser = argparse.ArgumentParser(description="Run Neural Network on a user-specified CSV file.")
parser.add_argument("csv_file", type=str, help="Path to the input CSV file")
args = parser.parse_args()

# Load data
print("📂 Loading final_data...")
final_data = pd.read_csv(args.csv_file)
print("✅ Data loaded successfully from:", args.csv_file)

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

# Convert continuous variables to numeric
num_cols = ["Prior births now living", "Prior births now dead", "Number of Prenatal Visits", 
            "Cigarettes before pregnancy", "1st Tri Cigarettes", "2nd Tri Cigarettes", 
            "3rd Tri Cigarettes", "Weight gain", "Interval Since Last Live Birth"]
for col in num_cols:
    if col in final_data.columns:
        final_data[col] = pd.to_numeric(final_data[col], errors='coerce')

# Create binary target variable
final_data['Delivery_Method_Binary'] = (final_data['Delivery Method'] == "VBAC").astype(int)

# One-hot encode categorical variables
final_data = pd.get_dummies(final_data, drop_first=True)

# Print dataset diagnostics
print("📊 Dataset Shape:", final_data.shape)
print("📊 Class Distribution:", final_data['Delivery_Method_Binary'].value_counts(normalize=True).to_dict())

# Remove highly correlated features (>0.95)
corr_matrix = final_data.corr().abs()
upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
to_drop = [column for column in upper.columns if any(upper[column] > 0.95)]

if to_drop:
    print(f"⚠️ Removing {len(to_drop)} highly correlated features: {to_drop}")
    final_data = final_data.drop(columns=to_drop)

# Train-test split (Use 80% for training instead of just 7K samples)
train_data, test_data = train_test_split(final_data, test_size=0.2, random_state=123, stratify=final_data['Delivery_Method_Binary'])

X_train = train_data.drop(columns=['Delivery_Method_Binary'])
y_train = train_data['Delivery_Method_Binary']
X_test = test_data.drop(columns=['Delivery_Method_Binary'])
y_test = test_data['Delivery_Method_Binary']

# Standardize features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Compute class weights
classes = np.array([0, 1])
class_weights = compute_class_weight('balanced', classes=classes, y=y_train.to_numpy())
class_weight_dict = {0: class_weights[0], 1: class_weights[1]}

# Early stopping
early_stopping = EarlyStopping(monitor='val_auc', patience=5, restore_best_weights=True, mode='max')

# Build MLP model
model = Sequential([
    Input(shape=(X_train.shape[1],)),  
    Dense(128, kernel_regularizer=l2(0.0001)),
    BatchNormalization(),
    LeakyReLU(),
    Dropout(0.4),
    Dense(64, kernel_regularizer=l2(0.0001)),
    BatchNormalization(),
    LeakyReLU(),
    Dropout(0.3),
    Dense(32, kernel_regularizer=l2(0.0001)),
    BatchNormalization(),
    LeakyReLU(),
    Dense(1, activation='sigmoid')
])

# Train model
model.compile(optimizer=Adam(learning_rate=0.0001), loss='binary_crossentropy', metrics=['AUC'])
history = model.fit(X_train, y_train, validation_data=(X_test, y_test),
                    epochs=60, batch_size=256, class_weight=class_weight_dict, callbacks=[early_stopping], verbose=1)

# Evaluate model
test_loss, test_auc = model.evaluate(X_test, y_test)
print(f"\n📊 Test AUROC: {test_auc:.4f}")

# Plot loss curves
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.legend()
plt.title("Loss Over Epochs")
plt.show()
