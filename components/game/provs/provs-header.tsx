import React from "react";

import ProvTab from "./prov-tab";
import styles from "./provs-header.module.css";

function tabsToJsx(props): React.ReactNode {
  const tabsJsx: React.ReactNode[] = [];
  props.gs.provs.forEach((prov, provIndex) => {
    tabsJsx.push(
      <ProvTab name={props.gs.provs[provIndex].name +
              (prov.seats > 1 ? ` (${prov.seats})` : "")}
          index={provIndex}
          key={provIndex}
          open={props.activeTab == provIndex}
          tabCallback={props.tabCallback} />
    );
    if (provIndex < props.gs.provs.length - 1) {
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
  if (!props.gs.started ||
      props.gs.stage >= 2) {
    return null;
  }

  return (
    <div className={styles.outerHeader}>
      {tabsToJsx(props)}
    </div>
  );
}

export default ProvsHeader;
