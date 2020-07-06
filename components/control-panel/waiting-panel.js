import React from 'react';

import ControlsHeader from './controls-header';
import general from '../general.module.css';

function WaitingPanel(props) {
  return (
    <div className={general.outerWrapper}>
      <ControlsHeader gs={props.gs}
                      callback={props.callback} />
    </div>
  );
}

export default WaitingPanel;
