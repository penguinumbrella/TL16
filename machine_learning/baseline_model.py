import torch
import numpy as np
from torch.utils.data import Dataset
import torch.nn as nn
import torch.nn.functional as F
import math
import pandas as pd
from prophet import Prophet
import seaborn as sns
import matplotlib.pyplot as plt
from pandas.api.types import CategoricalDtype
# export PYTHONPATH=/C:/Users/user/Desktop/CPEN 491/repo/TL16
#

class random_baseline_model():
    def __init__(self, filename, sensor):
        self.sensor = sensor
        self.data = pd.read_csv(filename,
                        usecols=[0,sensor + 1],
                        index_col=[0],
                        parse_dates=[0])
        
        label = str(sensor)
        cat_type = CategoricalDtype(categories=['Monday','Tuesday',
                                            'Wednesday',
                                            'Thursday','Friday',
                                            'Saturday','Sunday'],
                                ordered=True)

        df = self.data.copy()

        # here there are a few more features that are not utilized by this model for simplicity
        # but can be added later 
        df['date'] = df.index
        df['hour'] = df['date'].dt.hour
        
        df['dayofweek'] = df['date'].dt.dayofweek
        df['weekday'] = df['date'].dt.day_name()
        df['weekday'] = df['weekday'].astype(cat_type)
        df['quarter'] = df['date'].dt.quarter
        df['month'] = df['date'].dt.month
        df['year'] = df['date'].dt.year
        df['dayofyear'] = df['date'].dt.dayofyear
        df['dayofmonth'] = df['date'].dt.day
        df['date_offset'] = (df.date.dt.month*100 + df.date.dt.day - 320)%1300
        df['season'] = pd.cut(df['date_offset'], [0, 300, 602, 900, 1300], 
                            labels=['Spring', 'Summer', 'Fall', 'Winter']
                    )
        # Other features are not that useful 
        X = df[['hour', 'weekday','season']]
        y = df[label]

        self.features_and_target =  pd.concat([X, y], axis=1)
        self.group = self.features_and_target.groupby(['hour', 'weekday', 'season'])[str(sensor)].mean()
        self.pivot_group = self.features_and_target.groupby(['hour', 'weekday', 'season'])[str(sensor)].mean().reset_index()

    
    # Time is pd.DatetimeIndex()
    # example: time  = pd.DatetimeIndex(["8/1/2016 10:00:00"])
    # returns a numpy.float64 which is the prediction for the date provided
    def predict_one(self, time):
        date_offset = (time.month*100 + time.day- 320)%1300

        season = pd.cut(date_offset, [0, 300, 602, 900, 1300], 
                            labels=['Spring', 'Summer', 'Fall', 'Winter'])
        return self.group[time.hour[0]][time.day_name()[0]][season[0]]
    
    

    # format of the file: date - value
    # returns a numpy.ndarray of the predicted values only (numpy.float64)
    def predict_many(self, filename):
        dates = pd.read_csv(filename, usecols=[0],
                        index_col=[0],
                        parse_dates=[0])

        output = np.zeros(len(dates.index))
        date_offset = (dates.index.month*100 + dates.index.day - 320)%1300
        season = pd.cut(date_offset, [0, 300, 602, 900, 1300], 
                            labels=['Spring', 'Summer', 'Fall', 'Winter'])
        i = 0
        for date in dates.index:            
            output[i] = (self.group[pd.DatetimeIndex([date]).hour[0]][pd.DatetimeIndex([date]).day_name()[0]][season[0]])
            i += 1

        return output

    # doesn't work well right now lmao
    # index : array of strings: either one or two of ["hour", "weekday", "season"]
    # string one of "hour", "weekday", "season"
    def plot(self, index, column):
        pivot_table = self.pivot_group.pivot_table(index=index, columns=column, values=str(self.sensor))
        pivot_table.plot(kind='bar', figsize=(10, 6))
        plt.title(f'Mean Target Value by Hour, Day, and Season')
        plt.xlabel(index)
        plt.ylabel('Mean Target Value')
        plt.xticks(rotation=45)
        plt.legend(title=column, bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.tight_layout()
        plt.show()

