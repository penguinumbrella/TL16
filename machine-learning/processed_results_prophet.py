import os
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Print the current working directory
print("Current directory:", os.getcwd())

# Define parkade names and their respective columns
parkade_columns = ["North", "West", "Rose", "Health Sciences", "Fraser", "Thunderbird", "University Lot Blvd"]

color_pal = sns.color_palette()
plt.style.use('ggplot')
plt.style.use('fivethirtyeight')

# Initialize an empty dataframe to hold combined data
combined_df = pd.DataFrame()

def load_and_prepare_data(actual_vs_pred_path, baseline_csv_path, parking_lot_name, start_date, end_date):
    """
    Load and prepare the data for plotting.

    Parameters:
    actual_vs_pred_path (str): Path to the CSV file with 'Actual' and 'Predicted' columns.
    baseline_csv_path (str): Path to the CSV file with 'Timestamp' and parking lot columns.
    parking_lot_name (str): The name of the parking lot to plot.
    start_date (str): The start date for filtering the data.
    end_date (str): The end date for filtering the data.

    Returns:
    pd.DataFrame, pd.DataFrame: Filtered actual vs predicted DataFrame and baseline DataFrame.
    """
    # Load actual vs predicted data
    actual_vs_pred_df = pd.read_csv(actual_vs_pred_path)
    
    # Creating a date range based on the length of the actual_vs_pred_df
    actual_vs_pred_df['date'] = pd.date_range(start=start_date, periods=len(actual_vs_pred_df), freq='H')
    actual_vs_pred_df.set_index('date', inplace=True)
    
    # Load baseline data
    baseline_df = pd.read_csv(baseline_csv_path)
    baseline_df['Timestamp'] = pd.to_datetime(baseline_df['Timestamp'])
    baseline_df.set_index('Timestamp', inplace=True)
    
    # Filter data for the specified date range
    filtered_actual_vs_pred = actual_vs_pred_df[(actual_vs_pred_df.index >= "2024-02-01") & (actual_vs_pred_df.index <= "2024-02-15")]
    filtered_baseline = baseline_df[(baseline_df.index >= "2024-02-01") & (baseline_df.index <= "2024-02-15")]
    
    # Ensure the parking lot column exists in the baseline data
    if parking_lot_name not in filtered_baseline.columns:
        raise KeyError(f"'{parking_lot_name}' is not found in the baseline data columns.")
    
    return filtered_actual_vs_pred, filtered_baseline

def plot_comparison(filtered_actual_vs_pred, filtered_baseline, parking_lot_name, output_dir):
    """
    Plot baseline, actual, and Prophet predictions.

    Parameters:
    filtered_actual_vs_pred (pd.DataFrame): Filtered DataFrame with 'Actual' and 'Predicted' columns.
    filtered_baseline (pd.DataFrame): Filtered DataFrame with baseline columns.
    parking_lot_name (str): The name of the parking lot to plot.
    output_dir (str): Directory to save the plot.
    """
    # Create figure
    plt.figure(figsize=(15, 10))

    # Plot actual, predicted, and baseline results
    plt.plot(filtered_actual_vs_pred.index, filtered_actual_vs_pred['Actual'], label='Actual', linewidth=1)
    #plt.plot(filtered_actual_vs_pred.index, filtered_actual_vs_pred['Predicted'], label='Prophet', linestyle='-.')
    plt.plot(filtered_baseline.index, filtered_baseline[parking_lot_name], label='Baseline', linestyle='--')

    # Plot labels and title
    plt.xlabel('Date')
    plt.ylabel('Occupancy')
    plt.title(f'Comparison of Baseline, Actual, and Prophet Predictions for {parking_lot_name} (Feb 2024)\n 2 Week Window')

    # Show legend
    plt.legend()

    # Ensure output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Save the plot
    plt.savefig(f'{output_dir}/{parking_lot_name}_comparison_february_2024.png')
    plt.show()

# Define paths and parameters
baseline_csv_path = 'machine-learning/baseline_results.csv'
output_dir = 'prophet_graphs_2weeks'
start_date = '2023-03-05 08:00:00'
end_date = '2024-03-05 23:00:00'

for parking_lot_name in parkade_columns:
    # Load and prepare data
    actual_vs_pred_path = f'machine-learning/prophet_results/prophet_{parking_lot_name}.csv'
    filtered_actual_vs_pred, filtered_baseline = load_and_prepare_data(
        actual_vs_pred_path, baseline_csv_path, parking_lot_name, start_date, end_date
    )

    # Plot the data
    plot_comparison(filtered_actual_vs_pred, filtered_baseline, parking_lot_name, output_dir)
