import React from "react";

import ProvTab from "./prov-tab";
import styles from "./provs-header.module.css";

function tabsToJsx(props) {
  const tabsJsx = [];
  props.gs.provs.forEach((prov, provIndex) => {
    tabsJsx.push(
      <ProvTab name={props.gs.provs[provIndex].name}
          index={provIndex}
          key={provIndex}
          open={props.activeTab == provIndex}
          tabCallback={props.tabCallback} />
    );
    if (provIndex < 4) {
      tabsJsx.push(
        <div className={styles.pointer}
            key={provIndex + 5}>
          ➤
        </div>
      );
    }
  });
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