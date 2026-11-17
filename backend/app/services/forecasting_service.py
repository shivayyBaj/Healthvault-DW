import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings

# Suppress statsmodels warnings for clean API output
warnings.filterwarnings("ignore")

def generate_timeseries_data(days=730, base_volume=50):
    """Generate synthetic daily admission data with trend and weekly seasonality"""
    np.random.seed(42)
    dates = [datetime.today() - timedelta(days=x) for x in range(days)]
    dates.reverse()
    
    data = []
    trend = 0
    for i, d in enumerate(dates):
        # Linear trend
        trend += 0.05
        
        # Weekly seasonality (higher on Mondays, lower on weekends)
        day_of_week = d.weekday()
        if day_of_week == 0:  # Monday
            seasonality = 15
        elif day_of_week >= 5: # Weekend
            seasonality = -10
        else:
            seasonality = 5
            
        noise = np.random.normal(0, 5)
        
        admissions = int(max(0, base_volume + trend + seasonality + noise))
        
        data.append({
            "date": d.strftime("%Y-%m-%d"),
            "admissions": admissions
        })
        
    return pd.DataFrame(data)

def perform_forecasting(aggregation="day", history_days=365, horizon=30, order=(5,1,0)):
    try:
        from statsmodels.tsa.arima.model import ARIMA
        from sklearn.metrics import mean_absolute_error, mean_squared_error
    except ImportError:
        return {"error": "statsmodels or scikit-learn is not installed."}

    # Generate data
    df = generate_timeseries_data(days=max(history_days + 100, 730))
    df['date'] = pd.to_datetime(df['date'])
    
    # Filter historical data
    cutoff_date = datetime.today()
    start_date = cutoff_date - timedelta(days=history_days)
    df = df[(df['date'] >= start_date) & (df['date'] <= cutoff_date)].copy()
    
    # Aggregate if weekly
    if aggregation == "week":
        # Group by week starting Monday
        df = df.resample('W', on='date').sum().reset_index()
        # Adjust horizon logic (if user asked for 30 periods, it's 30 weeks. If user meant 30 days but aggregated weekly, we need 4 weeks)
        # We will assume horizon is the number of periods in the chosen aggregation.
        
    df.set_index('date', inplace=True)
    ts = df['admissions']
    
    if len(ts) < 10:
        return {"error": "Not enough historical data points for forecasting."}
        
    # Fit ARIMA
    try:
        model = ARIMA(ts, order=order)
        fitted_model = model.fit()
    except Exception as e:
        # Fallback to simpler model if it fails
        model = ARIMA(ts, order=(1,0,0))
        fitted_model = model.fit()
        order = (1,0,0)
        
    # In-sample predictions (skip first 'd' elements due to differencing)
    in_sample = fitted_model.predict(start=ts.index[1], end=ts.index[-1])
    
    # Align ts and in_sample for metrics
    ts_eval = ts.loc[in_sample.index]
    
    mae = mean_absolute_error(ts_eval, in_sample)
    rmse = np.sqrt(mean_squared_error(ts_eval, in_sample))
    
    # Out-of-sample forecast
    forecast_obj = fitted_model.get_forecast(steps=horizon)
    forecast_mean = forecast_obj.predicted_mean
    conf_int = forecast_obj.conf_int(alpha=0.05) # 95% CI
    
    # Prepare payload
    history_data = []
    for idx, val in ts.items():
        history_data.append({
            "date": idx.strftime("%Y-%m-%d"),
            "actual": float(val),
            "predicted": float(in_sample.get(idx, None)) if idx in in_sample.index else None
        })
        
    forecast_data = []
    for i, (idx, val) in enumerate(forecast_mean.items()):
        lower = float(conf_int.iloc[i, 0])
        upper = float(conf_int.iloc[i, 1])
        forecast_data.append({
            "date": idx.strftime("%Y-%m-%d"),
            "forecast": float(val),
            "lower_bound": max(0, lower),
            "upper_bound": max(0, upper)
        })
        
    # Validation data for table (last 5 points)
    eval_table = []
    for idx in ts_eval.index[-5:]:
        actual = float(ts_eval.loc[idx])
        pred = float(in_sample.loc[idx])
        eval_table.append({
            "date": idx.strftime("%Y-%m-%d"),
            "actual": actual,
            "predicted": pred,
            "error": actual - pred
        })
        
    return {
        "metrics": {
            "mae": float(mae),
            "rmse": float(rmse),
            "order": order,
            "aic": float(fitted_model.aic)
        },
        "history": history_data,
        "forecast": forecast_data,
        "eval_table": eval_table,
        "disclaimer": "This is an exploratory academic forecasting module. Predictions are based on simplified synthetic data and should not be used for actual operational planning."
    }
