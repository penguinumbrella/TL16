import os
import pandas as pd
import glob

# Print the current working directory
print("Current directory:", os.getcwd())

# Define parkade names and their respective columns
parkade_columns = ["North", "West", "Rose", "Health Sciences", "Fraser", "Thunderbird", "University Lot Blvd"]
parkade_files = {name: [] for name in parkade_columns}

# Read the files and categorize them by parkade name
print("Reading files and categorizing by parkade name...")
for file in glob.glob("machine-learning/lgb_*_actual_vs_predicted.csv"):
    parts = file.split('_')
    parkade_name = parts[1]
    duration = parts[3]
    if parkade_name in parkade_columns:
        parkade_files[parkade_name].append((file, duration))
        print(f"Categorized file: {file} under parkade: {parkade_name} for duration: {duration}")

# Create a dictionary to hold the dataframes for each duration
data_by_duration = {}

# Process each parkade's files
print("Processing each parkade's files...")
for parkade, files in parkade_files.items():
    for file, duration in files:
        df = pd.read_csv(file)
        df['Timestamp'] = pd.to_datetime(df['date'])
        if duration not in data_by_duration:
            data_by_duration[duration] = df[['Timestamp']].copy()
        data_by_duration[duration][parkade] = df['Predicted']
        print(f"Processed file: {file} for parkade: {parkade} and duration: {duration}")

# Write out the dataframes to CSV files
print("Writing out the dataframes to CSV files...")
for duration, df in data_by_duration.items():
    output_file = f"machine-learning/{duration}_actuals_by_parkade.csv"
    df.to_csv(output_file, index=False)
    print(f"Created CSV file: {output_file}")

print("CSV files created successfully.")
