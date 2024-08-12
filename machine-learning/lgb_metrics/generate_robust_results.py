import pandas as pd
import os

#############################################
"""
This script assumes:
- input files  ['lgb_longterm_metric.csv', 
                'lgb_1week_metric.csv', 
                'lgb_4hour_metric.csv', 
                'lgb_1day_metric.csv'] line under '../lgb_errors_unnormalized/.'
- input files in the format like this:
Metric,Fraser,Health Sciences,North,Rose,Thunderbird,University Lot Blvd,West
MAE,,,,,      
MSE,,,,,  
RMSE,,,,,,     
R-squared,,,,,

- Baseline model lives under smae local directory, names 'baseline_metrics.csv'
- baseline metrics formatted as such:
model,parkade,MAE,MSE,RMSE,R2
Baseline,North,51.8425,6119.9286,78.23,0.8068
Baseline,West,68.5377,12295.8339,110.8866,0.7651
Baseline,Rose,50.8215,7257.599,85.1915,0.733
Baseline,Health Sciences,5.4467,10329.3842,101.6336,0.8673
Baseline,Fraser,41.826,4266.1831,65.316,0.7457
Baseline,Thunderbird,95.0953,37123.0788,192.6735,0.6638
Baseline,University Lot Blvd,19.261,863.8785,29.3918,0.26

If these conditions uphold, the script will output reports for each model (and combined)
at the output directory '/machine-learning/lgb_results_summaries/.'
"""
#############################################

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

# List of LGB metric files
lgb_metric_files = ['lgb_longterm_metric.csv', 'lgb_1week_metric.csv', 'lgb_4hour_metric.csv', 'lgb_1day_metric.csv']
durations = ['longterm', 'week', 'hour', 'day']

# Get the current directory path
current_dir = os.path.dirname(os.path.abspath(__file__))

# Determine the path to the parent directory
parent_dir = os.path.dirname(current_dir)

# Define the target directory under the parent directory
input_directory = os.path.join(parent_dir, 'lgb_errors_unnormalized')
output_directory = os.path.join(parent_dir, 'lgb_results_summaries')

# Create output directory if it doesn't exist
os.makedirs(output_directory, exist_ok=True)

# Define the baseline file path
baseline_file = os.path.join(current_dir, 'baseline_metrics.csv')

# Check if baseline_metrics.csv exists
if not os.path.exists(baseline_file):
    raise FileNotFoundError(f"Cannot find file {baseline_file}")

# Load the baseline metrics
baseline_df = pd.read_csv(baseline_file)

# Function to color cells based on positive or negative values
def color_cell(val):
    try:
        color = 'red' if float(val) < 0 else 'lightgreen'
    except ValueError:
        color = 'white'  # Default color for non-numeric values
    return f'background-color: {color}'

# Store all result DataFrames to concatenate later
all_results = []

# Process each LGB metric file
for file, duration in zip(lgb_metric_files, durations):
    lgb_file_path = os.path.join(input_directory, file)
    
    if not os.path.exists(lgb_file_path):
        raise FileNotFoundError(f"Cannot find file {lgb_file_path}")
    
    lgb_df = pd.read_csv(lgb_file_path)
    
    result_summary = []

    for parkade, capacity in capacity_dict.items():
        baseline_metrics = baseline_df[baseline_df['parkade'] == parkade].iloc[0]
        
        lgb_metrics = lgb_df[['Metric', parkade]].set_index('Metric').transpose()
        
        normalized_mae = lgb_metrics['MAE'].values[0] / capacity
        delta_mae = baseline_metrics['MAE'] - lgb_metrics['MAE'].values[0]
        normalized_delta_mae = delta_mae / capacity
        
        normalized_mse = lgb_metrics['MSE'].values[0] / capacity
        delta_mse = baseline_metrics['MSE'] - lgb_metrics['MSE'].values[0]
        normalized_delta_mse = delta_mse / capacity
        
        normalized_rmse = lgb_metrics['RMSE'].values[0] / capacity
        delta_rmse = baseline_metrics['RMSE'] - lgb_metrics['RMSE'].values[0]
        normalized_delta_rmse = delta_rmse / capacity
        
        delta_r2 = lgb_metrics['R-squared'].values[0] - baseline_metrics['R2']
        
        result_summary.append({
            'PARKADE': parkade,
            'CAPACITY': capacity,
            'MAE': lgb_metrics['MAE'].values[0],
            'ΔMAE': delta_mae,
            'NORMALIZED_MAE (BY CAPACITY)': normalized_mae,
            'NORMALIZED_ΔMAE (BY CAPACITY)': normalized_delta_mae,
            'MSE': lgb_metrics['MSE'].values[0],
            'ΔMSE': delta_mse,
            'NORMALIZED_MSE (BY CAPACITY)': normalized_mse,
            'NORMALIZED_ΔMSE (BY CAPACITY)': normalized_delta_mse,
            'RMSE': lgb_metrics['RMSE'].values[0],
            'ΔRMSE': delta_rmse,
            'NORMALIZED_RMSE (BY CAPACITY)': normalized_rmse,
            'NORMALIZED_ΔRMSE (BY CAPACITY)': normalized_delta_rmse,
            'R2': lgb_metrics['R-squared'].values[0],
            'ΔR2': delta_r2
        })
    
    result_df = pd.DataFrame(result_summary)
    
    # Add title row
    title_row = pd.DataFrame([[f'LightGBM - {duration}'] + [''] * (len(result_df.columns) - 1)], columns=result_df.columns)
    result_df_with_title = pd.concat([title_row, result_df], ignore_index=True)
    
    # Save the individual result to CSV
    result_csv_path = os.path.join(output_directory, f'result_summary_{duration}.csv')
    result_df_with_title.to_csv(result_csv_path, index=False)

    # Apply the coloring
    columns_to_color = [
        'ΔMAE', 'NORMALIZED_ΔMAE (BY CAPACITY)', 'ΔMSE', 'NORMALIZED_ΔMSE (BY CAPACITY)',
        'ΔRMSE', 'NORMALIZED_ΔRMSE (BY CAPACITY)', 'ΔR2'
    ]
    styled_result = result_df_with_title.style.applymap(color_cell, subset=columns_to_color)
    
    # Add border
    styled_result.set_table_styles([
        {'selector': 'th', 'props': [('border', '1px solid black')]},
        {'selector': 'td', 'props': [('border', '1px solid black')]}
    ])
    
    # Save the styled DataFrame as HTML
    result_html_path = os.path.join(output_directory, f'result_summary_{duration}.html')
    styled_result.to_html(result_html_path)

    # Append to the list of all results
    all_results.append(result_df_with_title)

    # Add an empty row between tables
    all_results.append(pd.DataFrame([[''] * len(result_df.columns)], columns=result_df.columns))

# Concatenate all results into a single DataFrame
combined_result_df = pd.concat(all_results, ignore_index=True)

# Save the combined result to a CSV file
combined_csv_path = os.path.join(output_directory, 'combined_result_summary.csv')
combined_result_df.to_csv(combined_csv_path, index=False)

# Apply the coloring to the combined DataFrame
styled_combined_result = combined_result_df.style.applymap(color_cell, subset=columns_to_color)

# Add border for the combined result
styled_combined_result.set_table_styles([
    {'selector': 'th', 'props': [('border', '1px solid black')]},
    {'selector': 'td', 'props': [('border', '1px solid black')]}
])

# Save the styled combined DataFrame as HTML
combined_html_path = os.path.join(output_directory, 'combined_result_summary.html')
styled_combined_result.to_html(combined_html_path)

print("DONE")
