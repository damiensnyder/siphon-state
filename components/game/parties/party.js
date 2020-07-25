import React from 'react';

import general from '../../general.module.css';
import styles from './parties-view.module.css';

function Party(props) {
  const self = props.gs.parties[props.index];
  var nameStyle = styles.nameAndAbbr;
  if (props.gs.pov == props.index) {
    nameStyle +=  " " + styles.ownParty;
  } else if (props.gs.priority == props.index) {
    nameStyle +=  " " + styles.priority
  }
  return (
    <div className={styles.playerOuter}>
      <div className={nameStyle}>
        <span className={styles.name}>
          {self.name}
        </span>
        <span className={styles.abbr}>
          {self.abbr}
        </span>
      </div>
    </div>
  );
}

export default Party;
