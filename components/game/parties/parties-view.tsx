import React from "react";

import Party from "./party";
import styles from "./parties.module.css";

function partiesToJsx(gs, callback) {
  const partiesJsx = [];
  for (let i = 0; i < gs.parties.length; i++) {
    partiesJsx.push(
      <Party key={i}
          index={i}
          gs={gs}
          callback={callback} />
    );
  }
  return partiesJsx;
}

function PartiesView(props) {
  return (
    <div id={styles.partiesWrapper}>
      <h1 id={styles.gameName}>
        {props.gs.settings.name}
      </h1>
      {partiesToJsx(props.gs, props.callback)}
    </div>
  );
}

export default PartiesView;
