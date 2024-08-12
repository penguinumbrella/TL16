
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import sys
import joblib
from sqlalchemy import create_engine
import psycopg2

import os

# Change the current working directory
os.chdir('C:\\cpen491\\TL16-2\\TL16\\machine_learning')

print(os.listdir)

# Verify the current working directory
print(os.getcwd())

# Database connection details
DB_USERNAME = 'admin'
DB_PASSWORD = 'UBCParking2024'
DB_SERVER = 'testdb.cdq6s8s6klpd.ca-central-1.rds.amazonaws.com'
DB_NAME = 'Parking'

# Function to create a date range DataFrame
def create_date_range_df(start_date, end_date):
    date_range = pd.date_range(start=start_date, end=end_date, freq='H')
    df = pd.DataFrame(date_range, columns=['date'])
    return df
# Function to define Vancouver holidays
from pandas.tseries.holiday import (
    AbstractHolidayCalendar, DateOffset, GoodFriday, EasterMonday, Holiday, MO
)

class VancouverHolidayCalendar(AbstractHolidayCalendar):
    rules = [
        Holiday('New Years Day', month=1, day=1),
        Holiday('Family Day', month=2, day=1, offset=DateOffset(weekday=MO(3))),
        GoodFriday,
        EasterMonday,
        Holiday('Victoria Day', month=5, day=25, offset=DateOffset(weekday=MO(-1))),
        Holiday('Canada Day', month=7, day=1),
        Holiday('Labour Day', month=9, day=1, offset=DateOffset(weekday=MO(1))),
        Holiday('National Day for Truth and Reconciliation', month=9, day=30),
        Holiday('Thanksgiving', month=10, day=1, offset=DateOffset(weekday=MO(2))),
        Holiday('Remembrance Day', month=11, day=11),
        Holiday('Christmas Eve', month=12, day=24),
        Holiday('Christmas Day', month=12, day=25),
        Holiday('Boxing Day', month=12, day=26),
        Holiday('Additional Holiday 1', month=12, day=27),
        Holiday('Additional Holiday 2', month=12, day=28),
        Holiday('Additional Holiday 3', month=12, day=29),
        Holiday('Additional Holiday 4', month=12, day=30),
        Holiday('New Years Eve', month=12, day=31)
    ]

