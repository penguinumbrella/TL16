import re
import api_lib as api
import json
import os
import write_to_csv as w_csv
import datetime

UBC_ZONE_ID = 78

local_dir_path = os.path.dirname(os.path.abspath(__file__))

api_calls_map = {
            'info/parking/zones/' :
            'Returns a list of brief information on accessible parent/top-level zones',

            'info/parking/zones/{zoneId}' : 
            'Returns a list of properties for a parking zone',

            'info/parking/devices/{deviceEui}' :
            'Returns a list of information for a parking device',

            'info/parking/stalls/{stallId}' :
            'Returns a list of information for a parking stall',
            
            'payloads/parking/stalls/{stallId}' :
            'Returns a list of payloads for a stall (short description)',
                
            'payloads/parking/stalls/{stallId}/latest' :
            'Returns the latest payload for a stall (short description)',
                
            'payloads/parking/zones/{zoneId}' :
            'Returns a list of latest payloads for each stall of a zone (short description)',
                
            'stats/parking/zones/{zoneId}' :
            'Returns a list of statistical data for a zone',

            'stats/parking/stalls/{stallId}' :
            'Returns a list of statistical data for a stall',

            'status/parking/zones/{zoneId}' :
            'Returns a summary of current device occupancy status for a zone',

            'status/parking/zones/{zoneId}/all_stalls' :
            'Returns all stall statuses for a zone',

            'alerts/active_zone_alerts' :
            'Returns a list of active zone-designated parking alert data for a zone',

            'alerts/active_stall_alerts' :
            'Returns a list of active stall-designated parking alert data for a zone',

            'alerts/alert_history' :
            'Returns a list of parking alert history',

            'alerts/update_alert' :
            'Update a parking alert while status is not off',

            'info/apps' :
            'Returns a list of information for owned apps',

            'payloads/devices/{deviceEui}' :
            'Returns a list of payloads for a device (short description)',
                
            'payloads/devices/{deviceEui}/latest' :
            'Returns the latest payload for a device (short description)'
        }   

# Run 'info/parking/zones/{zoneId}' and return API_call into temp.json
# input: zone_id number
# output: temp.json has return value
def get_zone_info(zone_id):
    api_call = "info/parking/zones/" + str(zone_id)
    api.run_api_call(api_call)



# Given a stall id - get all stall ids
def get_stalls_for_zone(zone_id):
    return 0

# Given stall_id, get stall info
def get_stall_info(stall_id):
    # API_CALL with stall info
    # Extract stall info
    # stall_id, 
    #                          stall_info['display_name'], 
    #                          stall_info['description'],
    #                          subzone_id, 
    #                          subzones[subzone_id]['display_name'],
    #                          stall_info['location']['latitude'], 
    #                          stall_info['location']['longitude'],
    #                          stall_info['linked_devide']['device_eui'],
    #                          stall_info['linked_devide']['linked_date']
    api_call = "info/parking/stalls/" + str(stall_id)
    api.run_api_call(api_call)
    # Read the JSON file
    with open(os.path.join(local_dir_path, 'temp.json'), 'r') as file:
        data = json.load(file)

    stall_data = data.get("infoParkingStall", {},)

    return stall_data    

def get_stalls_from_temp(subzone_id):
    api_call = "info/parking/zones/" + str(subzone_id)
    api.run_api_call(api_call)
    # Read the JSON file
    with open(os.path.join(local_dir_path, 'temp.json'), 'r') as file:
        data = json.load(file)
    
    # Navigate to the nested stalls list
    stalls = data.get("infoParkingZone", {}).get("stalls", [])
    return stalls

def get_all_stall_ids_and_subzones():
    subzones = get_subzones(UBC_ZONE_ID)
    
    # Create subzone_stall dict
    # subzone_stall[subzone_id] = [list of stall ids in subzone]
    subzone_stalls = {}

    subzone_ids = []
    for subzone in subzones:
        subzone_ids.append(subzone['zone_id'])

    for subzone_id in subzone_ids:
        subzone_stalls[subzone_id] = get_stalls_from_temp(subzone_id)
    
    return subzones, subzone_stalls

def print_subzone_stalls(subzone_stalls_list, subzone_id):
    print("For subzone: " + str(subzone_id) + "\n")
    for stall in subzone_stalls_list:
        print("Stall display name: " + str(stall['display_name']) + "\nStall id: " + str(stall['stall_id']) + "\n\n")

# Given a zone - get list of subzone
def get_subzones(zone_id):
    get_zone_info(zone_id)
    # Read the JSON file
    with open(os.path.join(local_dir_path, 'temp.json'), 'r') as file:
        data = json.load(file)
    
    # Navigate to the nested sub_zones list
    sub_zones = data.get("infoParkingZone", {}).get("sub_zones", [])

    # Write the subzones data
    for subzone in sub_zones:
        row = [subzone['zone_id'], subzone['display_name']]
        # print("zone_id: " + str(subzone['zone_id']) + "\ndispaly name: " + str(subzone['display_name']) + "\n")
    
    # Check if sub_zones is not empty and has the expected structure
    if not sub_zones or not all('zone_id' in subzone and 'display_name' in subzone for subzone in sub_zones):
        raise ValueError("JSON data must have 'sub_zones' with 'zone_id' and 'display_name'.")

    return sub_zones

