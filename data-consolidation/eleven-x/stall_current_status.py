import re
import api_lib as api
import json
import os
import write_to_csv as w_csv
import csv
import pandas as pd
from datetime import datetime
import api_lib as api

# Constants
STALLS_FOLDER = 'stalls'
INPUT_CSV = 'x11_management.csv'
API_CALL_TEMPLATE = 'payloads/parking/stalls/{stall_id}/latest'
DATE_FORMAT = '%Y-%m-%d'
local_dir_path = os.path.dirname(os.path.abspath(__file__))

# Function to check if the file exists and is not empty
def file_exists_and_not_empty(filename):
    return os.path.isfile(filename) and os.path.getsize(filename) > 0

# Read the input CSV file
try:
    data = pd.read_csv(os.path.join(local_dir_path, INPUT_CSV))
except FileNotFoundError:
    print(f"Error: The file {INPUT_CSV} does not exist.")
    exit(1)

# Ensure the necessary columns exist
if 'stall_id' not in data.columns or 'linked_date' not in data.columns:
    raise ValueError('The CSV file does not contain the required columns "stall_id" and "linked_date".')

# Get today's date
today_date = datetime.now().strftime(DATE_FORMAT)

# List of dicts for new rows
new_rows = []

# Process each stall
for index, row in data.iterrows():
    stall_id = row['stall_id']

    print(f"Getting latest payload info for stall {stall_id}")

    # Construct the API URL
    api_url = API_CALL_TEMPLATE.format(stall_id=stall_id)
    
    # Make the API call
    api.run_api_call(api_url)

    # Read the JSON file
    with open(os.path.join(local_dir_path, 'temp.json'), 'r') as file:
        json_data = json.load(file)
    
    # Create list of dicts - new_rows
    stall_json = json_data.get('data', [])
    
    if isinstance(stall_json, list) and stall_json:
        data = stall_json[0]

        if data:
            # Create row of data for the stall with columns:
            #@ - stall_id
            # - device_eui
            # - payload_timestamp
            # - status
            # - battery_percentage
            # - battery_voltage
            # - temperature,new_car
            new_row = {}
            new_row['stall_id'] = stall_id
            keys = list(data.keys())
            keys.pop()
            for key in keys:
                new_row[key] = data[key]
            keys = data['decoded_data'].keys()
            for key in keys:
                new_row[key] = data['decoded_data'][key]
            # print(row)

            new_rows.append(new_row)

# Prepare the output CSV file
output_csv = os.path.join(local_dir_path, f'latest_stall.csv')
# Read the existing CSV file into a list of dictionaries
old_rows = []
if os.path.exists(output_csv):
    with open(output_csv, 'r', newline='') as csvfile:
        csvreader = csv.DictReader(csvfile)
        old_rows = list(csvreader)
# Create a dictionary for fast lookup of device_eui
rows_dict = {row['device_eui']: row for row in old_rows}
    

# Update or insert each dictionary from data_list
for new_row in new_rows:
    device_eui = new_row['device_eui']
    if device_eui in rows_dict:
        # Update the existing row
        rows_dict[device_eui].update(new_row)
    else:
        # Add the new data as a new row
        old_rows.append(new_row)
        rows_dict[device_eui] = new_row

# Get the fieldnames from the first row (or from the first element in data_list if the file was empty or didn't exist)
fieldnames = old_rows[0].keys() if old_rows else new_rows[0].keys()

# Write the updated data back to the CSV file
with open(output_csv, 'w', newline='') as csvfile:
    csvwriter = csv.DictWriter(csvfile, fieldnames=fieldnames)
    csvwriter.writeheader()
    csvwriter.writerows(old_rows)
    
print(f"Data has been updated in {output_csv}")

print("Processing completed.")