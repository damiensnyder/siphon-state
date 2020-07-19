import React from 'react';

import styles from './controls-tab.module.css';

function ControlsTab(props) {
  return (
    <div className={styles.tabOuter + ' ' +
            (props.active ? styles.activeTab : styles.inactiveTab)}
        onClick={() => props.tabCallback(props.index)}>
      {props.name}
    </div>
  )
}

export default ControlsTab;
