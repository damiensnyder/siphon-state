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
  }
  return tabsJsx;
}

function topMsg() {
  return null;
}

function ProvsHeader(props) {
  return (
    <div id={styles.outerHeader}>
      {props.gs.started ? tabsToJsx(props) : null}
      <div id={styles.messageBar}
           className={styles.headerItem}>
        {topMsg()}
      </div>
    </div>
  );
}

export default ProvsHeader;
