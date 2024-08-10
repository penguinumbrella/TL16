import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime, timedelta
import os



def fetch_data():
    # Database credentials
    db_username = 'admin'
    db_password = 'UBCParking2024'
    db_server = 'testdb.cdq6s8s6klpd.ca-central-1.rds.amazonaws.com'
    db_name = 'Parking'

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
    end_date = datetime.now()
    end_date = end_date.replace(minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=7)
    print(start_date)
    print(end_date)

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

            # Rename the 'Vehicles' column to the parkade name
            df.rename(columns={'Vehicles': new_name}, inplace=True)
            
            # Align with the main DataFrame
            all_data = pd.concat([all_data, df], axis=1)

    # Drop duplicate columns in case of overlapping timestamps
    all_data = all_data.groupby(all_data.index).first()

    # Reset index to make Timestamp a column again
    all_data.reset_index(inplace=True)

    # Save to CSV (optional)
    all_data.to_csv('hourly_parkade_data.csv', index=False)

    print("Data retrieval complete. Saved to 'hourly_parkade_data.csv'.")
