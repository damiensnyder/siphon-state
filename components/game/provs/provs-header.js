import React from 'react';

import ProvTab from './prov-tab';
import general from '../../general.module.css';
import styles from './provs-header.module.css';

function tabsToJsx(props) {
  const tabsJsx = [];
  for (let i = 0; i < 5; i++) {
    tabsJsx.push(
      <ProvTab name={props.gs.provs[i].name}
          index={i}
          key={i}
          open={props.activeTab == i}
          active={props.gs.activeProvId == i}
          tabCallback={props.tabCallback} />
    );
    if (i < 4) {
      tabsJsx.push(<div className={styles.pointer}>➤</div>);
    }
  }
  return tabsJsx;
}

function ProvsHeader(props) {
  return (
    <div className={styles.outerHeader}>
      {props.gs.started ? tabsToJsx(props) : null}
    </div>
  );
}

export default ProvsHeader;
