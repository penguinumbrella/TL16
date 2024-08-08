# from  load_baseline import load_baseline_model
import load_baseline as load_baseline
import pandas as pd
import sys


def main():
    date = sys.argv[1]
    parkades = sys.argv[2].split(',')
    print('{  "long_term_results" : [')


    for index, parkade in enumerate(parkades):
        cars = load_baseline.model.predict_one(pd.DatetimeIndex([date]),parkade)
        print('{', f' "name" : "{parkade}", "value" : {cars}' , ' }')
        
        if (index != len(parkades) - 1) and len(parkades) > 1 :
            print(",")            

    print(']}')

if __name__ == "__main__":
    main()