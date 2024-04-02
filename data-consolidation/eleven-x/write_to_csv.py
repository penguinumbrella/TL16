import csv
import os
import json
import subprocess
import unittest

local_dir_path = os.path.dirname(os.path.abspath(__file__))

def write_dicts_to_csv(dict_list, filename, x11=True):
    # Check dictionary list not empty
    if not dict_list:
        return  # Exit if the list is empty

    # Collect all unique keys from all dictionaries
    # USE LINE BELOW FOR ANY LIST OF DICS
    if(x11 == False):
        fieldnames = set(key for d in dict_list for key in d.keys())
    else:
        fieldnames = create_field_names_for_x11()

    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)

        # Write the header row
        writer.writeheader()

        # Write the dictionary data
        for d in dict_list:
            writer.writerow(d)

def create_field_names_for_x11():
    return ['stall_id', 
            'display_name', 
            'description', 
            'latitude', 
            'longitude', 
            'device_eui', 
            'linked_date', 
            'zone_id', 
            'zone_display_name']

################################################################################33


####### TEST #######
class TestCSVContent(unittest.TestCase):
    def test_csv_content_exact_match(self):
        try:
            expected_content = [
                ['h1', 'h2'],
                ['v1', 'v4'],
                ['v2', 'v5'],
                ['v3', 'v6']
            ]
            
            with open(os.path.join(local_dir_path, 'test_csv.csv'), mode='r') as file:
                reader = csv.reader(file)
                actual_content = list(reader)
            
            self.assertEqual(actual_content, expected_content)
            print("test_csv_content_exact_match: PASS")
        except AssertionError as e:
            print(f"test_csv_content_exact_match: FAILED\n{e}")

    def test_csv_keys_values_alignment(self):
        
        dict_list = [
            {'h1': 'v1', 'h2': 'v4'},
            {'h1': 'v2', 'h2': 'v5'},
            {'h1': 'v3', 'h2': 'v6'}
        ]
        
        try:
            with open(os.path.join(local_dir_path, 'test_csv.csv'), mode='r') as file:
                reader = csv.DictReader(file)
                columns = reader.fieldnames
                for expected_dict in dict_list:
                    row = next(reader)
                    for key in expected_dict:
                        self.assertEqual(row[key], expected_dict[key])
                        self.assertIn(key, columns)
            print("test_csv_keys_values_alignment_match: PASS")
        except AssertionError as e:
            print(f"test_csv_keys_values_alignment_match: FAILED\n{e}")

# Example usage
list_of_dicts = [
    {'h1': 'v1', 'h2': 'v4'},
    {'h1': 'v2', 'h2': 'v5'},
    {'h1': 'v3', 'h2': 'v6'}
]

if __name__ == "__main__":
    print("Test write to csv")
    write_dicts_to_csv(list_of_dicts, os.path.join(local_dir_path, 'test_csv.csv'), x11=False)
    test_suite = unittest.TestSuite()
    test_suite.addTest(TestCSVContent('test_csv_content_exact_match'))
    test_suite.addTest(TestCSVContent('test_csv_keys_values_alignment'))

    runner = unittest.TextTestRunner()
    runner.run(test_suite)
