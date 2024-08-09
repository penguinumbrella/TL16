
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import sys
import joblib
import get_past_data
import os
import datetime

from pathlib import Path  # Import Path from pathlib

# Determine the directory of the current script
script_dir = Path(__file__).parent

# Set the working directory to the script's directory
os.chdir(script_dir)



#print(os.listdir)

# Verify the current working directory
#print(os.getcwd())


# Function to create a date range DataFrame
def create_date_range_df(start_date, end_date):
    date_range = pd.date_range(start=start_date, end=end_date, freq='h')
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

def create_week_lag(df,parkade,start_date):
    # Load data from CSV file
    data_file = 'hourly_parkade_data.csv'
    lag_data = pd.read_csv(data_file)
    
    # Convert the 'Timestamp' column to datetime and set it as the index
    lag_data['Timestamp'] = pd.to_datetime(lag_data['Timestamp'])
    lag_data.set_index('Timestamp', inplace=True)
    
    # Ensure that 'df' has a datetime index
    df.index = pd.to_datetime(df.index)
    
    # Sort the DataFrame by index to ensure correct lag calculation
    df.sort_index(inplace=True)
    
    df = df.merge(lag_data[[parkade]], left_index=True, right_index=True, how='outer', suffixes=('', '_lag'))
    
    # Create a new DataFrame to hold the lagged values
    lagged_df = df.copy()
    
    # Add a column for lagged values initialized with NaN
    lagged_df['lag_7_days_Occupancy'] = float('nan')
    
    # Create lagged values by shifting the 'North' column by 168 hours (1 week)
    lagged_df['lag_7_days_Occupancy'] = lagged_df[parkade].shift(168)  # 168 hours = 1 week
    
    lagged_df.drop(columns=[parkade], inplace=True)
    
    # Drop rows where lagged values are NaN (if required)
    # Uncomment if you want to drop rows with NaN values
    # lagged_df.dropna(inplace=True)
    lagged_df = lagged_df[lagged_df.index >= start_date]

    lagged_df['term_date'] = df['term_date'].astype(bool)  # Convert to boolean
    lagged_df['is_holiday'] = df['is_holiday'].astype(bool)  # Convert to boolean
    lagged_df['lag_7_days_Occupancy'] = lagged_df['lag_7_days_Occupancy'].astype(float)
    
    return lagged_df



def create_day_lag(df,parkade,start_date):
    # Load data from CSV file
    data_file = 'hourly_parkade_data.csv'
    lag_data = pd.read_csv(data_file)
    
    # Convert the 'Timestamp' column to datetime and set it as the index
    lag_data['Timestamp'] = pd.to_datetime(lag_data['Timestamp'])
    lag_data.set_index('Timestamp', inplace=True)
    
    # Ensure that 'df' has a datetime index
    df.index = pd.to_datetime(df.index)
    
    # Sort the DataFrame by index to ensure correct lag calculation
    df.sort_index(inplace=True)
    
    df = df.merge(lag_data[[parkade]], left_index=True, right_index=True, how='outer', suffixes=('', '_lag'))
    
    # Create a new DataFrame to hold the lagged values
    lagged_df = df.copy()
    
    # Create lagged columns for each day in the past week
    for i in range(1, 7):
        lagged_df[f'lag_{i}_day_Occupancy'] = lagged_df[parkade].shift(i * 24)

    lagged_df.drop(columns=[parkade], inplace=True)
    
    # Drop rows where lagged values are NaN (if required)
    # Uncomment if you want to drop rows with NaN values
    # lagged_df.dropna(inplace=True)
    lagged_df = lagged_df[lagged_df.index >= start_date]

    lagged_df['term_date'] = df['term_date'].astype(bool)  # Convert to boolean
    lagged_df['is_holiday'] = df['is_holiday'].astype(bool)  # Convert to boolean

    
    return lagged_df

