import React from 'react';

import general from '../general.module.css';
import styles from './helper-bar.module.css';

function startMsg(props) {
  if (!props.gs.started) {
    return "Click ready when you're ready for the game to start.";
  }
}

function buttonMsg(props) {
  if (!props.gs.started) {
    return "Ready";
  }
}

function HelperBar(props) {
  return (
    <div className={styles.barWrapper}>
      <span>
        {startMsg(props)}
      </span>
      <button className={general.actionBtn + ' ' + general.priorityBtn}
          onclick={() => props.callback('ready')}>
        {buttonMsg(props)}
      </button>
    </div>
  );
}

export default HelperBar;
