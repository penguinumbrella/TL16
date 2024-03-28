import os
import subprocess
import json 
import csv
import re
import api_lib

script_dir = os.path.dirname(os.path.abspath(__file__))

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


def check_yes_no(input_string):
    """
    Check if the input string is a variation of "yes" or "no".
    :param input_string: The string to check.
    :return: True if the string is a variation of "yes", False if it's a variation of "no".
    """
    normalized_str = input_string.strip().lower()  # Remove whitespace and convert to lowercase
    if normalized_str in ["y", "yes"]:
        return True
    elif normalized_str in ["n", "no"]:
        return False
    else:
        raise ValueError("Input must be a variation of 'yes' or 'no'.")

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

        self.api_call_list = list(self.api_calls_map.items())
        print("api call list: ", self.api_call_list)

        self.menu_options = {
            1:  ("API call 1:   "   + self.api_call_list[0] [0], self.action_method,   self.api_call_list[0] ),
            2:  ("API call 2:   "   + self.api_call_list[1] [0], self.action_method,   self.api_call_list[1] ),
            3:  ("API call 3:   "   + self.api_call_list[2] [0], self.action_method,   self.api_call_list[2] ),
            4:  ("API call 4:   "   + self.api_call_list[3] [0], self.action_method,   self.api_call_list[3] ),
            5:  ("API call 5:   "   + self.api_call_list[4] [0], self.action_method,   self.api_call_list[4] ),
            6:  ("API call 6:   "   + self.api_call_list[5] [0], self.action_method,   self.api_call_list[5] ),
            7:  ("API call 7:   "   + self.api_call_list[6] [0], self.action_method,   self.api_call_list[6] ),
            8:  ("API call 8:   "   + self.api_call_list[7] [0], self.action_method,   self.api_call_list[7] ),
            9:  ("API call 9:   "   + self.api_call_list[8] [0], self.action_method,   self.api_call_list[8] ),
            10: ("API call 10: " + self.api_call_list[9] [0], self.action_method,   self.api_call_list[9] ),
            11: ("API call 11: " + self.api_call_list[10][0], self.action_method,   self.api_call_list[10]),
            12: ("API call 12: " + self.api_call_list[11][0], self.action_method,   self.api_call_list[11]),
            13: ("API call 13: " + self.api_call_list[12][0], self.action_method,   self.api_call_list[12]),
            14: ("API call 14: " + self.api_call_list[13][0], self.action_method,   self.api_call_list[13]),
            15: ("API call 15: " + self.api_call_list[14][0], self.action_method,   self.api_call_list[14])
        }


    def action_method(self, input_data):
        api_call = input_data[0]
        api_call_explanation = input_data[1]
        print("API CALL: " + api_call)
        print("Explanation: " + api_call_explanation)
        if(check_yes_no(input("Are you sure you want to run this API call? (y/n)"))):        
            api_lib.run_api_call(self.api_key, api_call)
            api_lib.print_output()
        else:
            print("Returning to API menu\n")

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
    api_key = api_lib.get_api_key()
    app = Application(api_key)
    app.run()