def create_4hour_lag(df,parkade,start_date):
    # Load data from CSV file
    data_file = 'hourly_parkade_data.csv'
    lag_data = pd.read_csv(data_file)
    
    # Convert the 'Timestamp' column to datetime and set it as the index
    lag_data['Timestamp'] = pd.to_datetime(lag_data['Timestamp'])
    lag_data.set_index('Timestamp', inplace=True)
    
    # Ensure that 'df' has a datetime index
    df.index = pd.to_datetime(df.index)
    
    # Sort the DataFrame by index to ensure correct lag calculation
    df.sort_index(inplace=True)
    
    df = df.merge(lag_data[[parkade]], left_index=True, right_index=True, how='outer', suffixes=('', '_lag'))
    
    # Create a new DataFrame to hold the lagged values
    lagged_df = df.copy()
    
    # Create lagged columns for each day in the past week
    for i in range(4, 25):
        lagged_df[f'lag_{i}_hours_Occupancy'] = lagged_df[parkade].shift(i)

    lagged_df.drop(columns=[parkade], inplace=True)
    
    # Drop rows where lagged values are NaN (if required)
    # Uncomment if you want to drop rows with NaN values
    # lagged_df.dropna(inplace=True)
    lagged_df = lagged_df[lagged_df.index >= start_date]

    lagged_df['term_date'] = df['term_date'].astype(bool)  # Convert to boolean
    lagged_df['is_holiday'] = df['is_holiday'].astype(bool)  # Convert to boolean
    
    print("4hour laggeddf", lagged_df)
    return lagged_df
# Main script to generate the CSV file
import sys

def track_nan_timestamps(df):
    # Dictionary to hold timestamps with NaN values for each column
    nan_timestamps = {}

    # Iterate over each column
    for column in df.columns:
        # Find rows where the column has NaN values
        nan_rows = df[df[column].isna()]
        
        # If there are any NaNs, record the timestamps
        if not nan_rows.empty:
            nan_timestamps[column] = nan_rows.index.tolist()

    return nan_timestamps

def update_nan_timestamps(existing_nan_timestamps, new_nan_timestamps):
    # Update existing dictionary with new timestamps
    for column, timestamps in new_nan_timestamps.items():
        if column in existing_nan_timestamps:
            # Add new timestamps, ensuring no duplicates
            existing_nan_timestamps[column] = list(set(existing_nan_timestamps[column] + timestamps))
        else:
            existing_nan_timestamps[column] = timestamps

    return existing_nan_timestamps


# Assuming all_nan_timestamps is your dictionary from the previous code
def extract_all_timestamps(nan_timestamps):
    all_timestamps = set()  # Use a set to avoid duplicates
    
    for timestamps in nan_timestamps.values():
        all_timestamps.update(timestamps)
    
    return sorted(all_timestamps)  # Return sorted list if needed


