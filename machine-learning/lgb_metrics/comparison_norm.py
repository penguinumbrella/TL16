import pandas as pd
import os

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
lgb_metric_files = ['lgb_longterm_metric.csv', 'lgb_week_metric.csv', 'lgb_hour_metric.csv', 'lgb_day_metric.csv']
durations = ['longterm', 'week', 'hour', 'day']

# Get the current directory path
current_dir = os.path.dirname(os.path.abspath(__file__))

# Define the baseline file path
baseline_file = os.path.join(current_dir, 'baseline_metrics.csv')

# Check if baseline_metrics.csv exists
if not os.path.exists(baseline_file):
    raise FileNotFoundError(f"Cannot find file {baseline_file}")

# Load the baseline metrics
baseline_df = pd.read_csv(baseline_file)

# Function to color values based on positive or negative values
def color_value(val):
    try:
        color = 'red' if float(val) < 0 else 'green'
    except ValueError:
        color = 'black'  # Default color for non-numeric values
    return f'color: {color}'

# Store all result DataFrames to concatenate later
all_results = []

# Process each LGB metric file
for file, duration in zip(lgb_metric_files, durations):
    lgb_file_path = os.path.join(current_dir, file)
    
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
        
        delta_r2 = lgb_metrics['R2'].values[0] - baseline_metrics['R2']
        
        result_summary.append({
            'parkade': parkade,
            'capacity': capacity,
            'MAE': lgb_metrics['MAE'].values[0],
            'ΔMAE': delta_mae,
            'normalized_MAE (by capacity)': normalized_mae,
            'normalized_ΔMAE (by capacity)': normalized_delta_mae,
            'MSE': lgb_metrics['MSE'].values[0],
            'ΔMSE': delta_mse,
            'normalized_MSE (by capacity)': normalized_mse,
            'normalized_ΔMSE (by capacity)': normalized_delta_mse,
            'RMSE': lgb_metrics['RMSE'].values[0],
            'ΔRMSE': delta_rmse,
            'normalized_RMSE (by capacity)': normalized_rmse,
            'normalized_ΔRMSE (by capacity)': normalized_delta_rmse,
            'R2': lgb_metrics['R2'].values[0],
            'ΔR2': delta_r2
        })
    
    result_df = pd.DataFrame(result_summary)
    
    # Add title row
    title_row = pd.DataFrame([[f'LightGBM - {duration}'] + [''] * (len(result_df.columns) - 1)], columns=result_df.columns)
    result_df_with_title = pd.concat([title_row, result_df], ignore_index=True)
    
    # Save the individual result to CSV
    result_csv_path = os.path.join(current_dir, f'result_summary_{duration}.csv')
    result_df_with_title.to_csv(result_csv_path, index=False)

    # Apply the coloring
    columns_to_color = [
        'ΔMAE', 'normalized_ΔMAE (by capacity)', 'ΔMSE', 'normalized_ΔMSE (by capacity)',
        'ΔRMSE', 'normalized_ΔRMSE (by capacity)', 'ΔR2'
    ]
    styled_result = result_df_with_title.style.applymap(color_value, subset=columns_to_color)
    
    # Save the styled DataFrame as HTML
    result_html_path = os.path.join(current_dir, f'result_summary_{duration}.html')
    styled_result.to_html(result_html_path)

    # Append to the list of all results
    all_results.append(result_df_with_title)

    # Add an empty row between tables
    all_results.append(pd.DataFrame([[''] * len(result_df.columns)], columns=result_df.columns))

# Concatenate all results into a single DataFrame
combined_result_df = pd.concat(all_results, ignore_index=True)

# Save the combined result to a CSV file
combined_csv_path = os.path.join(current_dir, 'combined_result_summary.csv')
combined_result_df.to_csv(combined_csv_path, index=False)

# Apply the coloring to the combined DataFrame
styled_combined_result = combined_result_df.style.applymap(color_value, subset=columns_to_color)

# Save the styled combined DataFrame as HTML
combined_html_path = os.path.join(current_dir, 'combined_result_summary.html')
styled_combined_result.to_html(combined_html_path)
