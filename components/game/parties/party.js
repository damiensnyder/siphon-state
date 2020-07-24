import React from 'react';

import general from '../../general.module.css';
import styles from './parties-view.module.css';

function Party(props) {
  const self = props.gs.parties[props.index];
  return (
    <div className={styles.playerOuter}>
      <div className={styles.nameAndAbbr + " " +
          (props.gs.pov == props.index ? styles.ownParty : styles.priority)}>
        <span className={styles.name}>
          {self.name + " GAMER TIME"}
        </span>
        <span className={styles.abbr}>
          {self.abbr}
        </span>
      </div>
    </div>
  );
}

export default Party;
