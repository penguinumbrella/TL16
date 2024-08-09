import pandas as pd
import matplotlib.pyplot as plt
import os

# Change to the appropriate directory
os.chdir('C:\\cpen491\\TL16\\machine-learning\\lgb_data')

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

# Load the baseline results and normalize by capacity
baseline_df = pd.read_csv('baseline_results.csv')
for parkade in capacity_dict:
    baseline_df[parkade] = baseline_df[parkade] / capacity_dict[parkade]

# Load the actual results
actual_df = pd.read_csv('actual.csv')

# List of LGB files
lgb_files = ['lgb_week.csv', 'lgb_day.csv', 'lgb_hour.csv', 'lgb_longterm.csv']

# Plot Baseline vs. Actual
for parkade in capacity_dict.keys():
        plt.figure(figsize=(10, 6))
        
        # Plot baseline normalized predictions
        plt.plot(baseline_df['Timestamp'], baseline_df[parkade], label='Baseline Predictions', color='blue', linewidth=0.3)
        
        # Plot actual values
        plt.plot(actual_df['Timestamp'], actual_df[parkade], label='Actual Values', color='green', linewidth=0.3)
        
        # Add title and labels
        plt.title(f'Baseline vs. Actual - {parkade}')
        plt.xlabel('Timestamp')
        plt.ylabel('Normalized Occupancy')
        plt.legend()
        
        # Rotate the x-axis labels for better readability
        plt.xticks(rotation=45)
        
        # Save the plot
        plt.savefig(f'plots/Baseline_vs_Actual_{parkade}.png')
        
        # Close the figure to avoid display issues with many plots
        plt.close()

# Plot Baseline vs. Actual and LGB vs. Actual for each file
for lgb_file in lgb_files:
    lgb_df = pd.read_csv(lgb_file)

    # Plot LGB vs. Actual
    for parkade in capacity_dict.keys():
        plt.figure(figsize=(10, 6))
        
        # Plot LGB predictions
        plt.plot(lgb_df['Timestamp'], lgb_df[parkade], label=f'LGB Predictions ({lgb_file})', color='red', linewidth=0.3)
        
        # Plot actual values
        plt.plot(actual_df['Timestamp'], actual_df[parkade], label='Actual Values', color='green', linewidth=0.3)
        
        # Add title and labels
        plt.title(f'LGB vs. Actual - {parkade} - {lgb_file}')
        plt.xlabel('Timestamp')
        plt.ylabel('Normalized Occupancy')
        plt.legend()
        
        # Rotate the x-axis labels for better readability
        plt.xticks(rotation=45)
        
        # Save the plot
        plt.savefig(f'plots/LGB_vs_Actual_{parkade}_{lgb_file.split(".")[0]}.png')
        
        # Close the figure to avoid display issues with many plots
        plt.close()

print("All plots created successfully.")