# Function to create features from the datetime index
def create_features(df):
    df = df.copy()
    df['date'] = df.index
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['day_of_year'] = df['date'].dt.dayofyear
    df['week_of_year'] = df['date'].dt.isocalendar().week
    df['hour'] = df['date'].dt.hour
    weight = 100
    df['weighted_day_of_year'] = df['day_of_year'] * weight
    df['year'] = df['date'].dt.year
    df['is_month_start'] = df['date'].dt.is_month_start.astype(int)
    df['is_month_end'] = df['date'].dt.is_month_end.astype(int)
    df['sin_hour'] = np.sin(2 * np.pi * df['hour'] / 24)
    df['cos_hour'] = np.cos(2 * np.pi * df['hour'] / 24)
    df['sin_day'] = np.sin(2 * np.pi * df['day_of_year'] / 365.25)
    df['cos_day'] = np.cos(2 * np.pi * df['day_of_year'] / 365.25)
    df['sin_week'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
    df['cos_week'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
    df['sin_month'] = np.sin(2 * np.pi * df['month'] / 12)
    df['cos_month'] = np.cos(2 * np.pi * df['month'] / 12)
    df['is_day'] = np.where((df['hour'] >= 6) & (df['hour'] <= 18), 1, 0)
    df['day_duration'] = np.where(df['is_day'] == 1, 12 - df['hour'], 0)
    df['night_duration'] = np.where(df['is_day'] == 0, df['hour'], 0)
    return df
import pandas as pd

def create_day_lag(df):
    # Load data from CSV file
    data_file = 'C:/cpen491/TL16-2/TL16/machine-learning/hourly_parkade_data.csv'
    lag_data = pd.read_csv(data_file)
    
    # Convert the 'Timestamp' column to datetime and set it as the index
    lag_data['Timestamp'] = pd.to_datetime(lag_data['Timestamp'])
    lag_data.set_index('Timestamp', inplace=True)
    
    # Ensure that 'df' has a datetime index
    df.index = pd.to_datetime(df.index)
    
    # Sort the DataFrame by index to ensure correct lag calculation
    df.sort_index(inplace=True)
    
    print(df)
    # Merge the two DataFrames to ensure we have aligned timestamps
    df = df.merge(lag_data[['North']], left_index=True, right_index=True, suffixes=('', '_lag'))
    
    
    
    # Create lagged columns for each day in the past week
    for i in range(1, 7):
        df[f'lag_{i}_day_Occupancy'] = df['North'].shift(i * 24)
    
    # Drop rows where any lagged values are NaN
    #df.dropna(inplace=True)
    
    # Drop the temporary 'North_lag' column
    df.drop(columns=['North'], inplace=True)
    
    return df


# Main script to generate the CSV file
import sys
def main():
    if len(sys.argv) != 1:
        print("Usage: shortterm_predict.py")
        sys.exit(1)
    
    # Ensure y_test has a DateTimeIndex
    now = datetime.now()
    next_hour = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)

    # Define end_date as 7 days from the next hour
    #start_date = next_hour
    #end_date = start_date + timedelta(days=7)
    
    start_date = pd.to_datetime("2024-08-01 01:00:00")
    end_date = start_date + timedelta(days=1)
    parkade = "North"
    
    df = create_date_range_df(start_date, end_date)

    
    df['term_date'] = False
    
    cal = VancouverHolidayCalendar()
    holidays = cal.holidays(start=df['date'].min(), end=df['date'].max())
    
    expanded_data = []
    processed_dates = set()
    
    if holidays.empty:
        df['is_holiday'] = False

    else:
        for holiday_date in holidays:
            date = holiday_date.date()
            if date not in processed_dates:
                for hour in range(0, 24):
                    expanded_data.append({'date': datetime.datetime.combine(date, datetime.time(hour))})
                processed_dates.add(date)
        
        expanded_df = pd.DataFrame(expanded_data)
        expanded_df = expanded_df[expanded_df['date'].dt.date.isin(holidays.date)]
        expanded_df.reset_index(drop=True, inplace=True)
        
        df['is_holiday'] = df['date'].isin(expanded_df['date'])
    
        
    df.set_index('date', inplace=True)
    X_test_df_2 = create_features(df)

    

    X_test_df_2 = create_day_lag(X_test_df_2)
    


    X_test_df_2 = X_test_df_2.drop(columns=['date'])

    print(X_test_df_2)

    # Load the trained model
    
    loaded_model = joblib.load(f'C:/cpen491/TL16-2/TL16/machine-learning/lgb_model_exports/1day/lgb_1day_North.pkl')

    # Print the input features for the loaded model
    print("Columns of X_test_df_2:")
    print(X_test_df_2.columns)
    print("\nInput features of the loaded model:")
    print(loaded_model.feature_name_)
    # Make predictions using the loaded model
    y_pred_loaded = loaded_model.predict(X_test_df_2)
    y_pred_loaded = np.maximum(y_pred_loaded, 0)

    print(y_pred_loaded)
    # Create a DataFrame with the predicted values
    #predictions_df = pd.DataFrame({'Predicted': y_pred_loaded})
    predictions_df = pd.DataFrame({'name': X_test_df_2.index, 'value': y_pred_loaded})
    #predictions_df.drop(columns=[''])
    # Set the date as the index
    predictions_df.set_index('name', inplace=True)

    # Save the DataFrame to a CSV file without the extra integer index column
    #predictions_df.to_csv('predictions.csv', index=True)

    # Plot the predicted values without showing the x-axis
    plt.figure(figsize=(12, 6))
    plt.plot(predictions_df['value'], label='Occupancy', color='red')
    plt.xlabel('Date')
    plt.ylabel('Predicted Values')
    plt.title('Predicted Values')
    plt.legend()

    # Hide the x-axis labels
    plt.xticks([])
    plt.show()
    
    output_filename = f'1WEEKLONG_{parkade}.csv'
    predictions_df.to_csv(output_filename)
    print(f"CSV file saved as {output_filename}")

if __name__ == "__main__":
    main()

