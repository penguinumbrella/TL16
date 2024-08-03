
// Replace null values with empty strings
function replacer(key, value) {
    if (value === null) return '';
    return value;
  }

  // This is only for the parkade options
  function convertToCSV(dataArray,parkade, first) {      
    const csvColumns =  [ 'Timestamp', 'Parkade', 'Capacity','Vehicles'];

      const csvRows = [
        csvColumns.join(','), // Headers row
        ...dataArray.map(row => {
          return csvColumns.map(fieldName => {

            if (fieldName === 'Parkade') {
              return JSON.stringify(parkade, replacer);
            }

            if(fieldName === 'Timestamp'){
              return JSON.stringify(row['name'], replacer);
            }

            return JSON.stringify(row[fieldName], replacer);
          }).join(',');
        })
      ];

      return csvRows.join('\n');
  }




  function formatDateToCustomFormat(date, minutes) {
    // Extract year, month, day, and hour from the Date object
    const year = date.getFullYear().toString().slice(-2); // Last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed, pad with zero
    const day = date.getDate().toString().padStart(2, '0'); // Pad with zero
    const hour = date.getHours().toString().padStart(2, '0'); // Pad with zero

    if(minutes){
        let minute = date.getMinutes().toString().padStart(2, '0'); // Pad with zero
        return `${year}_${month}_${day}_${hour}_${minute}`;
    }

    // Construct and return the formatted string
    return `${year}_${month}_${day}_${hour}`;
}


function generateCSV(filename, data){
    const blob = new Blob([data], { type: 'text/csv' });

    const url = window.URL.createObjectURL(blob);

    // // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);

    // Simulate a click on the link to initiate the download
    document.body.appendChild(link);
    link.click();

    // Clean up by removing the temporary URL and link element
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
}

  //-------------------------------------------------------------------------------------------

  export async function genCSVhelperParkades(response, queryFeatures){
    const cutOff = ('Timestamp,Parkade,Capacity,Vehicles\n').length;
    let fullCSVFile = '';

    for (let i = 0; i < response.length; i++){
        const csvData = response[i].props.dataOverride;
        const parkade = response[i].props.title;
        const CSVfile = convertToCSV(csvData, parkade, i===0);

        if(i===0)
            fullCSVFile =  CSVfile;
        else
            fullCSVFile = fullCSVFile + '\n' + CSVfile.substring(cutOff);
    }
    
    const csvFileName = `${queryFeatures.dataCategory}_${queryFeatures.periodicity}_${queryFeatures.avgPeak}_${queryFeatures.selectedParkades.length}_${formatDateToCustomFormat(queryFeatures.startTime, false)}___${formatDateToCustomFormat(queryFeatures.endTime)}.csv`;
    generateCSV(csvFileName, fullCSVFile);

  }



  export async function genCSVhelperAccessibilty(response, accessibilityMenu){
    let csvColumns =  [];

    for (let col = 0; col < (response.props.columns).length; col++ ){
        csvColumns.push(response.props.columns[col].field);
    }

    const dataArray = response.props.rows;
    const csvRows = [
    csvColumns.join(','), // Headers row
    ...dataArray.map(row => {
        return csvColumns.map(fieldName => {

            return JSON.stringify(row[fieldName], replacer);
        }).join(',');
    })
    ];

    const fullCSVFile = csvRows.join('\n');
    const Timestamp = formatDateToCustomFormat(new Date(), true);
    const csvFileName = `Accessibility_${accessibilityMenu}_${Timestamp}.csv`;

    generateCSV(csvFileName, fullCSVFile);

  }

