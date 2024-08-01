import subprocess
import pandas as pd
import json
import ast
import sys
import os 



local_dir_path = os.path.dirname(os.path.abspath(__file__))
stalls_status_file = os.path.join(local_dir_path, 'stalls_status.json')
coordinates_file_path = './frontend/src/components/mapView/map/coordinates.json'

def main():
    api_call = "status/parking/zones/78/all_stalls"
    API_KEY = sys.argv[1]
    CURL_COMMAND = f'curl -X GET "https://app.eleven-x.com/api/v2/{api_call}" -H "accept: application/json" -H "Authorization: Bearer {API_KEY}"'

    subprocess.run(CURL_COMMAND, shell=True, check=True,stdout=open(stalls_status_file, 'w'))

    stall_ids = []
    with open(stalls_status_file, 'r') as json_file:
                data = json.load(json_file)
                for id in range(len(data['stallStatusData'])):
                    stall_ids.append(data['stallStatusData'][id]['stall_id'])
                    

    marker_info = []
    # loop through every id from the first command
    for id in stall_ids:
        api_call = f"info/parking/stalls/{id}"
        CURL_COMMAND = f'curl -X GET "https://app.eleven-x.com/api/v2/{api_call}" -H "accept: application/json" -H "Authorization: Bearer {API_KEY}"'

        # Save the output to 'result'
        result = subprocess.run(CURL_COMMAND, shell=True, check=True, stdout=subprocess.PIPE)
        
        # The output is in bytes so we decode it to a json string
        json_str = result.stdout.decode('utf-8')
        # Convert the JSON string to a dictionary
        data = json.loads(json_str)

        new_json_str = "{" + f' "name" : "{data['infoParkingStall']['display_name']}" , \
            "location" : ' + '{' + f' "lat" : {data["infoParkingStall"]["location"]["latitude"]}, "lng" : \
                {data["infoParkingStall"]["location"]["latitude"]}' + '} }'
        

        marker_info.append(ast.literal_eval(new_json_str))


    new_json_data = {}
    with open(coordinates_file_path, 'r') as file:
        new_json_data = json.load(file)
        new_json_data['accessibility'] = marker_info
        
    with open(coordinates_file_path, 'w') as file:
        json.dump(new_json_data, file, indent=4)


if __name__ == '__main__':
     main()
