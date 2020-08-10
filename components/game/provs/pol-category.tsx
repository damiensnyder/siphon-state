import React from "react";

import Pol from "./pol";
import styles from "./pol-category.module.css";

function polsToJsx(props) {
  if (props.pols.length == 0) {
    return <div className={styles.emptyMsg}>{props.emptyMsg}</div>;
  }

  // note--polIndex is useful as a reference to which pol in the props array
  // the pol is. props.pols[polIndex] is the polIndex in gs.pols. capisce?
  return props.pols.map((pol, polIndex) => {
    return (
      <Pol gs={props.gs}
          callback={props.callback}
          self={props.pols[polIndex]}
          index={polIndex}
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
