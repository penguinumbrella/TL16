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

#line 14000
#2018-02-14: 8 AM

# Read data from the original CSV file
# splits the data by row and saves it into a new file
# input_filename, output_filename: strings ending in .csv
# row, sensor : int
def split_data(input_filename, row, sensor, output_filename):
    data =  pd.read_csv(input_filename,
                    usecols=[0,sensor + 1],
                    index_col=[0],
                    parse_dates=[0])
    
    splitData = data.iloc[row:]
    splitData.to_csv(output_filename)


# creates a new file that only has the dates
# the date column needs to be called "date"
# the date column needs to be first column in the file
# input_filename, output_filename : strings ending in .csv
def get_dates_only_file(input_filename, output_filename ):
    data = pd.read_csv(input_filename,usecols=[0],
                    index_col=[0],
                    parse_dates=[0])

    df = pd.DataFrame(data.index, columns=['date'])
    df.to_csv(output_filename, index=False)

# sensor = 200
# split_data("traffic.csv", 15000, sensor, "traffic_testing_sensor_"+str(sensor)+".csv")
# get_dates_only_file("traffic_testing_sensor_"+str(sensor)+".csv", "traffic_testing_dates_only.csv")