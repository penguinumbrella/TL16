#!/usr/bin/env python
# coding: utf-8

# In[117]:

from bayes_opt import BayesianOptimization

# Data manipulation
import pandas as pd
import numpy as np
import pyarrow

# Data visualization
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objs as go

# Plot aesthetics
color_pal = sns.color_palette()
plt.style.use('ggplot')
plt.style.use('fivethirtyeight')

import warnings
warnings.filterwarnings('ignore')

import lightgbm as lgb  # ML algorithm for forecasting
from sklearn.metrics import mean_squared_error, mean_absolute_error  # Error metrics

import os
# In[118]:


import time

# Record the start time
start_time = time.time()

import os

# Change the current working directory
os.chdir('C:\\cpen491\\TL16-2\\TL16\\machine-learning')

print(os.listdir)

# Verify the current working directory
print(os.getcwd())



"""
file_path = 'parking_lot_metrics.csv'

try:
    os.remove(file_path)
    print(f"{file_path} has been successfully deleted.")
except OSError as e:
    print(f"Error deleting {file_path}: {e}")
"""


# Referenced from: https://github.com/jpsam07/skyline-hospital-time-series-forecasting-with-xgboost?tab=readme-ov-file#data-collection

# In[119]:




# In[ ]:





# In[122]:


# Convert sensor columns to numeric (in case they are not already)
# df['sensor'] = df.iloc[:, 0:10].mean(axis=1)
#df.iloc[:, 1:] = df.iloc[:, 1:].apply(pd.to_numeric, errors='coerce')

# Calculate the average across sensor columns
# df['sensor'] = df.iloc[:, 1:].mean(axis=1)

# Drop the individual sensor columns
# df.drop(columns=['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], inplace=True)

# Display the updated DataFrame
#parking_lot_to_predict = 'West'


og_parking_lots = ['North','West', 'Rose', 'Health Sciences', 'Fraser', 'Thunderbird', 'University Lot Blvd']
parking_lots = og_parking_lots.copy()

add_weather = False
short_term_1_week = False
short_term_4_hours = False
short_term_1_day = False

time_durations = [short_term_1_week, short_term_1_day, short_term_4_hours]


capacity_dict = {
    'North': 990,
    'West': 1232,
    'Rose': 807,
    'Health Sciences': 1189,
    'Fraser': 725,
    'Thunderbird': 1634,
    'University Lot Blvd': 216
}


