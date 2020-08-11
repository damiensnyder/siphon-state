import React from "react";

import Pol from "./pol";
import styles from "./pol-category.module.css";

function polsToJsx(props) {
  if (props.pols.length == 0) {
    return <div className={styles.emptyMsg}>{props.emptyMsg}</div>;
  }

  return props.pols.map((pol, polIndex) => {
    return (
      <Pol gs={props.gs}
          callback={props.callback}
          pol={props.gs.pols[props.pols[polIndex]]}
          polIndex={props.pols[polIndex]}
          key={polIndex} />
    );
  });
}

function PolCategory(props) {
  return (
    <div className={styles.categoryWrapper + ' ' +
        (props.isTop ? styles.topCategory : '')}>
      <span className={styles.categoryName}>{props.name}</span>
      <div className={styles.polsOuter}>
        {polsToJsx(props)}
      </div>
    </div>
  );
}

export default PolCategory;
