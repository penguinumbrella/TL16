import os
import subprocess
import json
import eleven_x_api as x11

script_dir = os.path.dirname(os.path.abspath(__file__))

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

# Handle execution of curl command with API key and save output to local file temp.json
#
# input: API_CALL for eleven X
# output: API_CALL JSON return in local temp.json file
def run_api_call(api_key, api_call):
    if api_key is None:
        print("No API key found. Please provide an API key.")
        return

    api_call_with_params = x11.handle_parameters(api_call)
    curl_command = f'curl -X GET "https://app.eleven-x.com/api/v2/' + api_call_with_params + '" -H "accept: application/json" -H "Authorization: Bearer ' + api_key + '"'
    print("In the command line: " + curl_command + "\n")
    # Get the directory of the current script


    # Construct the full file path
    output_file = os.path.join(script_dir, 'output.json')

    try:
        subprocess.run(curl_command, shell=True, check=True, stdout=open(output_file, 'w'))
        print("API call successful. Output saved to 'temp.json'.\n")
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