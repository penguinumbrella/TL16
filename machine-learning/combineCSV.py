import pandas as pd
import numpy as np


# parks = ["North","West","Rose","Health Sciences","Fraser","Thunderbird","University Lot Blvd"]
parks = ["North","West","Rose","Health Sciences","Fraser","Thunderbird","University Lot Blvd"]

models = ['Baseline','Prophet']



csv_dir = '../results/csv'

def main():
    fullDF = pd.DataFrame ({
    'model' : [], 
    'parkade' : [], 
    'MAE' : [], 
    'MAE_percent': [],
    'MSE': [], 
    'RMSE': [], 
    'RMSE_percent' : [],
    'R2': []
    })

    for model in models:
        for parkade in parks:
            file_path = f'{csv_dir}/{model}_{parkade}.csv'
            new_df = pd.read_csv(file_path)
            fullDF = pd.concat([fullDF, new_df])

    fullDF.to_csv(f'{csv_dir}/full/fullSummary.csv', index = False)
    print(f'DONE: Result saved in {csv_dir}/full/fullSummary.csv')

if __name__=='__main__':
    main()