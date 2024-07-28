    function isOutOfBounds() {
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
        };
        

        move.top = infoWindowRect.top < containerRect.top ? containerRect.top - infoWindowRect.top : 0;
        move.left = infoWindowRect.left < containerRect.left ? containerRect.left - infoWindowRect.left : 0;
        move.bottom = infoWindowRect.bottom > containerRect.bottom ? infoWindowRect.bottom - containerRect.bottom : 0;
        move.right = infoWindowRect.right > containerRect.right ? infoWindowRect.right - containerRect.right : 0;



        return move;
    }

function checkIsOutOfBounds(currentPosition,  zoom) {
    const move = isOutOfBounds();
    const defaultZoom = 15;
    let scale = Math.pow(2, defaultZoom - zoom);


    if(move.top > 0){
        let top_move = move.top / 67000;
        currentPosition.lat = currentPosition.lat + (top_move * scale);
    }

    if(move.left > 0){
        let left_move = move.left / 40000;
        currentPosition.lng = currentPosition.lng - (left_move * scale );
    }
    
    if(move.right > 0){
        let right_move = move.right / 40000;
        currentPosition.lng = currentPosition.lng + (right_move *  scale);
    }
    
    return currentPosition;
}
    
export default checkIsOutOfBounds;