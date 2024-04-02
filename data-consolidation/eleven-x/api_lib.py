import json
import os
import subprocess

local_dir_path = os.path.dirname(os.path.abspath(__file__))


# Handle execution of curl command with API key and save output to local file temp.json
#
# input: API_CALL for eleven X - assume api_call has parameters already
# output: API_CALL JSON return in local temp.json file
def run_api_call(api_call):
    api_key = get_api_key()
    if api_key is None:
        # print("No API key found. Please provide an API key.")
        return

    curl_command = f'curl -X GET "https://app.eleven-x.com/api/v2/' + api_call + '" -H "accept: application/json" -H "Authorization: Bearer ' + api_key + '"'
    # print("In the command line: " + curl_command + "\n")
    # Get the directory of the current script


    # Construct the full file path
    output_file = os.path.join(local_dir_path, 'temp.json')

    try:
        subprocess.run(curl_command, shell=True, check=True, stdout=open(output_file, 'w'))
        print("API call successful. Output saved to 'temp.json'.\n")
    except subprocess.CalledProcessError as e:
        print(f"Error executing curl command: {e}")
        return
    
# Function to read API key from file
# output: Returns a string of the api_key if api_key.txt file exists locally
# Otherwise, returns an exception FileNotFoundError
def read_api_key_from_file():
    try:
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api_key.txt'), 'r') as f:
            return f.readline().strip()
    except FileNotFoundError:
        print("API key file not found.")
        return None
    
    # Function to read and print the output JSON
def print_output():
    try:
        with open(os.path.join(local_dir_path, 'temp.json'), 'r') as f:
            output = json.load(f)
            print("Output JSON:")
            print(json.dumps(output, indent=4))
    except FileNotFoundError:
        print("Output temp.json file not found.")

# Function to get API key from user input and save it to a file
def get_and_save_api_key_manually():
    manual_api_key = input("Please enter your API key: ").strip()
    return manual_api_key

def get_api_key():
    # Check if API key file exists, if not, prompt for API key
    if not os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api_key.txt')):
        print("api_key.txt not found. Must enter key manually")
        api_key = get_and_save_api_key_manually()
    else:
        # print("api_key.txt found")
        # Read API key
        api_key = read_api_key_from_file()
        # print("API key is: ", api_key)

    # Return API key
    return api_key