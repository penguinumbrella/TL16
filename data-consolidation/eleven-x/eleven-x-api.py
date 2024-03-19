import os
import subprocess
import json 
import csv

import json
import csv

script_dir = os.path.dirname(os.path.abspath(__file__))

def json_file_to_csv(json_file_path, csv_file_path):
    # Open the JSON file and load the data
    with open(json_file_path, 'r') as json_file:
        data = json.load(json_file)

    # Open the CSV file for writing
    with open(csv_file_path, mode='w', newline='') as csv_file:
        # Check if the data is a list of dictionaries
        if isinstance(data, list) and all(isinstance(item, dict) for item in data):
            # Get the headers from the keys of the first dictionary
            headers = data[0].keys()
            
            # Create a CSV writer object
            csv_writer = csv.DictWriter(csv_file, fieldnames=headers)
            
            # Write the header to the CSV file
            csv_writer.writeheader()
            
            # Write the rows to the CSV file
            for row in data:
                csv_writer.writerow(row)
        else:
            raise ValueError("JSON file must contain an array of objects")

import re

def handle_parameters(input_string):
    """
    Finds all instances of '{word}' in the input string, prompts the user for values,
    and returns a dictionary of the patterns and corresponding user inputs.

    :param input_string: The string to process.
    :return: A dictionary with the patterns as keys and user inputs as values.
    """
    # Find all instances of '{word}' in the string
    pattern = re.compile(r'\{(\w+)\}')
    matches = pattern.findall(input_string)

    if not matches:
        return input_string
    
    # Dictionary to store the parameters and the user inputs
    parameters_dict = {}

    # Ask the user for input for each found pattern
    for match in matches:
        user_input = input(f"Enter a value for '{match}': ")
        parameters_dict[match] = user_input

    # Replace each placeholder in the input_string with its corresponding value from the dictionary
    modified_string = pattern.sub(lambda m: parameters_dict[m.group(1)], input_string)

    return modified_string


# Function to get API key from user input and save it to a file
def get_and_save_api_key_manually():
    manual_api_key = input("Please enter your API key: ").strip()
    return manual_api_key

# Function to read API key from file
def read_api_key_from_file():
    try:
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api_key.txt'), 'r') as f:
            return f.readline().strip()
    except FileNotFoundError:
        print("API key file not found.")
        return None

# Function to execute curl command with API key and save output to file
def run_api_call(api_key, api_call):
    if api_key is None:
        print("No API key found. Please provide an API key.")
        return

    api_call_with_params = handle_parameters(api_call)
    curl_command = f'curl -X GET "https://app.eleven-x.com/api/v2/' + api_call_with_params + '" -H "accept: application/json" -H "Authorization: Bearer ' + api_key + '"'
    print("In the command line: " + curl_command + "\n")
    # Get the directory of the current script


    # Construct the full file path
    output_file = os.path.join(script_dir, 'output.json')

    try:
        subprocess.run(curl_command, shell=True, check=True, stdout=open(output_file, 'w'))
        # json_file_to_csv(output_file, 'json.csv')
        print("API call successful. Output saved to 'output.json'.\n")
    except subprocess.CalledProcessError as e:
        print(f"Error executing curl command: {e}")
        return

# Function to read and print the output JSON
def print_output():
    try:
        with open(os.path.join(script_dir, 'output.json'), 'r') as f:
            output = json.load(f)
            print("Output JSON:")
            print(json.dumps(output, indent=4))
    except FileNotFoundError:
        print("Output file not found.")

def start_api_connection():
    # Check if API key file exists, if not, prompt for API key
    if not os.path.exists('api_key.txt'):
        print("api_key.txt not found. Must enter key manually")
        api_key = get_and_save_api_key_manually()
    else:
        print("api_key.txt found")
        # Read API key
        api_key = read_api_key_from_file()
        print("API key is: ", api_key)

    # Return API key
    return api_key

