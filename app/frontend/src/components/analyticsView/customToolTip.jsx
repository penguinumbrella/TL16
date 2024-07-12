const CustomTooltip = ({ active, payload,  label }) => {
    if (active && payload?.length) {
        const toReturn = <div className="tooltip" style={{width: '250px', backgroundColor: '#000000', opacity: 0.7}}>
            {payload.map((ele, index) => {
                return <>
                 <p>{`Time: ${ele.payload.name}`}</p>
                 <p>{`Vehicles: ${ele.payload['Vehicles']}`}</p>
                 {Object.keys(ele.payload).map((key) => (
                    key !== 'name' && key !== 'Vehicles' ? (
                        <p key={key}>{`${key}: ${ele.payload[key]}`}</p>
                    ) : null
                ))}
                </>
            })}
        </div>;
        return toReturn;
    }
    return null;
}

export default CustomTooltip;