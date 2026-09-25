import pickle
import pandas as pd
import numpy as np
import os

p = 'model.pkl'
if not os.path.exists(p):
    print('model.pkl not found')
    raise SystemExit(1)
with open(p,'rb') as f:
    art = pickle.load(f)
model = art.get('model') if isinstance(art, dict) else art
print('Model type:', type(model))
# build a dummy X with zeros for numeric columns
if hasattr(model, 'feature_names_in_'):
    cols = list(model.feature_names_in_)
else:
    cols = ['PM2_5','PM10','NO2','SO2','CO','temperature','humidity','wind_speed','traffic_density','AQI']
print('Using cols:', cols)
X = pd.DataFrame([dict((c,0) for c in cols)])
print('X shape', X.shape)
try:
    pv = model.predict_proba(X)
    print('predict_proba ok, shape', getattr(pv,'shape',None))
except Exception as e:
    print('predict_proba raised:', type(e), e)
try:
    pred = model.predict(X)
    print('predict ok, pred:', pred)
except Exception as e:
    print('predict raised:', type(e), e)