# Compares the input list of stall ids with the list of stall ID's 
# obtained from the API - and return the list of new stalls if any
#
# input: list of stall ids
# output: stall from the 11x API not included in the list
def compare_and_get_new_stalls(list_of_stalls, subzones, subzone_stalls):
    # subzones: list of zones dictionaries
    # For zone dictionary: keys - 'zone_id', 'display_name'

    # subzone_stalls dict
    # subzone_stall[subzone_id] = [list of stall ids in subzone]

    subzone_id_list = [d['zone_id'] for d in subzones]

    subzone_stall_id_list = {}

    for subzone_id in subzone_id_list:
        subzone_stall_id_list[subzone_id] = [d['stall_id'] for d in subzone_stalls[subzone_id]]

    stalls_to_update = {}
    
    for subzone_id in subzone_id_list:
        stalls_to_update[subzone_id] = [x for x in subzone_stall_id_list[subzone_id] if x not in list_of_stalls]
    
    return stalls_to_update

# input: list of existing stalls in table
# output: list of dictionaries for each stall to update with data
def update_new_stalls(list_of_stalls):
    # subzones: list of zones dictionaries
    # For zone dictionary: keys - 'zone_id', 'display_name'

    # subzone_stalls dict
    # subzone_stall[subzone_id] = [list of stall ids/display_name in subzone]
    subzones, subzone_stalls = get_all_stall_ids_and_subzones()

    subzones_stalls_to_update = compare_and_get_new_stalls(list_of_stalls, 
                                                 subzones, 
                                                 subzone_stalls)

    stall_info_list = []

    for subzone_id in subzones_stalls_to_update.keys():
        stalls_to_update = subzones_stalls_to_update[subzone_id]
        for stall_id in stalls_to_update:
            stall_data = get_stall_info(stall_id)

            # Update location fields to be part of top level dictionary
            if 'location' in stall_data:
                temp_location = stall_data['location'].copy()
                stall_data.pop('location')
                stall_data.update(temp_location)

            # Update device fields to be part of top level dictionary
            if 'linked_device' in stall_data:
                temp_device = stall_data['linked_device'].copy()
                stall_data.pop('linked_device')
                stall_data.update(temp_device)

            if 'zone_id' and 'display_name' in stall_data:
                stall_data['zone_id'] = subzone_id
                stall_data['zone_display_name'] = [d['display_name'] for d in subzones if d.get('zone_id') == subzone_id]
            stall_info_list.append(stall_data)

    return stall_info_list

def get_all_stall_status(stall_id_list):
    # TODO write this method
    # given a list of stalls - return a list of statuses, 
    # last payload timestamp, battery percentage, any any other important data
    return 0

def get_latest_stall_data(stall_id):
    stallId = stall_id
    api_call = f'payloads/parking/stalls/{stallId}/latest'
    api.run_api_call(api_call)
    # Read the JSON file
    with open(os.path.join(local_dir_path, 'temp.json'), 'r') as file:
        data = json.load(file)
    latest_stall_data = data.get('data', {})

    return latest_stall_data[0]['payload_timestamp'] 


if __name__ == "__main__":
    print("This is a test program to update the 11x management table in" + 
            "a csv file assuming the table is initially empty. aka" + 
            "Creating the table from scratch.\n\n" +
            "The same method (update_new_stalls) should work given a list " +
            "of existing stall ids - it will only update and add the stalls " +
             "that exist and are not in the table already\n\n")
    # Record and print Start time of script
    start_time = datetime.datetime.now()
    print(f"Script started at: {start_time}")

    # subzones = get_subzones(UBC_ZONE_ID)
    # subzones, subzone_stalls = get_all_stall_ids_and_subzones()
    # print_subzone_stalls(subzone_stalls[79], 79)
    # print(compare_and_get_new_stalls([], subzones, subzone_stalls))
    list_of_stall_data = update_new_stalls([])
    if(os.path.exists(os.path.join(local_dir_path, 'temp.json'))):
        print("Removed temp.json file from local folder")
        os.remove(os.path.join(local_dir_path, 'temp.json'))
    w_csv.write_dicts_to_csv(list_of_stall_data, os.path.join(local_dir_path, 'x11_management.csv'), x11=True)
    
    # Record and print End time of script
    end_time = datetime.datetime.now()
    print(f"Script ended at: {end_time}")

    # Calculate and print the duration
    duration = end_time - start_time
    print(f"Script duration: {duration}")