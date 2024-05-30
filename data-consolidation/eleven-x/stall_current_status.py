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
API_CALL_TEMPLATE = 'stats/parking/stalls/{stall_id}?from_date={from_date}&to_date={to_date}&period_type=d'
DATE_FORMAT = '%Y-%m-%d'
local_dir_path = os.path.dirname(os.path.abspath(__file__))

# Ensure the stalls folder exists
if not os.path.exists(STALLS_FOLDER):
    os.makedirs(STALLS_FOLDER)

