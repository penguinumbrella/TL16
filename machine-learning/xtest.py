#!/usr/bin/env python
# coding: utf-8

# In[156]:


import pandas as pd
import joblib
import numpy as np
import matplotlib.pyplot as plt


import os

# Change the current working directory
os.chdir('C:\\cpen491\\TL16-2\\TL16\\machine-learning')

print(os.listdir)

# Verify the current working directory
print(os.getcwd())


# In[157]:


# -*- coding: utf-8 -*-
"""
Define holidays
"""

from pandas.tseries.holiday import (
    AbstractHolidayCalendar, DateOffset, EasterMonday, GoodFriday, Holiday, MO,
    next_monday, next_monday_or_tuesday
    )

class VancouverHolidayCalendar(AbstractHolidayCalendar):
    """
    Uses the pandas AbstractHolidayCalendar class to create a class for
    Vancouver holidays:
    Adjusts for observance date if set holidays fall on weekends
    New years - Jan 1
    Family Day - 3rd Monday in February
    Good Friday
    Easter Monday
    Victoria Day - Last Monday before May 25
    Canada Day - July 1
    Heritage Day - August 1
    Labour Day - September 1
    Thanksgiving - Second Monday in October
    Remembrance Day - November 11
    Christmas Day - December 25
    Boxing Day - December 26
    Additional holidays from December 25 to January 1
    See Pandas documentation for more information on holiday calendars
    http://pandas.pydata.org/pandas-docs/stable/timeseries.html#holidays-holiday-calendars
    Some sample code is here:
        http://mapleoin.github.io/perma/python-uk-business-days
        http://stackoverflow.com/documentation/pandas/7976/holiday-calendars#t=201703131711384942824
    """
    rules = [
        Holiday('New Years Day', month=1, day=1),
        Holiday('Family Day',
                month=2, day=1, offset=DateOffset(weekday=MO(3))),
        GoodFriday,
        EasterMonday,
        Holiday('Victoria Day',
                month=5, day=25, offset=DateOffset(weekday=MO(-1))),
        Holiday('Canada Day', month=7, day=1),
        Holiday('Labour Day',
                month=9, day=1, offset=DateOffset(weekday=MO(1))),
        Holiday('National Day for Truth and Reconciliation', month=9, day=30),
        Holiday('Thanksgiving',
                month=10, day=1, offset=DateOffset(weekday=MO(2))),
        Holiday('Remembrance Day',
                month=11, day=11),
        Holiday('Christmas Eve', month=12, day=24),
        Holiday('Christmas Day', month=12, day=25),
        Holiday('Boxing Day',
                month=12, day=26),
        Holiday('Additional Holiday 1', month=12, day=29),
        Holiday('Additional Holiday 2', month=12, day=28),
        Holiday('Additional Holiday 3', month=12, day=29),
        Holiday('Additional Holiday 4', month=12, day=30),
        Holiday('New Years Eve', month=12, day=31)
    ]


# In[158]:


# Function to create features from the datetime index
def create_features(df, label=None):
            """
            Create time series features from the datetime index
            """
            df = df.copy()

            df['term_date'] = False
            #df['is_holiday'] = False

            df['date'] = df.index
            df['day_of_week'] = df['date'].dt.dayofweek
            df['month'] = df['date'].dt.month
            df['day_of_year'] = df['date'].dt.dayofyear
            df['week_of_year'] = df['date'].dt.isocalendar().week
            
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



# In[161]:


import pandas as pd

def create_date_range_df(start_date, end_date):
    # Generate a date range with hourly frequency
    date_range = pd.date_range(start=start_date, end=end_date, freq='H')
    
    # Create a DataFrame from the date range
    df = pd.DataFrame(date_range, columns=['date'])
    #df.set_index('date', inplace=True)
    
    return df

# Example usage
start_date = '2024-04-05 03:00:00'
end_date = '2025-01-01 03:00:00'

df = create_date_range_df(start_date, end_date)

df


# In[162]:


import pandas as pd
import datetime

# Create an empty list to store the expanded data
expanded_data = []

# Create a set to store processed dates
processed_dates = set()

cal = VancouverHolidayCalendar()
holidays = cal.holidays(start=df['date'].min(), end=df['date'].max())

# Iterate over each row in the original DataFrame
for holiday_date  in holidays:
    # Extract the date from the Timestamp column
    date = holiday_date.date()
    print(date)
    
    # Check if the date has been processed before
    if date not in processed_dates:
        # Generate datetime objects for each hour of the day and append them to the list
        for hour in range(0, 24):
            expanded_data.append({'date': datetime.datetime.combine(date, datetime.time(hour))})
        
        # Add the date to the set of processed dates
        processed_dates.add(date)

# Create a DataFrame from the list of dictionaries
expanded_df = pd.DataFrame(expanded_data)

# Display the expanded DataFrame
print(expanded_df)


# In[163]:


# Filter expanded_df to include only dates present in holidays
expanded_df = expanded_df[expanded_df['date'].dt.date.isin(holidays.date)]

# Reset index of the filtered DataFrame
expanded_df.reset_index(drop=True, inplace=True)

# Display the filtered DataFrame
print(expanded_df)
# Save the modified DataFrame back to a CSV file
#expanded_df.to_csv("test.csv", index=False)

# Check if each timestamp in the DataFrame matches any of the additional timestamps
df['is_holiday'] = df['date'].isin(expanded_df['date'])


# In[164]:


df.set_index('date', inplace=True)
X_test_df_2 = create_features(df)
#X_test_df_2 = X_test_df
X_test_df_2 = X_test_df_2.drop(columns=['date'])
X_test_df_2


# In[ ]:





# In[165]:



# Load the trained model
loaded_model = joblib.load('trained_model.joblib')

# Make predictions using the loaded model
y_pred_loaded = loaded_model.predict(X_test_df_2)
y_pred_loaded = np.maximum(y_pred_loaded, 0)

# Create a DataFrame with the predicted values
predictions_df = pd.DataFrame({'Predicted': y_pred_loaded})

# Plot the predicted values without showing the x-axis
plt.figure(figsize=(12, 6))
plt.plot(predictions_df['Predicted'], label='Predicted', color='red')
plt.xlabel('Index')
plt.ylabel('Predicted Values')
plt.title('Predicted Values')
plt.legend()

# Hide the x-axis labels
plt.xticks([])
plt.show()


# In[ ]:




