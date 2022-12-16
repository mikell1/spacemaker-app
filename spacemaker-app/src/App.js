import spacemaker_logo from './resc/spacemaker-logo.png'
import './App.css';

import Solutions, { init_solution } from './Solutions'
import WorkSurface from './WorkSurface';
import Statistics from './Statistics';

import { useState } from 'react';
import {isMobile} from 'react-device-detect';


function App() {
  const [solution, setSolution] = useState(init_solution);
  const [surfaceKey, rerenderWorkSurface] = useState(0);
  const [selectedArea, setSelectedArea] = useState(null);

  /**
   * Updates the work surface and views a new selected solution.
   * 
   * @param {FeatureCollection} solution the solution to view on the work surface
   */
  function updateWorkSurface(solution) {
    setSelectedArea("");
    setSolution(solution);
    rerenderWorkSurface((count) => count + 1);
  }

  /**
   * Updates the statistics on the Statistics-component.
   * 
   * @param {number} area the area in quadrat metres
   */
  function updateStatistics(area) {
    if (!area) return setSelectedArea("");
    setSelectedArea(Math.round(area).toLocaleString() + " m2");
  }
  
  return (
    <div className={"App" + " mobile".repeat(isMobile)}>
      <header className="App-header">
        <img src={spacemaker_logo} className="App-logo" alt="logo" />
        <p>A Spacemaker app</p>
      </header>
      <div className="App-container">
        <div className="list-solutions item-left">
          <Solutions key="solutions" updateWorkSurface={updateWorkSurface}/>
        </div>
        <div className="work-surface item-center">
          <WorkSurface key={surfaceKey} solution={solution} updateStatistics={updateStatistics} />
        </div>
        <div className="statistics item-right">
          <Statistics key="stats" selectedArea={selectedArea}/>
        </div>
      </div>
    </div>
  );
}

export default App;