def main():
    if len(sys.argv) != 1:
        print("Usage: shortterm_predict.py")
        sys.exit(1)
    
    now = datetime.datetime.now()
    next_hour = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)

    # Define end_date as 7 days from the next hour
    start_date = next_hour
    #start_date = pd.to_datetime("2024-01-01 00:00:00")
    #start_date = pd.to_datetime("2024-08-01 21:00:00")
    end_date = start_date + timedelta(days=7) - timedelta(hours=1)
    
    missing_data = False
    #missing_data = get_past_data.main(start_date, end_date)
    
    # Ensure y_test has a DateTimeIndex
    parkades = ["North", "West", "Rose", "Health Sciences", "Fraser", "Thunderbird", "University Lot Blvd"]
    parkade_map = {
        "North": "North",
        "West": "West",
        "Rose": "Rose Garden",
        "Health Sciences": "Health Sciences",
        "Fraser": "Fraser River",
        "Thunderbird": "Thunderbird",
        "University Lot Blvd": "University West Blvd"
    }

    #parkade = sys.argv[1]

    print(parkades)
    for parkade in parkades:
        df = create_date_range_df(start_date, end_date)

        
        df['term_date'] = False
        
        cal = VancouverHolidayCalendar()
        holidays = cal.holidays(start=df['date'].min(), end=df['date'].max())
        
        expanded_data = []
        processed_dates = set()
        
        if holidays.empty:
            df['is_holiday'] = False

        else:
            print("holidays", holidays)
            for holiday_date in holidays:
                date = holiday_date.date()
                
                if date not in processed_dates:
                    for hour in range(0, 24):
                        expanded_data.append({'date': datetime.datetime.combine(date, datetime.time(hour))})
                    processed_dates.add(date)
            
            print("expanded_data", expanded_data)
            expanded_df = pd.DataFrame(expanded_data)
            expanded_df = expanded_df[expanded_df['date'].dt.date.isin(holidays.date)]
            expanded_df.reset_index(drop=True, inplace=True)
            
            df['is_holiday'] = df['date'].isin(expanded_df['date'])
        
            
        df.set_index('date', inplace=True)
        X_test_df_2 = create_features(df)

        print(X_test_df_2)

        df_1week = X_test_df_2.copy()
        df_1day = X_test_df_2[X_test_df_2.index <= start_date + timedelta(hours=23)].copy()
        df_4hour = X_test_df_2[X_test_df_2.index <= start_date + timedelta(hours=3)].copy()

        #print(df_1week)
        # implement lags
        df_1week = create_week_lag(df_1week, parkade, start_date)
        df_1day = create_day_lag(df_1day, parkade, start_date)
        df_4hour = create_4hour_lag(df_4hour, parkade, start_date)
        #X_test_df_2['lag_7_days_Occupancy'] = float('nan')


        df_1week = df_1week.drop(columns=['date'])
        df_1day = df_1day.drop(columns=['date'])
        df_4hour = df_4hour.drop(columns=['date'])

        # Track NaN timestamps

        all_nan_timestamps = {}

        # Track NaN timestamps for each DataFrame and merge results
        all_nan_timestamps = update_nan_timestamps(all_nan_timestamps, track_nan_timestamps(df_1week))
        all_nan_timestamps = update_nan_timestamps(all_nan_timestamps, track_nan_timestamps(df_1day))
        all_nan_timestamps = update_nan_timestamps(all_nan_timestamps, track_nan_timestamps(df_4hour))


        # Print results
        for column, timestamps in all_nan_timestamps.items():
            print(f"Column '{column}' has NaN values at the following timestamps:")
            for timestamp in timestamps:
                print(f"  {timestamp}")
            print()  # Print a newline for better readability


                
        # Example usage
        all_timestamps = extract_all_timestamps(all_nan_timestamps)

        # Print all timestamps
        print("All timestamps with NaN values:")
        for timestamp in all_timestamps:
            print(timestamp)

        return
        #print(df_1week)
        #print(df_1day)
        #print(df_4hour)
        # Assume df_4hour is your DataFrame

        # Specify the columns you want to see
        columns_to_print = ['lag_4_hours_Occupancy', 'lag_10_hours_Occupancy', 'lag_24_hours_Occupancy']

        # Print values of the specified columns


        
        # Load the trained model
        
        loaded_model_week = joblib.load(f'models/1week/lgb_1week_{parkade}.pkl')
        loaded_model_day = joblib.load(f'models/1day/lgb_1day_{parkade}.pkl')
        loaded_model_4hour = joblib.load(f'models/4hour/lgb_4hour_{parkade}.pkl')


        
        # Make predictions using the loaded model
        y_pred_loaded_day = loaded_model_day.predict(df_1day)
        y_pred_loaded_day = np.maximum(y_pred_loaded_day, 0)


        # Make predictions using the loaded model
        y_pred_loaded_week = loaded_model_week.predict(df_1week)
        y_pred_loaded_week = np.maximum(y_pred_loaded_week, 0)

        #plt.show()

        # Make predictions using the loaded model
        y_pred_loaded_4hour = loaded_model_4hour.predict(df_4hour)
        y_pred_loaded_4hour = np.maximum(y_pred_loaded_4hour, 0)


        #plt.show()


        # Take the first 4 values from y_pred_loaded_4hour
        part1 = y_pred_loaded_4hour[:4]

        # Take values from index [4, 24] from y_pred_loaded_day
        part2 = y_pred_loaded_day[4:24]

        # Take the rest from y_pred_loaded_week
        part3 = y_pred_loaded_week[len(part1) + len(part2):]

        # Combine all parts into one array
        combined_predictions = np.concatenate([part1, part2, part3])

        predictions_df = pd.DataFrame({'name': df_1week.index, 'Vehicles': combined_predictions})
        predictions_df.set_index('name', inplace=True)
        plt.figure(figsize=(12, 6))
        plt.plot(predictions_df['Vehicles'], label='Occupancy', color='red')
        plt.xlabel('Date')
        plt.ylabel('Predicted Values')
        plt.title('Predicted Values')
        plt.legend()

        # Hide the x-axis labels
        plt.xticks([])
        #plt.show()


        output_filename = f'predictions\\{parkade}.csv'
        predictions_df.to_csv(output_filename)
        print(f"CSV file saved as {output_filename}")

    return missing_data

if __name__ == "__main__":
    main()
