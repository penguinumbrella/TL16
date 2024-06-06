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
import source.scrape_dates as scrape_dates




parks = ["North","West","Rose","Health Sciences","Fraser","Thunderbird","University Lot Blvd"]

class random_baseline_model():
    def __init__(self, filename, school_terms=False, import_filename="None"):


        if import_filename != "None":
            self.school_terms = school_terms
            self.term_dates_full = pd.read_csv(import_filename, parse_dates=[0])
            baseline_table = pd.read_csv(filename)
            self.group = baseline_table.groupby(['park', "hour", "weekday","season","Term"]).first()["cars"]



        else:
            self.school_terms = school_terms
            self.data = pd.read_csv(filename,
                            usecols=["Timestamp", "North","West","Rose","Health Sciences","Fraser","Thunderbird","University Lot Blvd"],
                            index_col=[0],
                            parse_dates=[0])
            
            cat_type = CategoricalDtype(categories=['Monday','Tuesday',
                                                'Wednesday',
                                                'Thursday','Friday',
                                                'Saturday','Sunday'],
                                    ordered=True)

            df = self.data.copy()

            # Features
            df['date'] = df.index
            df['hour'] = df['date'].dt.hour
            df['dayofweek'] = df['date'].dt.dayofweek
            df['weekday'] = df['date'].dt.day_name()
            df['weekday'] = df['weekday'].astype(cat_type)
            
            seasons = []
            for date in self.data.index:
                seasons.append(get_season(date))
            df['season'] = seasons


            self.features_and_target = {}
            self.group= {}
            self.pivot_group= {}

        
            #------------------------------------------------------------------------------------------------
            if self.school_terms == True:
                # This file has the term dates for the training data
                term_dates_train = pd.read_csv("term dates.csv",parse_dates=[0])

                term_column = np.zeros(len(self.data)) # Zeros are going to be the breaks

                i = 0
                t = 0
                for time in self.data.index:
                    if time >= term_dates_train.iloc[i,0]:
                        if time < term_dates_train.iloc[i+1,0]:
                            if time.month >= 5 and time.month <= 8:
                                term_column[t] = 1 # Summer terms
                            else:
                                term_column[t] = 2 # Fall / Winter terms
                        else:
                            i += 2
                    t += 1
                    
                df["Term"] = term_column
                # df_train.to_csv("df_train.csv",index=True)  

                X = df[['hour', 'weekday','season', 'Term']]
                for parkade in parks:
                    y = df[parkade]

                    self.features_and_target[parkade] =  pd.concat([X, y], axis=1)
                    self.group[parkade]  = round(self.features_and_target[parkade].groupby(['hour', 'weekday', 'season', 'Term'],observed=False )[parkade].mean())
                    self.pivot_group[parkade]  = self.features_and_target[parkade].groupby(['hour', 'weekday', 'season', 'Term'],observed=False )[parkade].mean().reset_index()
                    
                    
                    term_dates_train_list = list(term_dates_train["Timestamp"])
                    term_dates_scraped = scrape_dates.get_term_dates()
                    term_dates_train_list.extend(term_dates_scraped)
                    self.term_dates_full=  pd.DataFrame({"Timestamp" : term_dates_train_list})

                    

            #------------------------------------------------------------------------------------------------
            else:
                X = df[['hour', 'weekday','season']]
            
                for parkade in parks:
                    y = df[parkade]

                    self.features_and_target[parkade] =  pd.concat([X, y], axis=1)
                    self.group[parkade]  = round(self.features_and_target[parkade].groupby(['hour', 'weekday', 'season'],observed=False )[parkade].mean())
                    self.pivot_group[parkade]  = self.features_and_target[parkade].groupby(['hour', 'weekday', 'season'],observed=False )[parkade].mean().reset_index()




    
    # Time is pd.DatetimeIndex()
    # example: time  = pd.DatetimeIndex(["8/1/2016 10:00:00"])
    # parkade is a string that is one of "parks" above
    # returns a numpy.float64 which is the prediction for the date provided
    
    def predict_one(self, time, parkade):
        # date_offset = (time.month*100 + time.day- 320)%1300

        season = get_season(time)

        if self.school_terms == False:
            return self.group[parkade][time.hour[0]][time.day_name()[0]][season]
        
        else:
        #   Find the term for the provided date
            term = 0
            i = 0
            while i < (len(self.term_dates_full)):
                if time >= self.term_dates_full.iloc[i,0] and time < self.term_dates_full.iloc[i+1,0]:
                    if time.month >= 5 and time.month <= 8:
                        term = 1
                    else:
                        term = 2
                    break
                else:
                    i += 2

            return self.group[parkade][time.hour[0]][time.day_name()[0]][season][term]
       


    
    

    # format of the file: date - value
    # parkades: a list of strings from "parks"
    # returns a numpy.ndarray of the predicted values only (numpy.float64)
    # and writes the predictions into a csv file
    def predict_many(self, filename, parkades, out_filename="predict_many_output.csv"):
        dates = pd.read_csv(filename, usecols=[0],
                        index_col=[0],
                        parse_dates=[0])

        occupancy  = {key: np.zeros(len(dates.index)) for key in parkades}

        
        if self.school_terms == False:
            i = 0
            for date in dates.index: 

                season = get_season(date)
                
                # date_offset = (time.month*100 + time.day- 320)%1300
                # season = pd.cut(date_offset, [0, 300, 602, 900, 1300], 
                #             labels=['Spring', 'Summer', 'Fall', 'Winter'])
                
                for park in parkades:       
                    occupancy[park][i] = self.group[park][pd.DatetimeIndex([date]).hour[0]][pd.DatetimeIndex([date])\
                                        .day_name()[0]][season]
                i += 1

            for park in parkades:  
                dates[park] = occupancy[park]
            
        
        else:
            term_column = np.zeros(len(dates))
            dates_copy = dates.copy()

            i = 0
            t = 0
            first = True
            for time in dates.index:
                if first == True:
                    first = False
                    for k in range(0,len(self.term_dates_full.index),2):
                        if time >= self.term_dates_full.iloc[k,0]:
                            if time < self.term_dates_full.iloc[k+1,0]:
                                if time.month >= 5 and time.month <= 8:
                                    term_column[t] = 1
                                else:
                                    term_column[t] = 2
                                
                                i = k
                                break
                       
                
                else:
                    if time >= self.term_dates_full.iloc[i,0]:
                        if time < self.term_dates_full.iloc[i+1,0]:
                            if time.month >= 5 and time.month <= 8:
                                term_column[t] = 1
                            else:
                                term_column[t] = 2
                        else:
                            i += 2

                t += 1
            dates_copy["Term"] = term_column

            i = 0
            for date in dates.index:
                date_str = date.strftime('%Y-%m-%d %H:%M:%S')
                datetime_index = pd.DatetimeIndex([date_str])
                
                # this does not work for march 20th so I changed the implemntation to get_season()

                # date_offset = (datetime_index.month*100 + datetime_index.day - 320)%1300 # 
                # season = pd.cut(date_offset, [0, 300, 602, 900, 1300], 
                #             labels=['Spring', 'Summer', 'Fall', 'Winter']) 
                season = get_season(date)
                    
                for park in parkades:   
                    occupancy[park][i] = self.group[park][datetime_index.hour[0]]\
                        [datetime_index.day_name()[0]][season][dates_copy.loc[date]["Term"]] 
                i += 1

            for park in parkades:  
                dates[park] = occupancy[park]

        if(out_filename):
            dates.to_csv(out_filename,index=True)  

        return dates
    


    def save_model(self, group_file_name, term_dates_full_filename):
        # convert the model table (group) into a  dataframe that can be save as a csv file

        parking_lots = ["North","West","Rose","Health Sciences","Fraser","Thunderbird","University Lot Blvd"]
        park = "North"
        full_df = self.group[park].reset_index() 
        full_df = full_df.rename(columns={park: "cars"})
        full_df.insert(0, 'park', park)

        for park in parking_lots[1:]:
            single_park_df = self.group[park].reset_index() 
            single_park_df = single_park_df.rename(columns={park: "cars"})
            single_park_df.insert(0, 'park', park)
            full_df = pd.concat([full_df, single_park_df], axis=0)

        
        full_df.to_csv(group_file_name, index=False)
        self.term_dates_full.to_csv(term_dates_full_filename, index=False)




    # index : array of strings: either one or two of ["hour", "weekday", "season"]
    # string one of "hour", "weekday", "season"
    # def plot(self, index, column):
    #     pivot_table = self.pivot_group.pivot_table(index=index, columns=column, values=parkade)
    #     pivot_table.plot(kind='bar', figsize=(10, 6))
    #     plt.title(f'Mean Target Value by Hour, Day, and Season')
    #     plt.xlabel(index)
    #     plt.ylabel('Mean Target Value')
    #     plt.xticks(rotation=45)
    #     plt.legend(title=column, bbox_to_anchor=(1.05, 1), loc='upper left')
    #     plt.tight_layout()
    #     plt.show()


# The input is a pd.Timestamp or pd.Datetimeindex
def get_season(date):
    month = date.month
    if month in [3, 4, 5]:
        return 'Spring'
    elif month in [6, 7, 8]:
        return 'Summer'
    elif month in [9, 10, 11]:
        return 'Fall'
    else:
        return 'Winter'
