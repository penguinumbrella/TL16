import json
import os
import subprocess
import csv
import sys
import pandas as pd

local_dir_path = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(local_dir_path, 'stalls_data.json')
csv_file = os.path.join(local_dir_path, 'stalls_data.csv')
api_call = 'status/parking/zones/78/all_stalls'
API_KEY = sys.argv[1]
CURL_COMMAND = f'curl -X GET "https://app.eleven-x.com/api/v2/{api_call}" -H "accept: application/json" -H "Authorization: Bearer {API_KEY}"'


def main():

    try:
        # Make the request for the data and save the response in a JSON file
        subprocess.run(CURL_COMMAND, shell=True, check=True, stdout=open(output_file, 'w'))

        # Read JSON file
        with open(output_file, 'r') as json_file:
            data = json.load(json_file)
            print(len(data))

            # Prepare a csv file to write the data to 

            csv_columns = ['stall_id', 'stall_name', 'status', 'payload_timestamp']

            with open(csv_file, 'w', newline='') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
                
                # Write headers
                writer.writeheader()
                
                # Read the data one row at a time, take the necessary information 
                for item in data["stallStatusData"]:
                
                    #reformat the data for the csv file
                    row = {
                    'stall_id' : item['stall_id'],
                    'stall_name' : item['stall_name'],
                    'status' : item['status'],
                    'payload_timestamp' : str(pd.Timestamp(item['payload_timestamp']) - pd.Timedelta('7 hour'))
                    } 

                    # Write to the csv file
                    writer.writerow(row)

    except subprocess.CalledProcessError as e:
        print(e)
        

if __name__ == '__main__':
    main()