import torch
import numpy as np
from torch.utils.data import Dataset
import torch.nn as nn
import torch.nn.functional as F
import math
import pandas as pd
from prophet import Prophet
import seaborn as sns
import os
import sys


import matplotlib.pyplot as plt
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings("ignore")
plt.style.use('ggplot')
plt.style.use('fivethirtyeight')

current_dir = os.path.dirname(os.path.abspath(__file__))
baseline_utils_dir = os.path.join(current_dir, 'baseline\\src')
sys.path.append(baseline_utils_dir)
import baseline.src.baseline_model as baseline_model 

prophet_utils_dir = os.path.join(current_dir, 'prophet')
sys.path.append(prophet_utils_dir)

from prophetModel.prophet_helper_functions import *

# define necessary lists and variables
months = ['jan', 'feb', 'mar','apr', 'may','jun','jul', 'aug', 'sep','oct','nov','dec']
days = ['mon','tue','wed','thu','fri','sat', 'sun']
seasons = ["summer", "winter", "spring", "fall"]
day_types = ['weekday', 'weekend']
temp_types = ['cold', 'warm']
humid_types = ['humid', 'notHumid']
parks = ["North","West","Rose","Health Sciences","Fraser","Thunderbird","University Lot Blvd"]
capacities = {
    "North" : 1010,
    "West" : 1219,
    "Rose" : 800,
    "Health Sciences" : 1022,
    "Fraser" : 725,
    "Thunderbird" : 1634,
    "University Lot Blvd" : 216
}
csv_filePath = '../results/csv/'
hp_csv_filePath = '../results/hp_csv/'
graph_filePath = '../results/graphs/'

test_data_filename_raw = '../data/data_test_newCovid.csv'
test_data_filename_normal = '../data/AVG_w_data_test_newCovid.csv'

fbprophet_names = ["Prophet", "pr", 'prophet', 'fbp', 'FBProphet', 'fbprophet', 'PROPHET', 'fbpr']
baseline_names = ['Baseline', 'baseline', 'bsln', 'BASELINE']
lightgbm_names = ['LightGBM', 'lightgbm', 'lightGBM', 'lgbm', 'LGBM', 'LIGHTGBM']

model_names = fbprophet_names + baseline_names + lightgbm_names



