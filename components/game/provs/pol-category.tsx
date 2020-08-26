import React from "react";

import Pol from "./pol";
import styles from "./pol-category.module.css";

function PolCategory(props) {
  const isTop = props.gs.stage != 0 || props.name != "Available";
  return (
    <div className={styles.categoryWrapper}>
      <div className={styles.polsOuter}>
        {props.pols.map((pol, polIndex) => {
          return (
            <Pol gs={props.gs}
                callback={props.callback}
                pol={props.gs.pols[props.pols[polIndex]]}
                polIndex={props.pols[polIndex]}
                provIndex={props.provIndex}
                key={polIndex} />
          );
        })}
      </div>
    </div>
  );
}

export default PolCategory;
