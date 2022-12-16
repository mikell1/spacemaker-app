/**
 * Component for showing statistics for the work surface
 * 
 * @component
 * @param {object} props the component's properties
 */
function Statistics(props) {
    return (
        <>
        <div className="stats-item">
            <span>Select a polygon to do the following operations: union or intersect</span>
        </div>
        <div className="stats-item">
            <span className="stats-area-label">Area selected polygon</span>
            <span>{"→ "}</span>
            <span>{props.selectedArea}</span>
        </div>
        </>
    );
}


export default Statistics;