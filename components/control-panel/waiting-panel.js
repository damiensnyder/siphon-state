import React from 'react';

import ControlsHeader from './controls-header';
import general from './general.module.css';

function WaitingPanel(props) {
  return (
    <div className={general.outerWrapper}>
      <ControlsHeader offMsg={"Click ready when you're ready to start."}
                      onMsg={"Click cancel if you're not ready anymore."}
                      callback={props.callback} />
    </div>
  );
}

export default WaitingPanel;
