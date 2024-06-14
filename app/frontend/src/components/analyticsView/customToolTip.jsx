export const CustomTooltip = ({ active, payload,  label }) => {
    if (active && payload?.length) {
        return <div className="tooltip">
            {payload.map((ele, index) => {
                <>
                 <p>{`Time: ${ele.name}`}</p>
                 <p>{`Vehicles: ${ele.value}`}</p>
                </>
            })}
        </div>
    }
    {/*return value;*/}
}