def main():
    parkade = sys.argv[1] 
    model  = sys.argv[2]

    # if the parkade and/or the model aren't valid exit and request a new pair
    if (parkade not in parks) or (model not in model_names):
        print("Please enter a valid parkade and/or valid model")
        return
    
    # standardize the input names of the models
    if model in fbprophet_names:
        model = 'Prophet'
    elif model in baseline_names:
        model = 'Baseline'
    else:
        model = 'LightGBM'

    print(f"Model: {model}, Parkade : {parkade}")

    


    #-------------------------------------------------------------------------------------------------------

    if model == 'Prophet':
        test_data = pd.read_csv(test_data_filename_raw, \
                            parse_dates=[0], index_col=[0], usecols=['Timestamp', parkade])
        
        # Prophet also takes in 7 mode arguments for its hyperparameters 
        # since this script trains the model then predicts with it
        changepoint_prior_scale = float(sys.argv[3])
        seasonality_prior_scale = float(sys.argv[4])
        
        yearly_seasonality = int(sys.argv[5])
        weekly_seasonality = int(sys.argv[6])
        daily_seasonality = int(sys.argv[7])

        weekly_prior_scale = float(sys.argv[8])
        daily_prior_scale = float(sys.argv[9])

        # A string with the hyperparameter combination used to identify the specific model
        hp_combo_name= f'{changepoint_prior_scale}_{seasonality_prior_scale}_{yearly_seasonality}_{weekly_seasonality}_{daily_seasonality}_{weekly_prior_scale}_{daily_prior_scale}'
        print(hp_combo_name)

        # Load the training data
        # train_data = pd.read_csv('../data/data_train_newCovid.csv',\
        #                     parse_dates=[0], index_col=[0], usecols=['Timestamp', parkade])

        train_data = pd.read_csv('../data/AVG_w_data_train_newCovid.csv',\
                            parse_dates=[0], index_col=[0], usecols=['Timestamp', parkade])

        

        # Becasue we are missing a lot of data for this parkade 
        if parkade == 'University Lot Blvd':
            cutoff_ts = pd.Timestamp("2019-07-01 03:0:00")
            train_data = train_data.truncate(before=cutoff_ts)


        # Reformat the data so that prophet can read it 
        train_prophet = train_data.reset_index() \
        .rename(columns={'Timestamp':'ds',
                            parkade:'y'})

        test_prophet = test_data.reset_index() \
        .rename(columns={'Timestamp':'ds',
                            parkade:'y'})
        

        print(f"Prophet: Defining Seasonalities")

        # training set custom seasonlities
        train_prophet['weekend'] = train_prophet['ds'].apply(is_weekend)
        train_prophet['weekday'] = ~train_prophet['ds'].apply(is_weekend)
            
        train_prophet['summer'] = train_prophet['ds'].apply(is_summer)
        train_prophet['winter'] = train_prophet['ds'].apply(is_winter)
        train_prophet['fall'] = train_prophet['ds'].apply(is_fall)
        train_prophet['spring'] = train_prophet['ds'].apply(is_spring)

        # train_prophet[['summer', 'spring', 'fall', 'winter']] = train_prophet['ds'].apply(set_season)

        train_prophet['vacation'] = train_prophet['ds'].apply(is_vacation)
        train_prophet['school_term'] = ~train_prophet['ds'].apply(is_vacation)

        train_prophet['vacation_AND_weekend'] = train_prophet['vacation'] & train_prophet['weekend'] 
        train_prophet['vacation_AND_weekday'] = train_prophet['vacation'] & ~train_prophet['weekend'] 
        train_prophet['school_term_AND_weekend'] = ~train_prophet['vacation'] & train_prophet['weekend'] 
        train_prophet['school_term_AND_weekday'] = ~train_prophet['vacation'] & ~train_prophet['weekend'] 


        # train_prophet['cold'] = train_prophet['temp'].apply(is_cold)
        # train_prophet['warm'] = ~train_prophet['temp'].apply(is_cold)

        # train_prophet['humid'] = train_prophet['humidity'].apply(is_humid)
        # train_prophet['notHumid'] = ~train_prophet['humidity'].apply(is_humid)

        #---------------------------------------------------------------------------------
        #---------------------------------------------------------------------------------
        #---------------------------------------------------------------------------------

        #testing set custom seasonlities
        test_prophet['weekend'] = test_prophet['ds'].apply(is_weekend)
        test_prophet['weekday'] = ~test_prophet['ds'].apply(is_weekend)

            
        test_prophet['summer'] = test_prophet['ds'].apply(is_summer)
        test_prophet['winter'] = test_prophet['ds'].apply(is_winter)
        test_prophet['fall'] = test_prophet['ds'].apply(is_fall)
        test_prophet['spring'] = test_prophet['ds'].apply(is_spring)

        test_prophet['vacation'] = test_prophet['ds'].apply(is_vacation)
        test_prophet['school_term'] = ~test_prophet['ds'].apply(is_vacation)

        test_prophet['vacation_AND_weekend'] = test_prophet['vacation'] & test_prophet['weekend'] 
        test_prophet['vacation_AND_weekday'] = test_prophet['vacation'] & ~test_prophet['weekend'] 
        test_prophet['school_term_AND_weekend'] = ~test_prophet['vacation'] & test_prophet['weekend'] 
        test_prophet['school_term_AND_weekday'] = ~test_prophet['vacation'] & ~test_prophet['weekend'] 

        # test_prophet['cold'] = test_prophet['temp'].apply(is_cold)
        # test_prophet['warm'] = ~test_prophet['temp'].apply(is_cold)

        # test_prophet['humid'] = test_prophet['humidity'].apply(is_humid)
        # test_prophet['notHumid'] = ~test_prophet['humidity'].apply(is_humid)

        #---------------------------------------------------
        #---------------------------------------------------
        #---------------------------------------------------


        # Set the conditions for the conditional seasonalities
        for i in range(len(months)):
            train_prophet[months[i]] = train_prophet['ds'].apply(set_month, m=i+1)
            test_prophet[months[i]] = test_prophet['ds'].apply(set_month, m=i+1)


        for i in range(len(days)):
            train_prophet[days[i]] = train_prophet['ds'].apply(set_day, d=i)
            test_prophet[days[i]] = test_prophet['ds'].apply(set_day, d=i)


        for season in seasons:
            for day_type in day_types:
                train_prophet[f'{season}_AND_{day_type}'] = train_prophet[season] & train_prophet[day_type] 
                test_prophet[f'{season}_AND_{day_type}'] = test_prophet[season] & test_prophet[day_type] 

        for season in seasons:
            for day in days:
                train_prophet[f'{season}_AND_{day}'] = train_prophet[season] & train_prophet[day]
                test_prophet[f'{season}_AND_{day}'] = test_prophet[season] & test_prophet[day]


        for month in months:
            for day in days:
                train_prophet[f'{month}_AND_{day}'] = train_prophet[month] & train_prophet[day]
                test_prophet[f'{month}_AND_{day}'] = test_prophet[month] & test_prophet[day]

        for month in months:
            for day_type in day_types:
                train_prophet[f'{month}_AND_{day_type}'] = train_prophet[month] & train_prophet[day_type] 
                test_prophet[f'{month}_AND_{day_type}'] = test_prophet[month] & test_prophet[day_type] 

        #---------------------------------------------------------------------------------
        #---------------------------------------------------------------------------------
        #---------------------------------------------------------------------------------
        
        # Define the prophwet model 
        print(f"Prophet: Define Model and Train")
        pr_model = Prophet(    changepoint_prior_scale=changepoint_prior_scale,
                            seasonality_prior_scale=seasonality_prior_scale,
                            yearly_seasonality=yearly_seasonality,
                            weekly_seasonality=False,
                            daily_seasonality=False,
                            growth='linear'
                            # seasonality_mode='multiplicative',
                            # growth='logistic'
                                            )
        
        # Add the holidays and custom seasonalities
        pr_model.add_country_holidays(country_name='Canada')

        for season in seasons:
            for day_type in day_types:
                pr_model.add_seasonality(name=f'daily_{season}_{day_type}', period=1, fourier_order=daily_seasonality, \
                                    condition_name=f'{season}_AND_{day_type}', prior_scale=daily_prior_scale)

        for month in months:
            pr_model.add_seasonality(name=f'weekly_{month}', period=7, fourier_order=weekly_seasonality, condition_name=month, prior_scale=weekly_prior_scale)

        # Train the model
        pr_model.fit(train_prophet)

        #---------------------------------------------------
        print(f"Prophet: Predict")
        # Predict with the testing data
        predictions_raw = pr_model.predict(test_prophet)

        # set negative values to zero 
        predictions = predictions_raw['yhat']
        predictions[predictions < 0] = 0

        predictions = predictions * capacities[parkade]
        print(predictions)

    
    elif model == 'Baseline':
        test_data = pd.read_csv(test_data_filename_raw, \
                            parse_dates=[0], index_col=[0], usecols=['Timestamp', parkade])

        # Get the saved baseline model's location
        baseline_model_table_filename = os.path.abspath("./baseline/saved_baseline_model/baseline_model_table_NEW.csv")
        baseline_model_term_dates_full_filename = os.path.abspath("./baseline/saved_baseline_model/baseline_model_term_dates_full_NEW.csv")

        # Import the baseline model 
        bsln_model = baseline_model.random_baseline_model(baseline_model_table_filename, school_terms=True, import_filename=baseline_model_term_dates_full_filename)
        
        # Predict with the testing data
        bsln_prediction = bsln_model.predict_many(test_data_filename_raw, [parkade], out_filename="predict_many_output.csv")

        # Take only the input parkade
        predictions = bsln_prediction[parkade]

        # Delete the file containing the results
        if os.path.exists("predict_many_output.csv"):
            os.remove("predict_many_output.csv")
        
    #-------------------------------------------------------------

    r2_pos = r2_score(test_data[parkade], predictions)
    mae_pos = mean_absolute_error(test_data[parkade], predictions)
    mse_pos = mean_squared_error(test_data[parkade], predictions)

    metrics_df = pd.DataFrame({
            'model' : [model], 
            'parkade' : [parkade], 
            'MAE' : [round(mae_pos,4)], 
            'MAE_percent': [round(100*mae_pos/capacities[parkade],4)],
            'MSE': [ round(mse_pos,4)], 
            'RMSE': [ round(mse_pos**0.5,4)], 
            'RMSE_percent' : [round(100*(mse_pos**0.5)/capacities[parkade],4)],
            'R2': [round(r2_pos,4)]
        }
    )

    metrics_df = metrics_df.set_index(['model','parkade'])
    print(metrics_df.to_string())
    print("----------------------------------------------------------")
    
    metrics_df.to_csv(f'{csv_filePath}{model}_{parkade}.csv')

    if model == 'Prophet':
        metrics_df.to_csv(f'{hp_csv_filePath}{model}_{parkade}_{hp_combo_name}.csv')
        plot_predictions_full(list(test_data.index), list(test_data[parkade]),list(predictions), \
                f'{graph_filePath}/{model}_full/{model}_full_{parkade}_{hp_combo_name}.png', model, parkade)
                
        plot_predictions_2w(list(test_data.index), list(test_data[parkade]),list(predictions), \
                    f'{graph_filePath}/{model}_2w/{model}_2w_{parkade}_{hp_combo_name}.png', model, parkade)

    else:
        plot_predictions_full(list(test_data.index), list(test_data[parkade]),list(predictions), \
                    f'{graph_filePath}/{model}_full/{model}_full_{parkade}.png', model, parkade)
        
        plot_predictions_2w(list(test_data.index), list(test_data[parkade]),list(predictions), \
                    f'{graph_filePath}/{model}_2w/{model}_2w_{parkade}.png', model, parkade)

    

    



    
if __name__ == "__main__":
    main()

    