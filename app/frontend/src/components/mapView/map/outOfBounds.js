    function isOutOfBounds(projection) {
        // Get the elements
        const container = document.querySelector(`.map-container`);
        const infoWindow = document.querySelector(`.gm-style-iw-c`);
        // console.log(container)
        // console.log(element)

        // Get the bounding rectangles
        const containerRect = container.getBoundingClientRect();
        const infoWindowRect = infoWindow.getBoundingClientRect();

        // Check if the element is out of bounds
        let move = {
            'top' : 0,
            'bottom' : 0,
            'left' : 0,
            "right" :0
        }
        


        

        move.top = infoWindowRect.top < containerRect.top ? containerRect.top - infoWindowRect.top : 0
        move.left = infoWindowRect.left < containerRect.left ? containerRect.left - infoWindowRect.left : 0
        move.bottom = infoWindowRect.bottom > containerRect.bottom ? infoWindowRect.bottom - containerRect.bottom : 0
        move.right = infoWindowRect.right > containerRect.right ? infoWindowRect.right - containerRect.right : 0

        const isOut = infoWindowRect.top < containerRect.top ||
                      infoWindowRect.left < containerRect.left ||
                      infoWindowRect.bottom > containerRect.bottom ||
                      infoWindowRect.right > containerRect.right;




        
        // //--------------------------------------------------------------------------------------
        // const centerX = infoWindowRect.left + containerRect.width / 2;
        // const centerY = infoWindowRect.top + containerRect.height / 2;
        
        // console.log(`centerX = ${centerX}`);
        // console.log(`centerY = ${centerY}`);

        // const projectionDiv = projection.fromPointToLatLng(
        //     new window.google.maps.Point(centerX, centerY)
        //   );
        // console.log(projectionDiv.toJSON())


        // const sw = projection.fromPointToLatLng(
        //     new window.google.maps.Point(infoWindowRect.left, infoWindowRect.top + containerRect.height)
        //   );
        //   const ne = projection.fromPointToLatLng(
        //     new window.google.maps.Point(infoWindowRect.left + containerRect.width, infoWindowRect.top)
        //   );
  
        //   // Adjust the map view if necessary
        //   const bounds = new window.google.maps.LatLngBounds(sw, ne);
        //   console.log(bounds)
        //--------------------------------------------------------------------------------------





        return move;
        // return isOut;
    }

function checkIsOutOfBounds(currentPosition, projection, zoom) {
    const move = isOutOfBounds(projection);
    console.log(move)
    console.log(zoom)
    const defaultZoom = 15;
    let scale = Math.pow(2, defaultZoom - zoom)

    if(move.top > 0){
        let top_move;

        if(move.top < 101)
            top_move = 0.001;

        else if(move.top < 201)
            top_move = 0.003;

        else if(move.top < 301)
            top_move = 0.004;

        else
            top_move = 0.0058;

        currentPosition.lat = currentPosition.lat + (top_move * scale);
    }

    if(move.left > 0){
        let left_move;

        if(move.left < 101)
            left_move = 0.003;

        else if(move.left < 201)
            left_move = 0.004;

        currentPosition.lng = currentPosition.lng - (left_move * scale );
    }
    

    if(move.right > 0){
        let right_move;

        if(move.right < 101)
            right_move = 0.003;

        else 
            right_move = 0.004;
        
        currentPosition.lng = currentPosition.lng + (right_move *  scale);
    }
    


      


    // Create a new center based on those values and return it 

    // UBC default coordinates
    // let newPosition = currentPosition;

    // if(move.top !== 0){
    //     newPosition.lat = newPosition.lat + 0.0001
    //     // console.log(currentPosition)
    // }

    
    // console.log(move);

    // return newPosition;
    return currentPosition;
}
    
export default checkIsOutOfBounds;