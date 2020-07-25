import React from 'react';

import general from '../../general.module.css';
import styles from './parties-view.module.css';

function formatMoneyString(amount) {
  return ("$" + (amount * 100000)).replace(/000/g, ",000");
}

function controlsAndInfoJsx(props) {
  const self = props.gs.parties[props.index];
  if (props.gs.started && props.gs.pov == props.index) {
    return formatMoneyString(self.funds);
  }
  if (props.gs.pov < 0 && !self.connected) {
    return (
      <button className={general.actionBtn}
          onClick={() => props.callback('replace', props.index)}>
        Replace
      </button>
    );
  }
  return null;
}

function Party(props) {
  const self = props.gs.parties[props.index];
  var nameStyle = styles.nameAndAbbr;
  if (props.gs.pov == props.index) {
    nameStyle +=  " " + styles.ownParty;
  } else if (props.gs.priority == props.index) {
    nameStyle +=  " " + styles.priority
  }
  return (
    <div className={styles.playerOuter + " " +
        (self.ready ? styles.ready : "")}>
      <div className={nameStyle}>
        <span className={styles.name}>
          {self.name}
        </span>
        <span className={styles.abbr}>
          {self.abbr}
        </span>
      </div>
      <div className={styles.controlsAndInfo}>
        {controlsAndInfoJsx(props)}
      </div>
    </div>
  );
}

export default Party;
