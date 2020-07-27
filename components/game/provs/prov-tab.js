import React from 'react';

import general from '../../general.module.css';
import styles from './provs-header.module.css';

function ProvTab(props) {
  return (
    <div className={styles.tabOuter + ' ' +
        (props.active ? styles.activeTab : styles.inactiveTab) + ' ' +
        (props.open ? styles.openTab : styles.closedTab)}
        onClick={() => props.tabCallback(props.index)}>
      {props.name}
    </div>
  )
}

export default ProvTab;
