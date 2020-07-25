import React from 'react';

import general from '../general.module.css';
import styles from './helper-bar.module.css';

function startMsg(props) {
  if (!props.gs.started && props.gs.pov >=0) {
    return "Click ready when you're ready for the game to start.";
  }
}

function HelperBar(props) {
  return (
    <div className={styles.barWrapper}>
      <span>
        {startMsg(props)}
      </span>
    </div>
  );
}

export default HelperBar;
