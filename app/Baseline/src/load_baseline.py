import os
import baseline_model as baseline_model 


parkades_list = ["North","West","Rose Garden","Health Sciences","Fraser River","Thunderbird","University West Blvd"]

# Get the file names for data and the model and where the results will go
baseline_model_table_filename = os.path.abspath("Baseline/saved_baseline_model/baseline_model_table.csv")
baseline_model_term_dates_full_filename = os.path.abspath("Baseline/saved_baseline_model/baseline_model_term_dates_full.csv")

# Import the baseline model 
model  = baseline_model.random_baseline_model(baseline_model_table_filename, school_terms=True, import_filename=baseline_model_term_dates_full_filename)
