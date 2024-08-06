import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
# Load environment variables from .env file

# Change the current working directory
os.chdir('C:\\cpen491\\TL16\\app\\LightGBM\\shortterm')

print(os.listdir)

# Verify the current working directory
print(os.getcwd())



def fetch_data(start_date, end_date):
    load_dotenv()
    # Retrieve database credentials from environment variables
    db_username = os.getenv('DB_USERNAME')
    db_password = os.getenv('DB_PASSWORD')
    db_server = os.getenv('DB_SERVER')
    db_name = os.getenv('DB_NAME')

    # SQLAlchemy connection string
    connection_string = f'mssql+pyodbc://{db_username}:{db_password}@{db_server}/{db_name}?driver=ODBC+Driver+17+for+SQL+Server'

    # Create the SQLAlchemy engine
    engine = create_engine(connection_string)

    # List of tables to query with their new names
    tables = {
        'dbo.NorthParkade_Occupancy': 'North',
        'dbo.WestParkade_Occupancy': 'West',
        'dbo.RoseGardenParkade_Occupancy': 'Rose',
        'dbo.HealthSciencesParkade_Occupancy': 'Health Sciences',
        'dbo.FraserParkade_Occupancy': 'Fraser',
        'dbo.ThunderbirdParkade_Occupancy': 'Thunderbird',
        'dbo.UnivWstBlvdParkade_Occupancy': 'University Lot Blvd'
    }

    # Calculate timestamp range for the past week

    start_date = start_date - timedelta(days = 7)
    end_date = end_date - timedelta(days = 7)

    # Convert dates to Unix timestamps
    start_timestamp_unix = int(start_date.timestamp())
    end_timestamp_unix = int(end_date.timestamp())


    # Initialize DataFrame to hold results
    all_data = pd.DataFrame()

    # Query each table and concatenate results
    with engine.connect() as connection:
        for table, new_name in tables.items():
            print(f"Querying table: {table}")
            
            query = f"""
            SELECT Vehicles, TimestampUnix
            FROM {table}
            WHERE TimestampUnix BETWEEN {start_timestamp_unix} AND {end_timestamp_unix}
            """
            df = pd.read_sql(query, connection)

            # Convert TimestampUnix to datetime
            df['Timestamp'] = pd.to_datetime(df['TimestampUnix'], unit='s')
            df.set_index('Timestamp', inplace=True)

            df.drop(columns=['TimestampUnix'], inplace=True)

            # Rename the 'Vehicles' column to the parkade name
            df.rename(columns={'Vehicles': new_name}, inplace=True)

            df = df[~df.index.duplicated(keep='last')]

            df = df.asfreq('h')

            # Align with the main DataFrame
            all_data = pd.concat([all_data, df], axis=1)

    # Drop duplicate columns in case of overlapping timestamps
    all_data = all_data.groupby(all_data.index).first()

    # Reset index to make Timestamp a column again
    all_data.reset_index(inplace=True)

    # Save to CSV (optional)
    all_data.to_csv('hourly_parkade_data.csv', index=False)

    print("Data retrieval complete. Saved to 'hourly_parkade_data.csv'.")

def main(start_date, end_date):
    # Change the current working directory
    os.chdir('C:\\cpen491\\TL16\\app\\LightGBM\\shortterm')

    print(os.listdir())  # Note: Add parentheses to call the function
    print(os.getcwd())

    # Call the function to fetch data
    fetch_data(start_date, end_date)

if __name__ == "__main__":
    main()