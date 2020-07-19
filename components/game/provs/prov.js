import React from 'react';

import PolCategory from '../pol-category';
import general from '../../general.module.css';
import styles from './prov.module.css';

function polCategoriesToJsx(props) {
  const self = props.gs.provs[props.index];
  const candidates = (
    <div className={styles.categoryContainer}>
      <PolCategory gs={props.gs}
          name={"Candidates"}
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

  if (self.stage <= 1) {
    return [candidates];
  } else if (self.stage == 2) {
    return [officials, candidates];
  } else if (self.stage == 3) {
    return [governors, officials, candidates];
  } else {
    return [];
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
