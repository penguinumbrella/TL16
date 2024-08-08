from bs4 import BeautifulSoup
import requests
from datetime import datetime
import pandas as pd
import numpy as np


# This only works for the website if the html looks like index.html 
# Returns a list of timestamps for the school terms at https://vancouver.calendar.ubc.ca/dates-and-deadlines
def get_term_dates():
    res = requests.get("https://vancouver.calendar.ubc.ca/dates-and-deadlines")
    doc = BeautifulSoup(res.text, "html.parser")
    term_dates = []

    # get the first 3 tables which have th relevant dates 
    figs = doc.find_all("figure")[0:3]
    for figure in figs:
        
        # get the date tags from the tables
        fig = figure.find_all("th")
        string_size_1 = len(fig[1].get_text())
        string_size_2 = len(fig[2].get_text())
        year_1 = fig[1].get_text()[string_size_1-5 : string_size_1-1]
        year_2= fig[2].get_text()[string_size_2-5 : string_size_2-1]

        td = figure.find_all("td")

        date_indexes = [1,13,2,14]
        for i in date_indexes:
            input_date_string = td[i].get_text()
            # print(input_date_string)
            date_object = datetime.strptime(input_date_string, "%A, %B %d")
            output_date_string = date_object.strftime("%m-%d")

            if(i == 1 or i == 13):
                date = f"{year_1}-{output_date_string} 00:00:00"
            else:
                date = f"{year_2}-{output_date_string} 00:00:00"
            
            term_dates.append(pd.Timestamp(date))
            # term_dates.append(pd.Timestamp(date))
    return term_dates
                


