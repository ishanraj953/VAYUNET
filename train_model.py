"""
Train a RandomForest on air_pollution_50000_rows.csv and save model.pkl
Saves a dict with keys: 'model', 'target_encoder', 'features'
"""
import pickle
import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split

DATA_PATH = 'air_pollution_50000_rows.csv'
OUT_PATH = 'model.pkl'

if not os.path.exists(DATA_PATH):
    print(f'Data file not found: {DATA_PATH}')
    raise SystemExit(1)

print('Loading data...')
df = pd.read_csv(DATA_PATH)
df = df.drop_duplicates()
if 'date' in df.columns:
    df['date'] = pd.to_datetime(df['date'], errors='coerce')

# Define candidate features and target
candidate_features = ["PM2_5","PM10","NO2","SO2","CO","temperature","humidity","wind_speed","traffic_density","AQI"]
features = [c for c in candidate_features if c in df.columns]

if 'risk_level' not in df.columns:
    print("ERROR: 'risk_level' column not found in dataset. Cannot train.")
    raise SystemExit(2)

print('Preparing features...')
X = df[features].copy()
y = df['risk_level'].astype(str).copy()

# Encode categorical feature traffic_density if present
encoders = {}
if 'traffic_density' in X.columns:
    le_td = LabelEncoder()
    X['traffic_density'] = le_td.fit_transform(X['traffic_density'].astype(str))
    encoders['traffic_density'] = le_td

# Impute numeric columns
num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
if num_cols:
    X[num_cols] = SimpleImputer(strategy='median').fit_transform(X[num_cols])

# Encode target
le = LabelEncoder()
y_enc = le.fit_transform(y)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42, stratify=y_enc)

print('Training RandomForest...')
rf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

# Basic evaluation
acc = rf.score(X_test, y_test)
print(f'Test accuracy: {acc:.4f}')

# Save model artifact (dict)
artifact = {'model': rf, 'target_encoder': le, 'features': features, 'feature_encoders': encoders}
with open(OUT_PATH, 'wb') as f:
    pickle.dump(artifact, f)

print(f'Model saved to {OUT_PATH}')
