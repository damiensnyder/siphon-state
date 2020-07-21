import React from 'react';

import PolCategory from '../pol-category';
import general from '../../general.module.css';
import styles from './prov.module.css';

function polCategoriesToJsx(props) {
  const self = props.gs.provs[props.index];
  const sympathetic = (
    <div className={styles.categoryContainer}>
      <PolCategory gs={props.gs}
          name={"Sympathetic"}
          callback={props.callback}
          pols={[]}
          key={0} />
    </div>
  )
  const candidates = (
    <div className={styles.categoryContainer}>
      <PolCategory gs={props.gs}
          name={self.stage <= 1 ? "Candidates" : "Also-ran"}
          callback={props.callback}
          pols={self.candidates}
          key={1} />
    </div>
  );
  const officials = (
    <div className={styles.categoryContainer}>
      <PolCategory gs={props.gs}
          name={"Officials"}
          callback={props.callback}
          pols={self.officials}
          key={2} />
    </div>
  );
  const governors = (
    <div className={styles.categoryContainer}>
      <PolCategory gs={props.gs}
          name={"Governor"}
          callback={props.callback}
          pols={self.governors}
          key={3} />
    </div>
  );
  const emptyContainer = <div className={styles.categoryContainer} />;

  if (self.stage <= 1) {
    return [candidates, sympathetic];
  } else if (self.stage == 2) {
    return [officials, candidates];
  } else if (self.stage == 3) {
    return [officials, candidates];
  }
}

function Prov(props) {
  return (
    <div className={general.outerWrapper + ' ' +
        styles.allCategories + ' ' +
        styles.provBg}>
      {polCategoriesToJsx(props)}
    </div>
  );
}

export default Prov;