for time_duration in range(0, 5):
    time_duration_str = str(time_duration)
    if time_duration == 0:
        short_term_1_week = True
        short_term_1_day = False
        short_term_4_hours = False
        time_duration_str = "1week"
    elif time_duration == 1:
        short_term_1_week = False
        short_term_1_day = True
        short_term_4_hours = False
        time_duration_str = "1day"
    elif time_duration == 2:
        short_term_1_week = False
        short_term_1_day = False
        short_term_4_hours = True
        time_duration_str = "4hour"
    else:
        short_term_1_week = False
        short_term_1_day = False
        short_term_4_hours = False
        time_duration_str = "longterm"

    for parking_lot_to_predict in og_parking_lots:
        parking_lots = og_parking_lots.copy()

        print("NOW PREDICTING: ", parking_lot_to_predict)

        print(os.getcwd())

            
        filepath = 'sample-data/term_dates_parking.csv' # change as needed

        df = pd.read_csv(filepath)

        df.tail()


        # In[120]:


        df.info()


        # In[121]:


        df.rename(columns={'Timestamp': 'date'}, inplace=True)
        df = df.set_index('date')
        df

        df.rename(columns={parking_lot_to_predict: 'Occupancy'}, inplace=True)
        parking_lots.remove(parking_lot_to_predict)

        print(df.head())

        """
        capacity = capacity_dict[parking_lot_to_predict]
        df['Occupancy'] = np.minimum(df['Occupancy'] / capacity, 1)
        """



        # In[123]:


        old_df = df
        # Calculate the 95th percentile of the 'Occupancy' column
        threshold = df['Occupancy'].quantile(1)

        # Filter the DataFrame to exclude values above the threshold
        df = df[df['Occupancy'] <= threshold]

        # Filter the DataFrame to exclude values above the threshold
        df = df[df['Occupancy'] >= 0]

        # Display the filtered DataFrame
        print(df)


        # In[124]:


        df = df.copy()
        df['date'] = pd.to_datetime(df.index)
        df['day_of_week'] = df['date'].dt.dayofweek
        print(df.head())

        print(df.tail())


        # In[125]:


        df.groupby('day_of_week')['Occupancy'].sum().sort_values(ascending=False)     .plot(kind='bar', figsize=(11, 6))


        # In[126]:


        import pandas as pd

        # Ensure the date column is in datetime format (assuming the date column is named 'date')
        df['date'] = pd.to_datetime(df['date'])

        # Define the date range (assuming the year spans across December to January)
        start_date = pd.to_datetime('2023-12-20')
        end_date = pd.to_datetime('2024-01-05')

        # Filter the data
        filtered_df = df.loc[(df['date'] >= start_date) & (df['date'] <= end_date)]

        # Display the filtered data
        filtered_df


        # In[ ]:





        # In[127]:


        # Remove rows where Occupancy is -1
        df = df[df['Occupancy'] != -1]


        # In[128]:


        from statsmodels.tsa.seasonal import STL


        # In[129]:


        import pandas as pd
        from statsmodels.tsa.seasonal import STL

        # Assuming 'Occupancy' is the column containing the Occupancy data
        traffic_series = df['Occupancy']

        # Step 1: Ensure the index is a datetime index
        df.index = pd.to_datetime(df.index)

        # Step 2: Extract 'Occupancy' as a pandas Series
        traffic_series = df['Occupancy']


        # In[130]:



        # Step 3: Convert the data type of the Series to numeric (if needed)
        traffic_series = pd.to_numeric(traffic_series, errors='coerce')

        traffic_series.head()



        # In[131]:


        traffic_series.tail()


        # In[132]:
        import pandas as pd

        def remove_columns(df, columns_to_remove):
            """
            Remove specified columns from a DataFrame.

            Parameters:
            - df (pd.DataFrame): The pandas DataFrame from which columns will be removed.
            - columns_to_remove (list): List of column names to be removed from the DataFrame.

            Returns:
            - pd.DataFrame: Modified DataFrame with specified columns removed.
            """
            # Ensure columns_to_remove are actually in the DataFrame
            existing_columns = df.columns.tolist()
            columns_to_remove = [col for col in columns_to_remove if col in existing_columns]

            # Drop specified columns
            df = df.drop(columns=columns_to_remove, errors='ignore')

            return df

        # Example usage:
        # Assuming df is your DataFrame containing the columns you mentioned
        # remove weather for long term
        columns_to_remove = ['temp', 'visibility', 'dew_point', 'feels_like', 'pressure', 'humidity', 'wind_speed', 'clouds_all', 'rain_1h', 'snow_1h']
        if not add_weather:
            df = remove_columns(df, columns_to_remove)



        def create_features(df, label=None):
            """
            Create time series features from the datetime index
            """
            df = df.copy()

            df['date'] = df.index
            df['month'] = df['date'].dt.month
            df['day_of_year'] = df['date'].dt.dayofyear
            df['week_of_year'] = df['date'].dt.isocalendar().week
            df['day_of_week'] = df['date'].dt.dayofweek
            df['hour'] = df['date'].dt.hour  # Add hour feature

            # Apply weight to the day_of_year column
            weight = 100  # You can adjust this weight as needed
            df['weighted_day_of_year'] = df['day_of_year'] * weight
            
            df['year'] = df['date'].dt.year
            df['is_month_start'] = df['date'].dt.is_month_start.astype(int)
            df['is_month_end'] = df['date'].dt.is_month_end.astype(int)
            
            # Seasonality features
            df['sin_hour'] = np.sin(2 * np.pi * df['hour'] / 24)
            df['cos_hour'] = np.cos(2 * np.pi * df['hour'] / 24)
            df['sin_day'] = np.sin(2 * np.pi * df['day_of_year'] / 365.25)
            df['cos_day'] = np.cos(2 * np.pi * df['day_of_year'] / 365.25)
            df['sin_week'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
            df['cos_week'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
            df['sin_month'] = np.sin(2 * np.pi * df['month'] / 12)
            df['cos_month'] = np.cos(2 * np.pi * df['month'] / 12)

            # Seasonal indices (if applicable)
            # Autoregressive features (if applicable)
            # Time since last event (if applicable)
            # Day/night indicator
            df['is_day'] = np.where((df['hour'] >= 6) & (df['hour'] <= 18), 1, 0)
            
            # Day/night duration
            df['day_duration'] = np.where(df['is_day'] == 1, 12 - df['hour'], 0)
            df['night_duration'] = np.where(df['is_day'] == 0, df['hour'], 0)
            
            # Weather data (if available)
            # Special event indicators (if applicable)
            # Trend features (if applicable)
            
            return df

        def create_rolling_calculation_features(df, label=None):
            df = df.copy()
            window_sizes = [24, 7 * 24]  # 7-day rolling window (168 hours)
            shift_size = 7 * 24       # Shift size (1 day or 24 hours)

            # Shift the data before applying the rolling window
            shifted_occupancy = df['Occupancy'].shift(shift_size)

            for window_size in window_sizes:
                # Rolling minimum
                df[f'rolling_min_{window_size}'] = shifted_occupancy.rolling(window=window_size).min()
                
                # Rolling maximum
                df[f'rolling_max_{window_size}'] = shifted_occupancy.rolling(window=window_size).max()
                
                # Rolling sum
                df[f'rolling_sum_{window_size}'] = shifted_occupancy.rolling(window=window_size).sum()
                
                # Rolling mean
                df[f'rolling_mean_{window_size}'] = shifted_occupancy.rolling(window=window_size).mean()
                
                # Rolling median
                df[f'rolling_median_{window_size}'] = shifted_occupancy.rolling(window=window_size).median()
                
                # Rolling standard deviation
                df[f'rolling_std_{window_size}'] = shifted_occupancy.rolling(window=window_size).std()
                
                # Rolling 25th percentile
                df[f'rolling_quantile_25_{window_size}'] = shifted_occupancy.rolling(window=window_size).quantile(0.25)
                
                # Rolling 75th percentile
                df[f'rolling_quantile_75_{window_size}'] = shifted_occupancy.rolling(window=window_size).quantile(0.75)
                
            return df

        # Example usage
        df = create_features(df)
        #df = create_rolling_calculation_features(df)
        df.dtypes


        # In[133]:


        # Replace negative values in 'Occupancy' column with 0
        df.loc[df['Occupancy'] < 0, 'Occupancy'] = 0


        # In[134]:


        from sklearn.model_selection import TimeSeriesSplit


        # In[135]:


        from sklearn.model_selection import train_test_split

        # Assuming df is your DataFrame
        train_size = 0.75
        train, test = train_test_split(df, test_size=(1 - train_size), shuffle=False)

        # Plotting the data
        plt.figure(figsize=(15, 7))
        plt.plot(train.index, train['Occupancy'], label='Training Set')
        plt.plot(test.index, test['Occupancy'], label='Test Set')
        plt.axvline(test.index.min(), color='black', ls='--')
        plt.title(f'Train / Test Split for {parking_lot_to_predict}')
        plt.xlabel('Date')
        plt.ylabel('Occupancy')
        plt.legend()
        #plt.show()


        # In[136]:


        df


        # In[137]:


        def add_lags(df):
            """
            Create time lags for added time series features and allow the model to learn the temporal structure of the data.
            """
            #target_map = df['Occupancy'].to_dict()
            # Assuming df is your DataFrame and 'Fraser' is another column you want to include
            print(parking_lots)
            #target_map = df[['Occupancy', parking_lots]].to_dict()
            target_map = df[['Occupancy']].to_dict()
            #target_map = df[['Occupancy'] + parking_lots].to_dict()


            #print(target_map.head())

            
            #df['lag_1_hour'] = (df.index - pd.Timedelta('1 hours')).map(target_map)
            #df['lag_2_hours'] = (df.index - pd.Timedelta('2 hours')).map(target_map)

            if short_term_4_hours:
                for lag_hours in range(4, 25):  df[f'lag_{lag_hours}_hours'] = (df.index - pd.Timedelta(f'{lag_hours} hours')).map(target_map['Occupancy'])
                    #df[f'lag_{lag_hours}_hours'] = df['Occupancy'].shift(lag_hours)

            if short_term_1_week:
                for lag_days in range(1, 20):  df[f'lag_{lag_days*7}_days_Occupancy'] = (df.index - pd.Timedelta(f'{lag_days*7} days')).map(target_map['Occupancy'])

                """
                for lag_days in range(1, 2):  # lags for 1 week and more
                    for lag_parking_lot in parking_lots:
                        df[f'lag_{lag_days*7}_days_{lag_parking_lot}'] = (df.index - pd.Timedelta(f'{lag_days*7} days')).map(target_map[lag_parking_lot])

                    #df[f'lag_{lag_days}_weeks'] = df['Occupancy'].shift(7*lag_days*24)

                    """
            
            
            # Daily lags

            if short_term_1_day:
                print("SHORT TERM 1 DAY")
                for lag_days in range(1, 7):  df[f'lag_{lag_days}_days'] = (df.index - pd.Timedelta(f'{lag_days} days')).map(target_map['Occupancy'])
                    #df[f'lag_{lag_days}_days'] = df['Occupancy'].shift(lag_days*24)
            
            return df

        df = add_lags(df)
        df


        # In[138]:


        df.columns


        # In[139]:


        df.dtypes


        # In[140]:


        df

        
        df.drop(columns=parking_lots, inplace=True)


        # In[141]:


        from sklearn.model_selection import train_test_split
        from sklearn.metrics import mean_squared_error, mean_absolute_error

        # Assuming df is your DataFrame and create_features is a function to generate features
        train, test = train_test_split(df, test_size=(1-train_size), shuffle=False)

        train = create_features(train)
        test = create_features(test)

        # Define the target variable and the column to exclude
        TARGET = 'Occupancy'
        EXCLUDE_COLUMNS = ['date', TARGET]

        # Generate the list of features
        FEATURES = [col for col in df.columns if col not in EXCLUDE_COLUMNS]
        # weather features
        # FEATURES = ['temp', 'visibility', 'dew_point', 'feels_like', 'pressure', 'humidity', 'wind_speed', 'clouds_all', 'rain_1h', 'snow_1h', 'weather_Clear_sky is clear', 'weather_Clouds_broken clouds', 'weather_Clouds_few clouds', 'weather_Clouds_overcast clouds', 'weather_Clouds_scattered clouds', 'weather_Drizzle_drizzle', 'weather_Drizzle_light intensity drizzle', 'weather_Drizzle_light intensity drizzle rain', 'weather_Drizzle_rain and drizzle', 'weather_Dust_dust', 'weather_Fog_fog', 'weather_Haze_haze', 'weather_Mist_mist', 'weather_Rain_heavy intensity rain', 'weather_Rain_heavy intensity shower rain', 'weather_Rain_light intensity shower rain', 'weather_Rain_light rain', 'weather_Rain_moderate rain', 'weather_Rain_proximity shower rain', 'weather_Rain_shower rain', 'weather_Rain_very heavy rain', 'weather_Smoke_smoke', 'weather_Snow_heavy snow', 'weather_Snow_light rain and snow', 'weather_Snow_light shower sleet', 'weather_Snow_light shower snow', 'weather_Snow_light snow', 'weather_Snow_sleet', 'weather_Snow_snow', 'weather_Thunderstorm_thunderstorm', 'weather_Thunderstorm_thunderstorm with heavy rain', 'weather_Thunderstorm_thunderstorm with light rain', 'weather_Thunderstorm_thunderstorm with rain']


        print(FEATURES)

        top_level = {
            'longterm'
        }

        # Define the parameters for each parkade
        university_lot_blvd_params = {
            'bagging_fraction': 1.0,
            'feature_fraction': 0.9,
            'lambda_l1': 5.0,
            'lambda_l2': 3.0,
            'max_depth': 9,
            'min_child_weight': 16.585377994424345,
            'min_split_gain': 0.001,
            'num_leaves': 43,
            'min_child_samples': 9,
            'subsample_freq': 9
        }

        # Placeholder parameters for other parkades (replace with actual values)
        north_params = {
            'bagging_fraction': 0.5,
            'feature_fraction': 0.9,
            'lambda_l1': 5.0,
            'lambda_l2': 3.0,
            'max_depth': 9,
            'min_child_weight': 7.39595634952731,
            'min_split_gain': 0.001,
            'num_leaves': 45,
            'min_child_samples': 9,
            'subsample_freq': 9
        }

        west_params = {
            'bagging_fraction': 1.0,
            'feature_fraction': 0.9,
            'lambda_l1': 3.06316093516092,
            'lambda_l2': 3.0,
            'max_depth': 9,
            'min_child_weight': 8.38670870432,
            'min_split_gain': 0.001,
            'num_leaves': 39,
            'min_child_samples': 9,
            'subsample_freq': 9
            }

        rose_params = {
            'bagging_fraction': 0.7419965,
            'feature_fraction': 0.9,
            'lambda_l1': 0.63322,
            'lambda_l2': 3.0,
            'max_depth': 8,
            'min_child_weight': 9.4359169,
            'min_split_gain': 0.0499782,
            'num_leaves': 43,
            'min_child_samples': 8,
            'subsample_freq': 8
        }

        health_sciences_params = {
            'bagging_fraction': 0.5,
            'feature_fraction': 0.9,
            'lambda_l1': 0.0,
            'lambda_l2': 3.0,
            'max_depth': 9,
            'min_child_weight': 19.80539219,
            'min_split_gain': 0.001,
            'num_leaves': 45,
            'min_child_samples': 9,
            'subsample_freq': 9
        }

        fraser_params = {
            'bagging_fraction': 0.5,
            'feature_fraction': 0.9,
            'lambda_l1': 2.98723774,
            'lambda_l2': 3.0,
            'max_depth': 9,
            'min_child_weight': 11.14998107,
            'min_split_gain': 0.001,
            'num_leaves': 43,
            'min_child_samples': 9,
            'subsample_freq': 9
        }

        thunderbird_params = {
            'bagging_fraction': 0.5,
            'feature_fraction': 0.9,
            'lambda_l1': 4.046214,
            'lambda_l2': 0,
            'max_depth': 9,
            'min_child_weight': 42.642473,
            'min_split_gain': 0.001,
            'num_leaves': 44,
            'min_child_samples': 9,
            'subsample_freq': 9
        }

        # Create the dictionary to assign parkades to their parameters
        parkades_params = {
            'North': north_params,
            'West': west_params,
            'Rose': rose_params,
            'Health Sciences': health_sciences_params,
            'Fraser': fraser_params,
            'Thunderbird': thunderbird_params,
            'University Lot Blvd': university_lot_blvd_params
        }

        # Define the nested dictionary for each duration and parkade
        parameters = {
            'longterm': {
                'North': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 5.0,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 7.39595634952731,
                    'min_split_gain': 0.001,
                    'num_leaves': 45,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'West': {
                    'bagging_fraction': 1.0,
                    'feature_fraction': 0.9,
                    'lambda_l1': 3.06316093516092,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 8.38670870432,
                    'min_split_gain': 0.001,
                    'num_leaves': 39,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Rose': {
                    'bagging_fraction': 0.7419965,
                    'feature_fraction': 0.9,
                    'lambda_l1': 0.63322,
                    'lambda_l2': 3.0,
                    'max_depth': 8,
                    'min_child_weight': 9.4359169,
                    'min_split_gain': 0.0499782,
                    'num_leaves': 43,
                    'min_child_samples': 8,
                    'subsample_freq': 8
                },
                'Health Sciences': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 0.0,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 19.80539219,
                    'min_split_gain': 0.001,
                    'num_leaves': 45,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Fraser': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 2.98723774,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 11.14998107,
                    'min_split_gain': 0.001,
                    'num_leaves': 43,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Thunderbird': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 4.046214,
                    'lambda_l2': 0,
                    'max_depth': 9,
                    'min_child_weight': 42.642473,
                    'min_split_gain': 0.001,
                    'num_leaves': 44,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'University Lot Blvd': {
                    'bagging_fraction': 1.0,
                    'feature_fraction': 0.9,
                    'lambda_l1': 5.0,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 16.585377994424345,
                    'min_split_gain': 0.001,
                    'num_leaves': 43,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                }
            },
            '1week': {
                'North': {
                    'bagging_fraction': 1.0,
                    'feature_fraction': 0.9,
                    'lambda_l1': 2.1609478091615633,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 16.589656818797167,
                    'min_split_gain': 0.001,
                    'num_leaves': 43,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'West': {
                    'bagging_fraction': 1.0,
                    'feature_fraction': 0.3668869433508153,
                    'lambda_l1': 0.0,
                    'lambda_l2': 3.0,
                    'max_depth': 7,
                    'min_child_weight': 19.15560901376687,
                    'min_split_gain': 0.09749979969197688,
                    'num_leaves': 44,
                    'min_child_samples': 7,
                    'subsample_freq': 7
                },
                'Rose': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 2.68731480826832,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 17.275038815765992,
                    'min_split_gain': 0.001,
                    'num_leaves': 43,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Health Sciences': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 0.5189252264189748,
                    'lambda_l2': 0.07159030691818608,
                    'max_depth': 9,
                    'min_child_weight': 7.111831984335503,
                    'min_split_gain': 0.001,
                    'num_leaves': 45,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Fraser': {
                    'bagging_fraction': 1.0,
                    'feature_fraction': 0.9,
                    'lambda_l1': 2.324831244200636,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 14.895379289134722,
                    'min_split_gain': 0.1,
                    'num_leaves': 42,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Thunderbird': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 5.0,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 5.0,
                    'min_split_gain': 0.001,
                    'num_leaves': 44,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'University Lot Blvd': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 0.0,
                    'lambda_l2': 0.0,
                    'max_depth': 9,
                    'min_child_weight': 15.779395782542414,
                    'min_split_gain': 0.001,
                    'num_leaves': 41,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                }
            },
            '1day': {
                'North': {
                    'bagging_fraction': 1.0,
                    'feature_fraction': 0.377694183698331,
                    'lambda_l1': 1.9224695797320757,
                    'lambda_l2': 2.761162875026437,
                    'max_depth': 7,
                    'min_child_weight': 19.061558904031436,
                    'min_split_gain': 0.002180071874936299,
                    'num_leaves': 44,
                    'min_child_samples': 7,
                    'subsample_freq': 7
                },
                'West': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 0.5428602219591488,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 8.665192811669447,
                    'min_split_gain': 0.001,
                    'num_leaves': 43,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Rose': {
                    'bagging_fraction': 0.5668639452774469,
                    'feature_fraction': 0.6599364893246572,
                    'lambda_l1': 0.7001733735304905,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 33.84573622823115,
                    'min_split_gain': 0.001,
                    'num_leaves': 44,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Health Sciences': {
                    'bagging_fraction': 0.8671439846514323,
                    'feature_fraction': 0.5453275927028712,
                    'lambda_l1': 0.6366989811638976,
                    'lambda_l2': 2.885520016159323,
                    'max_depth': 7,
                    'min_child_weight': 16.944864825874788,
                    'min_split_gain': 0.1,
                    'num_leaves': 45,
                    'min_child_samples': 7,
                    'subsample_freq': 7
                },
                'Fraser': {
                    'bagging_fraction': 0.5294512446897803,
                    'feature_fraction': 0.3255278033057069,
                    'lambda_l1': 1.433838523463828,
                    'lambda_l2': 3.0,
                    'max_depth': 8,
                    'min_child_weight': 17.095778578107165,
                    'min_split_gain': 0.001,
                    'num_leaves': 44,
                    'min_child_samples': 8,
                    'subsample_freq': 8
                },
                'Thunderbird': {
                    'bagging_fraction': 0.7866003011434974,
                    'feature_fraction': 0.9,
                    'lambda_l1': 3.325522302518627,
                    'lambda_l2': 2.8730779365443944,
                    'max_depth': 9,
                    'min_child_weight': 15.462261513517651,
                    'min_split_gain': 0.04696357127084615,
                    'num_leaves': 41,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'University Lot Blvd': {
                    'bagging_fraction': 0.887165520617803,
                    'feature_fraction': 0.9,
                    'lambda_l1': 1.21917251556156,
                    'lambda_l2': 3.0,
                    'max_depth': 9,
                    'min_child_weight': 5.338710844918132,
                    'min_split_gain': 0.06133438292748035,
                    'num_leaves': 42,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                }
            },
            '4hour': {
                'North': {
                    'bagging_fraction': 0.5,
                    'feature_fraction': 0.9,
                    'lambda_l1': 0.0,
                    'lambda_l2': 0.0,
                    'max_depth': 9,
                    'min_child_weight': 16.170285421422587,
                    'min_split_gain': 0.001,
                    'num_leaves': 44,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'West': {
                    'bagging_fraction': 1.0,
                    'feature_fraction': 0.9,
                    'lambda_l1': 4.868492077321441,
                    'lambda_l2': 0.0,
                    'max_depth': 9,
                    'min_child_weight': 6.880889895572711,
                    'min_split_gain': 0.1,
                    'num_leaves': 43,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Rose': {
                    'bagging_fraction': 1.0,
                    'feature_fraction': 0.9,
                    'lambda_l1': 4.610939466926319,
                    'lambda_l2': 0.43360872434329073,
                    'max_depth': 9,
                    'min_child_weight': 19.654773555871994,
                    'min_split_gain': 0.001,
                    'num_leaves': 36,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Health Sciences': {
                    'bagging_fraction': 0.8545658753905836,
                    'feature_fraction': 0.5327494834420226,
                    'lambda_l1': 0.6241208719030489,
                    'lambda_l2': 2.8729418864090053,
                    'max_depth': 7,
                    'min_child_weight': 16.932313817795805,
                    'min_split_gain': 0.07201030879887863,
                    'num_leaves': 45,
                    'min_child_samples': 7,
                    'subsample_freq': 7
                },
                'Fraser': {
                    'bagging_fraction': 0.9374876580499288,
                    'feature_fraction': 0.9,
                    'lambda_l1': 4.331748034046271,
                    'lambda_l2': 0.20458111508326898,
                    'max_depth': 9,
                    'min_child_weight': 19.924596834609602,
                    'min_split_gain': 0.001,
                    'num_leaves': 35,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                },
                'Thunderbird': {
                    'bagging_fraction': 1.0,
                    'feature_fraction': 0.5281100906478273,
                    'lambda_l1': 0.5246961891587462,
                    'lambda_l2': 2.976819232273048,
                    'max_depth': 7,
                    'min_child_weight': 16.76633082277225,
                    'min_split_gain': 0.1,
                    'num_leaves': 45,
                    'min_child_samples': 7,
                    'subsample_freq': 7
                },
                'University Lot Blvd': {
                    'bagging_fraction': 0.9863887102925906,
                    'feature_fraction': 0.6107010716526956,
                    'lambda_l1': 3.3514902603708787,
                    'lambda_l2': 1.5107218234197408,
                    'max_depth': 9,
                    'min_child_weight': 19.727868112851244,
                    'min_split_gain': 0.004848995254588181,
                    'num_leaves': 36,
                    'min_child_samples': 9,
                    'subsample_freq': 9
                }
            }
        }



        # In[142]:



        '''
        FEATURES = ['hour','day_of_week', 'month', 'day_of_year', 'rolling_min', 'rolling_max',
                    'rolling_sum', 'rolling_mean', 'rolling_median', 'rolling_std', 'rolling_quantile_25',
                    'rolling_quantile_75', 'lag_7_days', 'lag_14_days', 'lag_21_days', 'lag_28_days', 
                    'lag_30_days', 'lag_35_days', 'lag_42_days', 'lag_49_days', 'lag_56_days', 'lag_60_days',
                    'lag_1_hour', 'lag_2_hours', 'lag_3_hours',
                    'lag_1_days', 'lag_2_days', 'lag_3_days', 'lag_4_days', 'lag_5_days','lag_6_days',
                    ] + WEATHER_FEATURES

        '''

        TARGET = 'Occupancy'

        X_train = train[FEATURES]
        y_train = train[TARGET]

        X_test = test[FEATURES]
        y_test = test[TARGET]

        from sklearn.model_selection import train_test_split

        def bayes_parameter_opt_lgb(X, y, test_size=0.25, init_round=20, opt_round=30, random_seed=6, n_estimators=10000,
                                    learning_rate=0.05, output_process=False):

            # Split data into training and testing sets
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_seed)

            # Prepare data
            train_data = lgb.Dataset(data=X_train, label=y_train)

            # Parameters and evaluation function
            def lgb_eval(num_leaves, feature_fraction, bagging_fraction, max_depth,
                        lambda_l1, lambda_l2, min_split_gain, min_child_weight):

                params = {'objective': 'regression_l1', 'num_iterations': 1000, 'learning_rate': 0.05,
                        'early_stopping_round': 20, 'metric': 'rmse'}
                params["num_leaves"] = int(round(num_leaves))
                params['feature_fraction'] = max(min(feature_fraction, 1), 0)
                params['bagging_fraction'] = max(min(bagging_fraction, 1), 0)
                params['max_depth'] = int(round(max_depth))
                params['lambda_l1'] = max(lambda_l1, 0)
                params['lambda_l2'] = max(lambda_l2, 0)
                params['min_split_gain'] = min_split_gain
                params['min_child_weight'] = min_child_weight

                model = lgb.train(params, train_data, valid_sets=[train_data])

                y_pred = model.predict(X_test, num_iteration=model.best_iteration)
                rmse = np.sqrt(mean_squared_error(y_test, y_pred))
                
                return -rmse  # Minimize RMSE

            # Bayesian optimization setup
            lgbBO = BayesianOptimization(lgb_eval, {'num_leaves': (24, 45),
                                                    'feature_fraction': (0.1, 0.9),
                                                    'bagging_fraction': (0.5, 1),
                                                    'max_depth': (5, 9),
                                                    'lambda_l1': (0, 5),
                                                    'lambda_l2': (0, 3),
                                                    'min_split_gain': (0.001, 0.1),
                                                    'min_child_weight': (5, 60)}, random_state=random_seed)

            # Perform optimization
            lgbBO.maximize(init_points=init_round, n_iter=opt_round)

            # Output optimization process if specified
            if output_process:
                lgbBO.points_to_csv("bayes_opt_result.csv")

            # Return optimized parameters
            return lgbBO

        #opt_params = bayes_parameter_opt_lgb(X_train, y_train)

        """
        params = opt_params.max['params']
        params['num_leaves'] = int(round(params['num_leaves']))
        params['max_depth'] = int(round(params['max_depth']))
        params['min_child_samples'] = int(round(params['max_depth']))
        params['subsample_freq'] = int(round(params['max_depth']))
        params
        """

        # File path
        file_path = 'params.txt'

        # Function to save parameters to a file
        def save_params_to_file(parking_lot_name, params, file_path):
            # Check if the file already exists
            if os.path.exists(file_path):
                # Open the file in append mode
                with open(file_path, 'a') as file:
                    # Write the parking lot name and parameters
                    file.write(f"\n{parking_lot_name}\n")
                    for key, value in params.items():
                        file.write(f"{key}: {value}\n")
            else:
                # Open the file in write mode (creating a new file)
                with open(file_path, 'w') as file:
                    # Write the parking lot name and parameters
                    file.write(f"{parking_lot_name}\n")
                    for key, value in params.items():
                        file.write(f"{key}: {value}\n")

        # Save the parameters to the file
        #save_params_to_file(parking_lot_to_predict, params, file_path)

        """
        reg = lgb.LGBMRegressor(boosting_type='gbdt',
                            n_estimators=1000,
                            early_stopping_rounds=20,
                            objective='regression_l1',
                            max_depth=5,
                            min_child_samples=1,
                            learning_rate=0.05,
                            colsample_bytree=0.91,
                            subsample=0.5,
                            reg_lambda=0.2,
                            num_leaves=31,  # Adjust based on dataset size and complexity
                            min_child_weight=0.001,  # Adjust based on data characteristics
                            subsample_freq=1,  # Frequency for bagging
                            reg_alpha=0.0,  # L1 regularization
                            )
                            """
        
        reg = lgb.LGBMRegressor(boosting_type='gbdt',
                            n_estimators=1000,
                            early_stopping_rounds=20,
                            objective='regression_l1',
                            max_depth=5,
                            min_child_samples=1,
                            learning_rate=0.05,
                            colsample_bytree=0.91,
                            subsample=0.5,
                            reg_lambda=0.2,
                            num_leaves=31,  # Adjust based on dataset size and complexity
                            min_child_weight=0.001,  # Adjust based on data characteristics
                            subsample_freq=1,  # Frequency for bagging
                            reg_alpha=0.0,  # L1 regularization
                            )
        
        reg.set_params(**parameters[time_duration_str][parking_lot_to_predict])
        #reg.set_params(**params)


        """
                                num_leaves=50,
                                num_iterations = 200,
                                feature_fraction = 0.4,
                                max_cat_threshold = 1,
                                path_smooth = 10,
                                extra_trees = False
                                """
                                

        reg.fit(X_train, y_train, eval_set=[(X_train, y_train), (X_test, y_test)])

        y_pred = reg.predict(X_test)
        y_pred = np.maximum(y_pred, 0)

        # Store actual and predicted values along with their datetime index in the DataFrame
        actual_vs_pred_df = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred}, index=test.index)


        # In[143]:

        

        actual_vs_pred_df.to_csv(f'lgb_{parking_lot_to_predict}_{time_duration_str}_actual_vs_predicted.csv', index=True)


        # In[144]:


        # Create figure
        plt.figure(figsize=(15, 6))

        # Plot the initial training data
        plt.plot(train.index, train['Occupancy'], label='Initial Training Data', color='gray', linewidth=1)

        # Plot for the actual and predicted values
        plt.plot(actual_vs_pred_df.index, actual_vs_pred_df['Actual'], label='Actual', linewidth=1)

        # Plot labels and title
        plt.xlabel('Date')
        plt.ylabel('Occupancy')
        plt.title('Actual Occupancy')

        # Show legend
        plt.legend()

        # Show plot
        #plt.show()


        # In[145]:


        # Create figure
        plt.figure(figsize=(15, 6))

        # Plot the initial training data
        plt.plot(train.index, train['Occupancy'], label='Initial Training Data', color='gray', linewidth=1)

        # Plot for the actual and predicted values
        plt.plot(actual_vs_pred_df.index, actual_vs_pred_df['Actual'], label='Actual', linewidth=1)
        plt.plot(actual_vs_pred_df.index, actual_vs_pred_df['Predicted'], label='Predicted', linewidth=1)

        # Plot labels and title
        plt.xlabel('Date')
        plt.ylabel('Occupancy')
        plt.title(f'Actual vs. Predicted Occupancy for {parking_lot_to_predict}')

        # Show legend
        plt.legend()

        # Show plot
        #plt.show()


        # In[146]:


        # Filter actual_vs_pred_df to include only the testing period
        testing_actual_vs_pred_df = actual_vs_pred_df.loc[y_test.index]

        # Create figure
        plt.figure(figsize=(15, 6))

        # Plot for the actual and predicted values during the testing period
        plt.plot(testing_actual_vs_pred_df.index, testing_actual_vs_pred_df['Actual'], label='Actual', linewidth=1)
        plt.plot(testing_actual_vs_pred_df.index, testing_actual_vs_pred_df['Predicted'], label='Predicted', linewidth=0.5)

        # Plot labels and title
        plt.xlabel('Date')
        plt.ylabel('Occupancy')
        #plt.title(f'Testing Actual vs. Predicted Occupancy for {parking_lot_to_predict}')

        title_str = ""
        if time_duration_str == "longterm":
            title_str = "Long Term"
        elif time_duration_str == "1week":
            title_str = "1 week"
        elif time_duration_str == "1day":
            title_str = "1 day"
        else:
            title_str = "4 hours"


        plt.title(f'LightGBM - {parking_lot_to_predict} Predicting ' + title_str)

        # Show legend
        plt.legend()

        plt.savefig(f'lgb_graphs/{parking_lot_to_predict}/{parking_lot_to_predict}_{time_duration_str}__actual_vs_pred.png')

        # Show plot
        #plt.show()


        # In[147]:


        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
        import numpy as np

        # Extract actual and predicted values
        actual_values = testing_actual_vs_pred_df['Actual']
        predicted_values = testing_actual_vs_pred_df['Predicted']

        # Calculate RMSE
        rmse = np.sqrt(mean_squared_error(actual_values, predicted_values))

        # Calculate MAE
        mae = mean_absolute_error(actual_values, predicted_values)

        #mae_percentage = mae / capacity

        # Calculate MSE
        mse = mean_squared_error(actual_values, predicted_values)

        # Calculate R-squared
        r2 = r2_score(actual_values, predicted_values)

        print("ERRORS_SHOWN")

        print("MAE:", mae)

        print("MSE:", mse)

        
        print("RMSE:", rmse)
        print("R-squared:", r2)

        # Create a dictionary with your data
        error_data = {
            "Metric": ["MAE", "MSE", "RMSE", "R-squared"],
            parking_lot_to_predict: [mae, mse, rmse, r2]
        }

        # Create a DataFrame
        error_df = pd.DataFrame(error_data)

        # Define the CSV file path
        csv_file_path = "lgb_" + time_duration_str + "_metric.csv"

        # Check if the CSV file exists
        if os.path.isfile(csv_file_path):
            # If the file exists, read the existing data
            existing_df = pd.read_csv(csv_file_path)
            # Set "Metric" as the index for both DataFrames
            existing_df.set_index("Metric", inplace=True)
            error_df.set_index("Metric", inplace=True)
            # Combine the DataFrames along the columns
            combined_df = existing_df.combine_first(error_df).reset_index()
            # Save the combined DataFrame to the CSV file
            combined_df.to_csv(csv_file_path, index=False)
        else:
            # If the file does not exist, write the new data
            error_df.to_csv(csv_file_path, index=False)

        print(f"Metrics saved to {csv_file_path}")

        


        # In[148]:


        import plotly.graph_objects as go


        # Create a new figure
        fig = go.Figure()

        # Add trace for the initial training data
        fig.add_trace(go.Scatter(x=train.index, y=train['Occupancy'],
                                name='Initial Training Data',
                                line=dict(color='gray', width=1),
                                hovertemplate='<b>Date</b>: %{x|%m-%d-%Y}<br>' +
                                            '<b>Occupancy</b>: %{y}<br>' +
                                            '<b>Day of Week</b>: %{x| %A}<extra></extra>'))


        # Update layout
        fig.update_layout(
            title=f'Comparison of Predicted and Actual Parking Occupancy for {parking_lot_to_predict}',
            xaxis=dict(
                rangeslider=dict(visible=True),
                type='date'
            ),
            yaxis_title='Occupancy',
            template='plotly_white',
        )

        # Update axes appearance
        fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='lightgrey')
        fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor='lightgrey')

        # Show the plot
        #fig.show()


        # In[149]:


        import plotly.graph_objects as go


        # Create a new figure
        fig = go.Figure()


        # Add trace for the actual values
        fig.add_trace(go.Scatter(x=testing_actual_vs_pred_df.index, y=testing_actual_vs_pred_df['Actual'],
                                name='Actual Parking Occupancy',
                                line=dict(color='blue', width=0.5),
                                hovertemplate='<b>Date</b>: %{x|%m-%d-%Y}<br>' +
                                            '<b>Actual Occupancy</b>: %{y}<br>' +
                                            '<b>Day of Week</b>: %{x| %A}<extra></extra>'))


        # Add trace for the predicted values
        fig.add_trace(go.Scatter(x=testing_actual_vs_pred_df.index, y=testing_actual_vs_pred_df['Predicted'],
                                name='Predicted Parking Occupancy',
                                line=dict(color='red', width=0.5),
                                hovertemplate='<b>Date</b>: %{x|%m-%d-%Y}<br>' +
                                            '<b>Predicted Occupancy</b>: %{y}<br>' +
                                            '<b>Day of Week</b>: %{x| %A}<extra></extra>'))


        # Update layout
        fig.update_layout(
            title=f'Comparison of Predicted and Actual Parking Occupancy for {parking_lot_to_predict}',
            xaxis=dict(
                rangeslider=dict(visible=True),
                type='date'
            ),
            yaxis_title='Occupancy',
            template='plotly_white',
            annotations=[
                dict(xref='paper', yref='paper', x=0.5, y=0.9,
                    text=f'RMSE: {rmse:.2f}', showarrow=False),
                dict(xref='paper', yref='paper', x=0.5, y=0.85,
                    text=f'MAE: {mae:.2f}', showarrow=False),
                dict(xref='paper', yref='paper', x=0.5, y=0.8,
                    text=f'MSE: {mse:.2f}', showarrow=False),
                dict(xref='paper', yref='paper', x=0.5, y=0.75,
                    text=f'R-squared: {r2:.2f}', showarrow=False)
            ]
        )

        # Update axes appearance
        fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='lightgrey')
        fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor='lightgrey')

        # Show the plot
        #fig.show()


        # In[150]:


        import numpy as np
        import pandas as pd
        import matplotlib.pyplot as plt
        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

        # Ensure y_test has a DateTimeIndex
        start_date = y_test.index.min()
        end_date = y_test.index.max()

        # Select a random start date within the y_test date range, ensuring there's room for 2 days after it
        random_start_date = start_date + pd.to_timedelta(np.random.randint(0, (end_date - start_date).days - 1), unit='D')
        random_end_date = random_start_date + pd.Timedelta(days=7)

        # Filter the dataframes based on the 2-day range
        train_filtered = train.loc[(train.index >= random_start_date) & (train.index <= random_end_date)]
        actual_vs_pred_filtered = actual_vs_pred_df.loc[(actual_vs_pred_df.index >= random_start_date) & (actual_vs_pred_df.index <= random_end_date)]

        # Ensure alignment of actual and predicted values
        actual_vs_pred_filtered = actual_vs_pred_filtered.dropna(subset=['Actual', 'Predicted'])

        # Calculate errors
        actual = actual_vs_pred_filtered['Actual']
        predicted = actual_vs_pred_filtered['Predicted']

        mse = mean_squared_error(actual, predicted)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(actual, predicted)
        r2 = r2_score(actual, predicted)

        # Create figure
        plt.figure(figsize=(15, 6))

        # Plot the initial training data
        plt.plot(train_filtered.index, train_filtered['Occupancy'], label='Initial Training Data', color='gray', linewidth=1)

        # Plot for the actual and predicted values
        plt.plot(actual_vs_pred_filtered.index, actual_vs_pred_filtered['Actual'], label='Actual', linewidth=1)
        plt.plot(actual_vs_pred_filtered.index, actual_vs_pred_filtered['Predicted'], label='Predicted', linewidth=1)

        # Plot labels and title
        plt.xlabel('Date')
        plt.ylabel('Occupancy')
        plt.title(f'Actual vs. Predicted Occupancy for {parking_lot_to_predict}\n'
                f'RMSE: {rmse:.2f}, MAE: {mae:.2f}, MSE: {mse:.2f}, R²: {r2:.2f}')

        # Show legend
        plt.legend()

        # Save the graph
        #plt.savefig('lgbm_charts/actual_vs_pred.png')
    


        # Show plot
        #plt.show()


        # In[151]:


        actual_vs_pred_df


        # In[152]:


        # Record the end time
        end_time = time.time()

        # Calculate the total run time
        total_run_time = end_time - start_time
        print("Total run time:", total_run_time, "seconds")


        # In[153]:


        """
        # Retrain on all the data
        df = create_features(df)

        TARGET = 'Occupancy'

        X_all = df[FEATURES]
        y_all = df[TARGET]

        reg = lgb.LGBMRegressor(boosting_type='gbdt',
                                n_estimators=5000,
                                early_stopping_rounds=150,
                                objective='regression',
                                max_depth=5,
                                min_child_samples=1,
                                learning_rate=0.05,
                                colsample_bytree=0.91,
                                subsample=0.5,
                                reg_lambda=0.2)

        reg.fit(X_all, y_all, eval_set=[(X_all, y_all)])
        """


        # In[154]:


        first_date_time = df.iloc[0]['date']
        last_date_time = df.iloc[-1]['date']
        #print(last_date_time)

        new_date_time = last_date_time + pd.DateOffset(months=3)
        #print(new_date_time)

        first_date_time_str = first_date_time.strftime('%Y-%m-%d %H:%M:%S')
        last_date_time_str = last_date_time.strftime('%Y-%m-%d %H:%M:%S')
        new_date_time_str = new_date_time.strftime('%Y-%m-%d %H:%M:%S')
        print(first_date_time_str)
        print(last_date_time_str)
        #print(new_date_time_str)


        # In[155]:


        import pandas as pd

        def update_features_for_date(df, date):
            """
            Create time series features for a specific date from the datetime index.
            """
            df['date'] = df.index
            
            # Create a dictionary to hold the new feature values for the specific date
            new_features = {}
            new_features['month'] = date.month
            new_features['day_of_year'] = date.dayofyear
            new_features['day_of_week'] = date.dayofweek
            new_features['hour'] = date.hour  # Add hour feature

            df['year'] = df['date'].dt.year
            df['is_month_start'] = df['date'].dt.is_month_start.astype(int)
            df['is_month_end'] = df['date'].dt.is_month_end.astype(int)
            
            # Seasonality features
            df['sin_hour'] = np.sin(2 * np.pi * df['hour'] / 24)
            df['cos_hour'] = np.cos(2 * np.pi * df['hour'] / 24)
            df['sin_day'] = np.sin(2 * np.pi * df['day_of_year'] / 365.25)
            df['cos_day'] = np.cos(2 * np.pi * df['day_of_year'] / 365.25)
            df['sin_week'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
            df['cos_week'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
            df['sin_month'] = np.sin(2 * np.pi * df['month'] / 12)
            df['cos_month'] = np.cos(2 * np.pi * df['month'] / 12)

            # Seasonal indices (if applicable)
            # Autoregressive features (if applicable)
            # Time since last event (if applicable)
            # Day/night indicator
            df['is_day'] = np.where((df['hour'] >= 6) & (df['hour'] <= 18), 1, 0)
            
            # Weekend/weekday indicator
            df['is_weekend'] = df.date.dt.weekday // 4
            
            # Month of year
            df['month_of_year'] = df['date'].dt.month
            
            # Quarter of year
            df['quarter_of_year'] = df['date'].dt.quarter
            
            # Day/night duration
            df['day_duration'] = np.where(df['is_day'] == 1, 12 - df['hour'], 0)
            df['night_duration'] = np.where(df['is_day'] == 0, df['hour'], 0)

        def update_rolling_features_for_date(df, date):
            df['date'] = df.index
            
            # Calculate the rolling window size and ensure we have enough data points
            window_size = 7  # 7-day rolling window
            past_window = df.loc[:date].tail(window_size)
            
            if len(past_window) < window_size:
                raise ValueError("Not enough data points in the past window to calculate rolling features.")
            
            new_features = {}
            # Rolling features based on past window
            new_features['rolling_min'] = float(past_window['Occupancy'].min())
            new_features['rolling_max'] = float(past_window['Occupancy'].max())
            new_features['rolling_sum'] = float(past_window['Occupancy'].sum())
            new_features['rolling_mean'] = float(past_window['Occupancy'].mean())
            new_features['rolling_median'] = float(past_window['Occupancy'].median())
            new_features['rolling_std'] = float(past_window['Occupancy'].std())
            new_features['rolling_quantile_25'] = float(past_window['Occupancy'].quantile(0.25))
            new_features['rolling_quantile_75'] = float(past_window['Occupancy'].quantile(0.75))
            
            # Update the DataFrame at the specific date index
            for feature, value in new_features.items():
                df.loc[date, feature] = value


        # In[156]:


        def update_lags_for_date(df, date):
            """
            Create time lags for added time series features for a given date and allow the model to learn the temporal structure of the data.
            """
            target_map = df['Occupancy'].to_dict()

            # Create a dictionary to hold the lag features for the specific date
            lag_features = {}
            """
            lag_features['lag_1_hour'] = float(target_map.get(date - pd.Timedelta('1 hours'), None))
            lag_features['lag_2_hours'] = float(target_map.get(date - pd.Timedelta('2 hours'), None))
            lag_features['lag_3_hours'] = float(target_map.get(date - pd.Timedelta('3 hours'), None))
            """

            """
            lag_features['lag_7_days'] = float(target_map.get(date - pd.Timedelta('7 days'), None))
            lag_features['lag_14_days'] = float(target_map.get(date - pd.Timedelta('14 days'), None))
            lag_features['lag_21_days'] = float(target_map.get(date - pd.Timedelta('21 days'), None))
            lag_features['lag_28_days'] = float(target_map.get(date - pd.Timedelta('28 days'), None))
            lag_features['lag_30_days'] = float(target_map.get(date - pd.Timedelta('30 days'), None))
            lag_features['lag_35_days'] = float(target_map.get(date - pd.Timedelta('35 days'), None))
            lag_features['lag_42_days'] = float(target_map.get(date - pd.Timedelta('42 days'), None))
            lag_features['lag_49_days'] = float(target_map.get(date - pd.Timedelta('49 days'), None))
            lag_features['lag_56_days'] = float(target_map.get(date - pd.Timedelta('56 days'), None))
            lag_features['lag_60_days'] = float(target_map.get(date - pd.Timedelta('60 days'), None))
            """

            for lag_days in range(1, 20):  # lags for 1 to 6 days
                lag_features[f'lag_{lag_days * 7}_days'] = float(target_map.get(date - pd.Timedelta(f'{lag_days * 7} days'), None))

            
            # Daily lags
            for lag_days in range(1, 7):  # lags for 1 to 6 days
                lag_features[f'lag_{lag_days}_days'] = float(target_map.get(date - pd.Timedelta(f'{lag_days} days'), None))
                
            
            # Update the DataFrame at the specific date index
            for feature, value in lag_features.items():
                df.loc[date, feature] = value

        # Example usage:
        # date_time = pd.Timestamp('2023-12-14 22:00:00')  # Replace with your specific datetime
        # updated_df = update_lags_for_date(something_df, date_time)


        # In[157]:


        train_size = 0.75
        new_train, new_test = train_test_split(df, test_size=(1 - train_size), shuffle=False)
        old_test= new_test.copy()

        # Define rolling calculation columns and time lag data columns to be cleaned
        rolling_calculation_columns = [col for col in new_test.columns if 'rolling' in col]  # Example: Identify rolling calculation columns
        time_lag_columns = [col for col in new_test.columns if 'lag' in col]  # Example: Identify time lag data columns
        occupancy_column = [col for col in new_test.columns if 'Occupancy' in col]  # Example: Identify occupancy data columns

        # Iterate over rolling calculation columns and set data to NaN
        for col in rolling_calculation_columns:
            new_test[col] = np.nan

        # Iterate over time lag data columns and set data to NaN
        for col in time_lag_columns:
            new_test[col] = np.nan

        # Iterate over occupancy columns and set data to NaN
        for occ in occupancy_column:
            new_test[occ] = np.nan

        something_df = pd.concat([new_train, new_test])


        # In[158]:


        start_ind_time = new_train.iloc[-1]['date']
        end_ind_time = new_test.iloc[-1]['date']

        print(start_ind_time, end_ind_time)


        # In[159]:


        """
        # Create a date range from last_date_time to new_date_time
        date_range = pd.date_range(start=start_ind_time, end=end_ind_time, freq='H')  # 'D' represents day frequency
        for date_time in date_range:
            
            update_features_for_date(something_df, date_time)
            #update_rolling_features_for_date(something_df, date_time)
            update_lags_for_date(something_df, date_time)

                # Assuming 'row_data' contains the data for the single row you want to predict
                # 'row_data' should be a pandas Series or DataFrame with the same columns as your training data
            row_data = something_df[something_df.index == date_time].iloc[0]  # Example: selecting the first row from the test data
                # List of features to exclude
            features_to_exclude = ["Occupancy", "date"]  # Add the names of features you want to exclude

                # Filtering out excluded features
            filtered_row_data = row_data.drop(features_to_exclude, inplace=False)  # inplace=False ensures row_data remains unchanged

                # Extracting the features from the filtered row data
            X_single = filtered_row_data[FEATURES].values.reshape(1, -1)  # Reshaping to a 2D array as expected by the model

            filtered_row_data = pd.DataFrame([filtered_row_data])
            predicted_occupancy = reg.predict(filtered_row_data)
                # Extract the predicted occupancy value from the array
            predicted_occupancy_value = predicted_occupancy[0]

            print(predicted_occupancy_value)

                # Assign predicted occupancy to the 'Occupancy' column of the row with index 'last_date_time'
            something_df.loc[date_time, 'Occupancy'] = predicted_occupancy_value
            row_data = something_df[something_df.index == date_time].iloc[0]
            """


        # In[160]:


        """
        import matplotlib.pyplot as plt
        import matplotlib.dates as mdates

        num_count = 3

        # Select data between start_ind_time and start_ind_time_a
        selected_data = something_df.loc[(something_df.index >= date_time) & (something_df.index <= date_time + pd.DateOffset(months = num_count))]
        old_test_formatted = old_test.loc[(old_test.index >= date_time) & (old_test.index <= date_time + pd.DateOffset(months = num_count))]

        # Plot the 'Occupancy' column
        plt.figure(figsize=(10, 6))  # Adjust size as needed
        plt.plot(old_test_formatted.index, old_test_formatted['Occupancy'], linestyle='-', linewidth=0.2, color='blue', label='Old Test')
        plt.plot(selected_data.index, selected_data['Occupancy'], linestyle='-', linewidth=0.2, color='red', label='Selected Data')

        # Format the x-axis with date format
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
        plt.gca().xaxis.set_major_locator(mdates.AutoDateLocator())

        plt.title('Occupancy between {} and {}'.format(start_ind_time, date_time + pd.DateOffset(weeks = 1)))
        plt.xlabel('Date')
        plt.ylabel('Occupancy')
        plt.grid(True)
        plt.xticks(rotation=45)  # Rotate x-axis labels for better readability
        plt.legend()
        plt.tight_layout()
        plt.show()
        """


        # In[161]:


        """
        import pandas as pd
        import numpy as np
        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

        # Ensure the DataFrames are aligned by index
        aligned_data = old_test_formatted.align(selected_data, join='inner', axis=0)

        # Extract the 'Occupancy' columns from both DataFrames
        y_true = aligned_data[0]['Occupancy']
        y_pred = aligned_data[1]['Occupancy']

        # Calculate metrics
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)

        # Print the metrics
        print(f"RMSE: {rmse}")
        print(f"MAE: {mae}")
        print(f"MSE: {mse}")
        print(f"R²: {r2}")

        """


        # In[162]:


        # Get feature importances
        feature_importances = reg.feature_importances_

        # Get feature names
        feature_names = reg.feature_name_

        # Print feature importances and names
        for name, importance in zip(feature_names, feature_importances):
            print(name, ":", importance)


        # In[163]:


        feature_importances = reg.feature_importances_

        # Create a DataFrame to store the feature importances
        feature_importance = pd.DataFrame(data=feature_importances, index=X_train.columns, columns=['importance'])

        # Print the DataFrame
        print(feature_importance)


        # In[164]:


        X_train.columns


        # In[165]:


        import matplotlib.pyplot as plt

        # Normalize the feature importances to sum to 100%
        feature_importances_percentage = 100 * (feature_importances / np.sum(feature_importances))

        # Create a DataFrame for better handling
        feature_importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': feature_importances_percentage
        })

        # Sort the feature importances in ascending order
        sorted_feature_importance = feature_importance_df.sort_values('importance')

        # Plot the sorted feature importances
        plt.figure(figsize=(12, 10))
        barplot = plt.barh(sorted_feature_importance['feature'], sorted_feature_importance['importance'])

        # Adjust font size for each y-axis label individually
        for tick in plt.gca().get_yticklabels():
            tick.set_fontsize(8)

        plt.xlabel('Importance (%)', fontsize=12)  # Adjust font size for x-label
        plt.ylabel('Feature', fontsize=12)  # Adjust font size for y-label
        plt.title(f'Feature Importance for {parking_lot_to_predict}', fontsize=14)  # Adjust font size for title

        # Adjust font size for x-axis ticks
        plt.xticks(fontsize=10)

        plt.tight_layout()  # Adjust layout to prevent labels from overlapping
        #plt.show()

        plt.savefig(f'lgbm_charts/{time_duration_str}_{parking_lot_to_predict}_feature_importance.png')


        # In[166]:


        # Ensure 'date' column is treated as datetime
        df['date'] = pd.to_datetime(df['date'])

        # Clone the original DataFrame to preserve it
        extended_df = df.copy()

        # Extend the DataFrame with additional dates up to 1 year from the last date, incrementing by 1 hour
        last_date = pd.to_datetime(df['date'].max())
        new_dates = pd.date_range(start=last_date + pd.DateOffset(hours=1), end=last_date + pd.DateOffset(days=365), freq='H')

        # Create a DataFrame with the new dates
        new_data = pd.DataFrame({'date': new_dates})

        # Set 'date' as index for both original and new dataframes
        extended_df.set_index('date', inplace=True)
        new_data.set_index('date', inplace=True)

        # Concatenate the original DataFrame and the new dates DataFrame
        extended_df = pd.concat([extended_df, new_data])

        # Create 'isFuture' column based on date comparison
        extended_df['isFuture'] = extended_df.index > last_date

        # Display the first few rows of extended_df to verify
        print(extended_df.head())

        # Generate features on the extended DataFrame
        extended_df = create_features(extended_df)

        # Convert 'term_date' and 'is_holiday' to boolean types
        extended_df['term_date'] = extended_df['term_date'].astype(bool)
        extended_df['is_holiday'] = extended_df['is_holiday'].astype(bool)


        # In[167]:


        extended_df


        # In[168]:


        future_with_features = extended_df.query('isFuture').copy()


        # In[169]:


        future_with_features


        # In[170]:


        import numpy as np


        # Predict occupancy for future data
        future_predictions = reg.predict(future_with_features[FEATURES])

        # Ensure predicted occupancy is non-negative and rounded to the nearest integer
        future_predictions = np.round(np.maximum(future_predictions, 0)).astype(int)

        # Add rounded predicted occupancy to future_with_features
        future_with_features['Occupancy'] = future_predictions


        # In[171]:


        print(future_with_features.dtypes)


        # In[172]:


        future_with_features


        # In[173]:


        # Create a new figure
        fig = go.Figure()

        fig.add_trace(go.Scatter(x=future_with_features.index, y=future_with_features['Occupancy'],
                                name='Predicted Parking',
                                line=dict(color='blue', width=0.5),
                                hovertemplate='<b>Date</b>: %{x|%m-%d-%Y}<br>' +
                                            '<b>Patients</b>: %{y}<br>' +
                                            '<b>Day of Week</b>: %{x| %A}<extra></extra>'))

        title = f'Future Occupancy Forecast for {parking_lot_to_predict}'

        fig.update_layout(
            title=title,
            xaxis=dict(
                rangeslider=dict(visible=True),
                type='date'
            ),
            yaxis_title='Predicted Occupancy',
            template='plotly_white'
        )

        fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='lightgrey')
        fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor='lightgrey')

        #fig.show()


        # In[174]:


        import pandas as pd

        # Example: Assuming future_with_features is your DataFrame
        # future_with_features = pd.DataFrame(...)

        # Rename 'date' column to 'Timestamp'
        future_with_features.rename(columns={'date': 'Timestamp'}, inplace=True)

        # Select only 'Timestamp' and 'pred' columns
        columns_to_export = ['Timestamp', 'Occupancy']
        future_export = future_with_features[columns_to_export]

        # Define the CSV file path
        csv_file_path = f'LGBM_{parking_lot_to_predict}_longterm_future_predictions.csv'

        # Export to CSV
        future_export.to_csv(csv_file_path, index=False)

        print(f"Future predictions have been exported to {csv_file_path}")

