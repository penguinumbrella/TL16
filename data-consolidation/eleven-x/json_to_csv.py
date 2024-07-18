import json
import csv
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

def subzones_from_zones_to_csv(json_file, csv_file):
    """
    Read a JSON file with a nested structure to extract subzones data,
    where each subzone has a zone_id and display_name, and then write
    this data to a CSV file with subzones as columns and rows are zone_id and display_name.

    :param json_file: The path to the source JSON file.
    :param csv_file: The path to the output CSV file.
    """
    # Read the JSON file
    with open(json_file, 'r') as file:
        data = json.load(file)
    
    # Navigate to the nested sub_zones list
    sub_zones = data.get("infoParkingZone", {}).get("sub_zones", [])
    
    # Check if sub_zones is not empty and has the expected structure
    if not sub_zones or not all('zone_id' in subzone and 'display_name' in subzone for subzone in sub_zones):
        raise ValueError("JSON data must have 'sub_zones' with 'zone_id' and 'display_name'.")

    # Write the CSV file
    with open(csv_file, 'w', newline='') as file:
        writer = csv.writer(file)

        # Write the header (column names)
        headers = ['zone_id', 'display_name']
        writer.writerow(headers)

        # Write the subzones data
        for subzone in sub_zones:
            row = [subzone['zone_id'], subzone['display_name']]
            writer.writerow(row)

def zone_info_to_csv(json_file, csv_file):
    """
    Read a JSON file with a nested structure to extract subzones data,
    where each subzone has a zone_id and display_name, and then write
    this data to a CSV file with subzones as columns and rows are zone_id and display_name.

    :param json_file: The path to the source JSON file.
    :param csv_file: The path to the output CSV file.
    """
    # Read the JSON file
    with open(json_file, 'r') as file:
        data = json.load(file)
    
    # Navigate to the nested sub_zones list
    zone_data = data.get("infoParkingZone", {})
    
    # Write the CSV file
    with open(csv_file, 'w', newline='') as file:
        writer = csv.writer(file)

        # Write the header (column names)
        headers = ['zone_id', 'display_name', 'latitude', 'longitude']
        writer.writerow(headers)

        # Write the subzones data
        # for zone_info in zone_data:
        row = [zone_data['zone_id'], 
               zone_data['display_name'], 
               zone_data['location']['latitude'], 
               zone_data['location']['longitude']]
        writer.writerow(row)

# Example usage
json_file_path = os.path.join(script_dir, 'output.json')
csv_file_path_subzones = os.path.join(script_dir, 'subzone.csv')
csv_file_path_zone_info = os.path.join(script_dir, 'zone_info.csv')
subzones_from_zones_to_csv(json_file_path, csv_file_path_subzones)
zone_info_to_csv(json_file_path,  csv_file_path_zone_info)
