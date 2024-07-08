const TABLES = {
    'Fraser River': 'FraserParkade',
    'North': 'NorthParkade',
    'West': 'WestParkade',
    'Health Sciences': 'HealthSciencesParkade',
    'Thunderbird': 'ThunderbirdParkade',
    'University West Blvd': 'UnivWstBlvdParkade',
    'Rose Garden': 'RoseGardenParkade'
  }
export const getQueries = (dataCategory, visualizationFormat, periodicity, avgPeak, selectedParkades, startTime, endTime) => {
    const queries = {};
    selectedParkades.forEach((parkade) => {
        const tableName = TABLES[parkade];
        const startUnix = Math.floor(startTime.getTime() / 1000);
        const endUnix = Math.floor(endTime.getTime() / 1000);
        // % url encoded
        const query = `SELECT Vehicles, TimestampUnix from ${tableName}_Occupancy WHERE TimestampUnix >= ${startUnix} and TimestampUnix <= ${endUnix} and TimestampUnix %25 3600 = 0 ORDER BY TimestampUnix`
        queries[parkade] = {
            'query': query,
            'startTime': startUnix,
            'endTime': endUnix,
            'periodicity': periodicity
        };
    });
    return queries;
}

export const PERIODICITY_STEP = {
    'Hourly': 3600,
    'Daily': 3600*24,
    'Weekly': 3600*24*7
}

const getTimeSlotByPeriodicity = (startTime, endTime) => {
    
} 