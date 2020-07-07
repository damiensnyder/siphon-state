import React from 'react';

import general from '../general.module.css';
import styles from './controls-header.module.css';

const READY_MSGS = [
  "Pick candidates to run in the election.",
  "Choose which candidates you want to fund.",
  "Vote for the official you want to make governor.",
  "Whoever controls the governor will receive a bonus."
];

function readyBtn(props) {
  if (props.gs.pov < 0) {
    return null;
  }

  const isReady = props.gs.parties[props.gs.pov].ready;
  var btnLabel = "Cancel";

  if (!isReady) {
    if (props.gs.ended) {
      btnLabel = "Rematch";
    } else if (props.gs.started) {
      btnLabel = "Done";
    } else {
      btnLabel = "Ready";
    }
  }

  return (
    <button id={styles.readyBtn}
            className={general.actionBtn + ' ' +
                       general.priorityBtn + ' ' +
                       styles.headerItem}
            onClick={() => {props.callback('ready', !isReady)}}>
      {btnLabel}
    </button>
  );
}

function ControlsHeader(props) {
  var helperMsg = "Click ready when you're ready to start.";

  if (props.gs.pov >= 0) {
    const isReady = props.gs.parties[props.gs.pov].ready;
    if (isReady) {
      if (props.gs.ended) {
        helperMsg = "Click cancel if you don't want to rematch.";
      } else if (props.gs.started) {
        helperMsg = "Click cancel to make further changes.";
      } else {
        helperMsg = "Click cancel if you're not ready.";
      }
    } else {
      if (props.gs.ended) {
        helperMsg = "Click rematch to play again.";
      } else if (props.gs.started) {
        helperMsg = READY_MSGS[props.gs.provs[props.gs.activeProvId].stage];
      }
    }
  } else {
    helperMsg = "Enjoy the show!";
  }

  return (
    <div id={styles.outerHeader}>
      <div id={styles.messageBar}
           className={styles.headerItem}>
        {helperMsg}
      </div>
      {readyBtn(props)}
    </div>
  );
}

export default ControlsHeader;