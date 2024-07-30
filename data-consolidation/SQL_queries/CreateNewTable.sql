CREATE TABLE [Parking].[dbo].[CurrentCompliance] (
    ParkadeName NVARCHAR(255) PRIMARY KEY,
    Permid INT,
	PayStation INT,
	HonkApp INT,
    Violation INT,
    LastUpdate NVARCHAR(255)
);