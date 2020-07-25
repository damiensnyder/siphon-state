import React, {useLayoutEffect, useState} from 'react';

import Pol from './pol';
import styles from './pol-category.module.css';

function polsToJsx(props) {
  if (props.pols.length == 0) {
    return <div className={styles.emptyMsg}>{props.emptyMsg}</div>;
  }

  const polsJsx = [];
  for (let i = 0; i < props.pols.length; i++) {
    polsJsx.push(
      <Pol gs={props.gs}
          callback={props.callback}
          self={props.pols[i]}
          key={i} />
    );
  }

  return polsJsx;
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
