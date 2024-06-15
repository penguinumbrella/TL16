import React, { useState } from 'react';
import DateTimePicker from 'react-datetime-picker';

function formatDate(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Month is zero-indexed
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const ForcastComponent =({date, setDate})=>{
    // const [date, setDate] = useState(new Date());

    const minDateTime = new Date();
    // Prediction starts from 1 hour ahead of the current time
    minDateTime.setHours(minDateTime.getHours() + 1);
    minDateTime.setMinutes(0);


    // Arbitrary date for now
    const maxDateTime = new Date('2025-12-31'); 
    maxDateTime.setHours(0); 


    const handleDateChange = (newDate) => {
    // Prevent changes to the minutes
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        setDate(formatDate(newDate));
        console.log(formatDate(newDate))
    };

    

    return(
    <div>
          <DateTimePicker
            onChange={handleDateChange}
            value={date}
            minDate={minDateTime}
            maxDate={maxDateTime}
          />
                  
    </div>
    );
}


export default ForcastComponent;





