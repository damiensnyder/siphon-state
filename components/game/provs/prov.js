import React from 'react';

import PolCategory from './pol-category';
import general from '../../general.module.css';
import styles from './provs.module.css';

const CANDIDATES_CATEGORY_NAMES = [
  "Nominees",
  "Candidates",
  "Also-ran",
  "Also-ran"
];

function polCategoriesToJsx(props) {
  const self = props.gs.provs[props.index];

  if (props.gs.pov < 0 && self.stage == 0) {
    return null;
  }

  const availablePols = [];
  if (props.gs.ownParty != undefined) {
    for (let i = 0; i < props.gs.ownParty.candidates.length; i++) {
      if (!self.candidates.includes(props.gs.ownParty.candidates[i])) {
        availablePols.push(props.gs.ownParty.candidates[i]);
      }
    }
  }

  const candidates = (
    <PolCategory gs={props.gs}
        name={CANDIDATES_CATEGORY_NAMES[self.stage]}
        isTop={self.stage < 2}
        callback={props.callback}
        pols={self.candidates}
        key={0} />
  );
  var available = (
    <PolCategory gs={props.gs}
        name={"Available"}
        isTop={false}
        callback={props.callback}
        pols={availablePols}
        key={1} />
  );
  const officials = (
    <PolCategory gs={props.gs}
        name={"Officials"}
        isTop={true}
        callback={props.callback}
        pols={self.officials}
        key={2} />
  );

  if (self.stage == 0) {
    return [candidates, available];
  } else if (self.stage <= 1) {
    return [candidates];
  } else {
    return [officials, candidates];
  }
}

function Prov(props) {
  return (
    <div className={styles.provOuter}>
      <div className={styles.provInner}>
        {polCategoriesToJsx(props)}
      </div>
    </div>
  );
}

export default Prov;
