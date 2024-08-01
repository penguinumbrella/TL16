import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import datetime
import sys
import joblib

import os

# Change the current working directory
os.chdir('C:\\cpen491\\TL16\\app\\LightGBM\\longterm')

print(os.listdir)

# Verify the current working directory
print(os.getcwd())

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
    df['term_date'] = False
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

# Main script to generate the CSV file
def main():
    if len(sys.argv) != 4:
        print("Usage: longterm_predict.py <start_date> <end_date> <parkade>")
        sys.exit(1)
    
    start_date = sys.argv[1]
    end_date = sys.argv[2]
    parkade = sys.argv[3]
    
    df = create_date_range_df(start_date, end_date)
    
    cal = VancouverHolidayCalendar()
    holidays = cal.holidays(start=df['date'].min(), end=df['date'].max())
    
    expanded_data = []
    processed_dates = set()
    
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
    X_test_df_2 = X_test_df_2.drop(columns=['date'])

    # Load the trained model
    loaded_model = joblib.load(f'models/lgb_longterm_{parkade}.pkl')
    

    print(X_test_df_2.columns)
    # Make predictions using the loaded model
    y_pred_loaded = loaded_model.predict(X_test_df_2)
    y_pred_loaded = np.maximum(y_pred_loaded, 0)

    # Create a DataFrame with the predicted values
    #predictions_df = pd.DataFrame({'Predicted': y_pred_loaded})
    predictions_df = pd.DataFrame({'date': X_test_df_2.index, 'Predicted': y_pred_loaded})
    #predictions_df.drop(columns=[''])
    # Set the date as the index
    predictions_df.set_index('date', inplace=True)

    # Save the DataFrame to a CSV file without the extra integer index column
    #predictions_df.to_csv('predictions.csv', index=True)

    # Plot the predicted values without showing the x-axis
    plt.figure(figsize=(12, 6))
    plt.plot(predictions_df['Predicted'], label='Predicted', color='red')
    plt.xlabel('Index')
    plt.ylabel('Predicted Values')
    plt.title('Predicted Values')
    plt.legend()

    # Hide the x-axis labels
    plt.xticks([])
    #plt.show()
    
    output_filename = f'predictions\{parkade}.csv'
    predictions_df.to_csv(output_filename)
    print(f"CSV file saved as {output_filename}")

if __name__ == "__main__":
    main()
