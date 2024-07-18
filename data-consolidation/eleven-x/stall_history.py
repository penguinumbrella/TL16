import re
import api_lib as api
import json
import os
import write_to_csv as w_csv
import csv
import pandas as pd
from datetime import datetime
import api_lib as api

# RUNNING THIS SCRIPT WILL UPDATE THE HISTORICAL DATA FOR ALL STALLS
# EVERY STALLS DATA WILL GO INTO THE .CSV FILE UNDER: ./stalls/<stall_id>_history.csv
# THE SCRIPT DEPENDS ON:
# 1. The existence of x11_management.csv in the same directory as this script
# 2. the existence of the folder "stalls" and the .csv file "<stall_id>_history.csv" 

# Constants
STALLS_FOLDER = 'stalls'
INPUT_CSV = 'x11_management.csv'
API_CALL_TEMPLATE = 'stats/parking/stalls/{stall_id}?from_date={from_date}&to_date={to_date}&period_type=d'
DATE_FORMAT = '%Y-%m-%d'
local_dir_path = os.path.dirname(os.path.abspath(__file__))

# Ensure the stalls folder exists
if not os.path.exists(STALLS_FOLDER):
    os.makedirs(STALLS_FOLDER)

# Read the input CSV file
try:
    data = pd.read_csv(INPUT_CSV)
except FileNotFoundError:
    print(f"Error: The file {INPUT_CSV} does not exist.")
    exit(1)

# Ensure the necessary columns exist
if 'stall_id' not in data.columns or 'linked_date' not in data.columns:
    raise ValueError('The CSV file does not contain the required columns "stall_id" and "linked_date".')

# Get today's date
today_date = datetime.now().strftime(DATE_FORMAT)

# Process each stall
for index, row in data.iterrows():
    stall_id = row['stall_id']
    linked_date = row['linked_date']

    if(pd.isna(linked_date) or linked_date.strip() == ''):
        print(f"Warning: linked_date for stall_id {stall_id} is empty. Skipping.")
        continue

    # Convert to datetime object
    linked_date_dt = datetime.strptime(linked_date, '%Y-%m-%d %H:%M:%S')

    # Format to desired date format (YYYY-MM-DD)
    formatted_linked_date = linked_date_dt.strftime('%Y-%m-%d')

    print(f"Getting history for stall {stall_id} from {formatted_linked_date} to {today_date}")

    # Construct the API URL
    api_url = API_CALL_TEMPLATE.format(stall_id=stall_id, from_date=formatted_linked_date, to_date=today_date)
    
    # Make the API call
    api.run_api_call(api_url)

    # Read the JSON file
    with open(os.path.join(local_dir_path, 'temp.json'), 'r') as file:
        json_data = json.load(file)
    
    # Prepare the output CSV file
    output_csv = os.path.join(STALLS_FOLDER, f'{stall_id}_history.csv')
    
    with open(output_csv, 'w') as f:
        # Write summary keys and values
        summary = json_data.get('summary', {})
        if summary:
            f.write(','.join(summary.keys()) + '\n')
            f.write(','.join(map(str, summary.values())) + '\n')
        
        # Skip line 3
        f.write('\n')
        
        # Write sliced data keys and values
        sliced_data = json_data.get('slicedData', [])
        if sliced_data:
            keys = sliced_data[0].keys()
            f.write(','.join(keys) + '\n')
            
            for item in sliced_data:
                f.write(','.join(map(str, item.values())) + '\n')

print("Processing completed.")
