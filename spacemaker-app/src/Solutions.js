import solution1 from './polygons/SE_State_Management_Polygons_1.json'
import solution2 from './polygons/SE_State_Management_Polygons_2.json'

let init_solution = solution1;

/**
 * Component showing a list of the available solutions
 * 
 * @component
 * @param {object} props the component's properties
 */
function Solutions(props) {
    let solutions = [];
    solutions.push(solution1, solution2);
    
    /**
     * Shows the selected solution on the work surface and
     * sets the solutions-list's styling.
     * 
     * @param {Event} event the click event
     * @param {FeatureCollection} solution the solution
     */
    function ShowInWorkSurface(event, solution) {
        Object.values(event.currentTarget.parentElement.parentElement.children).forEach((element) => {
            if (element.firstChild.className === "collection focused") element.firstChild.className = "collection";
        });
        event.currentTarget.className = "collection focused";
        props.updateWorkSurface(solution);
    }

    return (
        solutions.map((solution, index) => 
        <div key={index}>
            <div onClick={(event) => ShowInWorkSurface(event, solution)} className={'collection' + " focused".repeat(solution===init_solution)}>
                <span>Solution {index + 1}</span>
            </div>
            <div className='trailing-line'></div>
        </div>)
    );
}





export default Solutions;
export {init_solution};