export function formatUnixTimestamp(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000); // Convert Unix timestamp to milliseconds
  
    // Get the day
    const day = date.getDate();
  
    // Get the month name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
  
    // Get the full year
    const year = date.getFullYear();
  
    // Get the hours and minutes
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    // Format the date and time string
    const formattedDate = `${day} ${month}, ${year} ${hours}:${minutes}`;
  
    return formattedDate;
  }

  export const formatDateString = (dateString) => {
    // Split the date string into components
    const [year, month, day] = dateString.split('-').map(Number);
  
    // Create a new date object using the local timezone
    const date = new Date(year, month - 1, day); // month is zero-indexed
  
    // Get the day
    const dayOfMonth = date.getDate();
  
    // Get the month name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[date.getMonth()];
  
    // Get the full year
    const fullYear = date.getFullYear();
  
    // Format the date string
    const formattedDate = `${dayOfMonth} ${monthName}, ${fullYear}`;
  
    console.log(`${dateString} -> ${formattedDate}`);
    return formattedDate;
  }