class Application:
    def __init__(self, api_key):
        self.api_key = api_key
        self.api_calls_map = {
            'info/parking/zones/' :
            'Returns a list of brief information on accessible parent/top-level zones',

            'info/parking/zones/{zoneId}' : 
            'Returns a list of properties for a parking zone',

            'info/parking/devices/{deviceEui}' :
            'Returns a list of information for a parking device',

            '/info/parking/stalls/{stallId}' :
            'Returns a list of information for a parking stall',
            
            '/payloads/parking/stalls/{stallId}' :
            'Returns a list of payloads for a stall (short description)',
                
            '/payloads/parking/stalls/{stallId}/latest' :
            'Returns the latest payload for a stall (short description)',
                
            '/payloads/parking/zones/{zoneId}' :
            'Returns a list of latest payloads for each stall of a zone (short description)',
                
            '/stats/parking/zones/{zoneId}' :
            'Returns a list of statistical data for a zone',

            '/stats/parking/stalls/{stallId}' :
            'Returns a list of statistical data for a stall',

            '/status/parking/zones/{zoneId}' :
            'Returns a summary of current device occupancy status for a zone',

            '/status/parking/zones/{zoneId}/all_stalls' :
            'Returns all stall statuses for a zone',

            '/alerts/active_zone_alerts' :
            'Returns a list of active zone-designated parking alert data for a zone',

            '/alerts/active_stall_alerts' :
            'Returns a list of active stall-designated parking alert data for a zone',

            '/alerts/alert_history' :
            'Returns a list of parking alert history',

            '/alerts/update_alert' :
            'Update a parking alert while status is not off',

            '/info/apps' :
            'Returns a list of information for owned apps',

            '/payloads/devices/{deviceEui}' :
            'Returns a list of payloads for a device (short description)',
                
            '/payloads/devices/{deviceEui}/latest' :
            'Returns the latest payload for a device (short description)'
        }   
        self.api_call_list = list(self.api_calls_map.items())
        print("api call list: ", self.api_call_list)

        self.menu_options = {
            1: ("Action 1", self.action_method,   self.api_call_list[0]),
            2: ("Action 2", self.action_method,   self.api_call_list[1]),
            3: ("Action 3", self.action_method,   self.api_call_list[2]),
            4: ("Action 4", self.action_method,   self.api_call_list[3]),
            5: ("Action 5", self.action_method,   self.api_call_list[4]),
            6: ("Action 6", self.action_method,   self.api_call_list[5]),
            7: ("Action 7", self.action_method,   self.api_call_list[6]),
            8: ("Action 8", self.action_method,   self.api_call_list[7]),
            9: ("Action 9", self.action_method,   self.api_call_list[8]),
            10: ("Action 10", self.action_method, self.api_call_list[9]),
            11: ("Action 11", self.action_method, self.api_call_list[10]),
            12: ("Action 12", self.action_method, self.api_call_list[11]),
            13: ("Action 13", self.action_method, self.api_call_list[12]),
            14: ("Action 14", self.action_method, self.api_call_list[13]),
            15: ("Action 15", self.action_method, self.api_call_list[14])
        }


    def action_method(self, input_data):
        api_call = input_data[0]
        api_call_explanation = input_data[1]
        print("API CALL: " + api_call)
        print("Explanation: " + api_call_explanation)
        run_api_call(self.api_key, api_call)
        print_output()

    def display_menu(self):
        for key, value in self.menu_options.items():
            print(f"{key}. {value[0]}")

    def run(self):
        while True:
            self.display_menu()
            try:
                selection = int(input("Select an option (1-15), or 0 to exit: "))
                if selection == 0:
                    break
                elif selection in self.menu_options:
                    _, action, input_data = self.menu_options[selection]
                    action(input_data)
                else:
                    print("Invalid option, please try again.")
            except ValueError:
                print("Please enter a valid number.")

if __name__ == "__main__":
    api_key = start_api_connection()
    app = Application(api_key)
    app.run()
