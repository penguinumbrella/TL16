const TABLES = {
    'Fraser River': 'FraserParkade',
    'North': 'NorthParkade',
    'West': 'WestParkade',
    'Health Sciences': 'HealthSciencesParkade',
    'Thunderbird': 'ThunderbirdParkade',
    'University West Blvd': 'UnivWstBlvdParkade',
    'Rose Garden': 'RoseGardenParkade'
  }

const PARKADE_NAMES = {
    'Fraser River': 'Fraser Parkade',
    'North': 'North Parkade',
    'West': 'West Parkade',
    'Health Sciences': 'Health Sciences Parkade',
    'Thunderbird': 'Thunderbird Parkade',
    'University West Blvd': 'University West Boulevard',
    'Rose Garden': 'Rose Garden Parkade'
}

export const getQueries = (dataCategory, visualizationFormat, periodicity, avgPeak, selectedParkades, startTime, endTime) => {
    const queries = {};
    selectedParkades.forEach((parkade) => {
        const tableName = TABLES[parkade];
        const startUnix = Math.floor(startTime.getTime() / 1000);
        const endUnix = Math.floor(endTime.getTime() / 1000);

        // This will be a UNIX timestamp if Periodicity is Hourly, else a date
        const timeSlot = getTimeSlotByPeriodicity(startUnix, endUnix, periodicity)

        if (periodicity == 'Hourly'){
          // % url encoded
          const query = `SELECT Vehicles, TimestampUnix, Capacity from ${tableName}_Occupancy WHERE TimestampUnix >= ${timeSlot.modifiedStartTime} and TimestampUnix <= ${timeSlot.modifiedEndTime} and TimestampUnix %25 3600 = 0 ORDER BY TimestampUnix`
          queries[parkade] = {
              'query': query,
              'startTime': timeSlot.modifiedStartTime,
              'endTime': timeSlot.modifiedEndTime,
              'periodicity': periodicity,
              'avgPeak': avgPeak,
              'diagType': visualizationFormat
          };
        } else if (periodicity == 'Daily'){
          const startDate = convertUnixToDate(timeSlot.modifiedStartTime);
          const endDate = convertUnixToDate(timeSlot.modifiedEndTime);
          const query = `SELECT date, average_occupancy, peak_occupancy, peak_occupancy_time, Capacity from Daily_Occupancy_Stats WHERE date >= '${startDate}' and date <= '${endDate}' and zone_id = (SELECT zone_id from Parkade_management where parkade_name = '${PARKADE_NAMES[parkade]}')`;
          queries[parkade] = {
            'query': query,
            'startTime': startDate,
            'endTime': endDate,
            'periodicity': periodicity,
            'avgPeak': avgPeak,
            'diagType': visualizationFormat
          }
        } else if (periodicity == 'Weekly') {
          const startDate = convertUnixToDate(timeSlot.modifiedStartTime);
          const endDate = convertUnixToDate(timeSlot.modifiedEndTime);  
          const query = `SELECT week_start_date, week_end_date, average_occupancy, peak_occupancy, peak_occupancy_time, Capacity from Weekly_Occupancy_Stats WHERE week_start_date >= '${startDate}' and week_end_date <= '${endDate}' and zone_id = (SELECT zone_id from Parkade_management where parkade_name = '${PARKADE_NAMES[parkade]}')`;
          queries[parkade] = {
            'query': query,
            'startTime': startDate,
            'endTime': endDate,
            'periodicity': periodicity,
            'avgPeak': avgPeak,
            'diagType': visualizationFormat
          }
        } else if (periodicity == 'Monthly') {
          // TODO
        }
    });
    return queries;
}

export const PERIODICITY_STEP = {
    'Hourly': 3600,
    'Daily': 3600*24,
    'Weekly': 3600*24*7
}

export const getTimeSlotByPeriodicity = (startTime, endTime, periodicity) => {
    const startDate = new Date(startTime * 1000);
    const endDate = new Date(endTime * 1000);
  
    let modifiedStartTime;
    let modifiedEndTime;


    if (periodicity === 'Hourly') {
        while(startTime % 3600 !== 0)
            startTime++;
        modifiedStartTime = startTime
        modifiedEndTime = Math.floor(endTime / 3600) * 3600
    }
    else if (periodicity === 'Daily') {
      // Daily: closest 12 am after startTime, closest 12 am before endTime
      if(startDate.getHours() == 0 && startDate.getMinutes() == 0)
        startDate.setHours(0, 0, 0, 0)
      else startDate.setHours(24, 0, 0, 0);
      modifiedStartTime = startDate.getTime() / 1000;

      endDate.setHours(0, 0, 0, 0);
      modifiedEndTime = endDate.getTime() / 1000;
    } else if (periodicity === 'Weekly') {
      // Weekly: 12 am Sunday after startTime, 12 am Saturday before endTime
      const startDay = startDate.getDay();
      const endDay = endDate.getDay();
  
      const daysToAddStart = (8 - startDay) % 7;
      startDate.setDate(startDate.getDate() + daysToAddStart);
      startDate.setHours(0, 0, 0, 0);
      modifiedStartTime = startDate.getTime() / 1000;
  
      const daysToSubtractEnd = (endDay) % 7; // Closest Saturday before endTime
      endDate.setDate(endDate.getDate() - daysToSubtractEnd);
      endDate.setHours(0, 0, 0, 0);
      modifiedEndTime = endDate.getTime() / 1000;
      console.log(modifiedStartTime)
      console.log(modifiedEndTime)
    } else if (periodicity === 'Monthly') {
      // Monthly: 12 am 1st of month after startTime, 12 am last day of month before endTime
      startDate.setMonth(startDate.getMonth() + 1, 1);
      startDate.setHours(0, 0, 0, 0);
      modifiedStartTime = startDate.getTime() / 1000;
  
      endDate.setDate(1); // Move to the first day of the current month
      endDate.setMonth(endDate.getMonth() + 1); // Move to the first day of the next month
      endDate.setDate(0); // Move back to the last day of the current month
      endDate.setHours(0, 0, 0, 0);
      modifiedEndTime = endDate.getTime() / 1000;
    }
  
    return { modifiedStartTime, modifiedEndTime };
  }; 

export const convertUnixToDate = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};