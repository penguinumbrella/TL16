import pandas as pd
import os

# Change to the appropriate directory
os.chdir('C:\\cpen491\\TL16\\machine-learning\\lgb_metrics')

# Define the capacity dictionary
capacity_dict = {
    'North': 990,
    'West': 1232,
    'Rose': 807,
    'Health Sciences': 1189,
    'Fraser': 725,
    'Thunderbird': 1634,
    'University Lot Blvd': 216
}

# Load and normalize baseline metrics
baseline_metrics = pd.read_csv('baseline_metrics.csv')

for parkade, capacity in capacity_dict.items():
    baseline_metrics.loc[baseline_metrics['parkade'] == parkade, 'MAE'] /= capacity
    baseline_metrics.loc[baseline_metrics['parkade'] == parkade, 'MSE'] /= (capacity ** 2)
    baseline_metrics.loc[baseline_metrics['parkade'] == parkade, 'RMSE'] /= capacity

# List of LGB metric files
lgb_metric_files = ['lgb_longterm_metric.csv', 'lgb_week_metric.csv', 'lgb_hour_metric.csv', 'lgb_day_metric.csv']

# Function to normalize and compare metrics
def normalize_and_compare(lgb_file):
    lgb_metrics = pd.read_csv(lgb_file, index_col=0).transpose()
    lgb_metrics.reset_index(inplace=True)
    lgb_metrics.rename(columns={'index': 'parkade'}, inplace=True)
    
    comparison_metrics = baseline_metrics.copy()
    
    for parkade, capacity in capacity_dict.items():
        for metric in ['MAE', 'MSE', 'RMSE', 'R2']:
            try:
                baseline_value = baseline_metrics.loc[baseline_metrics['parkade'] == parkade, metric].values[0]
                lgb_value = lgb_metrics.loc[lgb_metrics['parkade'] == parkade, metric].values[0]
                comparison_value = baseline_value - lgb_value
                comparison_metrics.loc[comparison_metrics['parkade'] == parkade, metric] = comparison_value
                
                # Debug print statements
                print(f"{lgb_file} - {parkade} - {metric}: Baseline value = {baseline_value}, LGB value = {lgb_value}, Difference = {comparison_value}")

            except KeyError as e:
                print(f"KeyError: {e} for parkade: {parkade} and metric: {metric}")

    output_file = f'comparison_norm_{lgb_file}'
    comparison_metrics.to_csv(output_file, index=False)
    print(f'Comparison saved to {output_file}')

# Normalize and compare each LGB metric file
for lgb_file in lgb_metric_files:
    normalize_and_compare(lgb_file)

print("All comparisons created successfully.")
