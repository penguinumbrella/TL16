CREATE TABLE [dbo].[Weekly_Occupancy_Stats] (
    week_start_date NVARCHAR(255) PRIMARY KEY,
    week_end_date NVARCHAR(255),
	zone_id NVARCHAR(255),
	average_occupancy INT,
    peak_occupancy INT,
    peak_occupancy_time BIGINT
);