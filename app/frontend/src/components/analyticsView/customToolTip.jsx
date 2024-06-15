const CustomTooltip = ({ active, payload,  label }) => {
    if (active && payload?.length) {
        const toReturn = <div className="tooltip" style={{width: '250px', backgroundColor: '#000000', opacity: 0.7}}>
            {payload.map((ele, index) => {
                return <>
                 <p>{`Time: ${ele.payload.name}`}</p>
                 <p>{`Vehicles: ${ele.payload.value}`}</p>
                </>
            })}
        </div>;

        console.log(toReturn);
        return toReturn;
    }
    return null;
}

export default CustomTooltip;