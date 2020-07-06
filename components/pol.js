import React from 'react';

import general from './general.module.css';
import styles from './pol.module.css';

// Return the appropriate action button for the pol (e.g., "Flip"), or none
// if no action is applicable or the viewer is not playing.
function actionButton(props) {
  const gs = props.gs;
  const self = gs.pols[props.index];
  const stage = gs.provs[gs.activeProvId].stage;
  const callback = props.callback;

  if (gs.pov < 0) {
    return null;
  }
  if (gs.parties[gs.pov].symps.includes(props.index)
      && !props.inProv) {
    return (
      <button className={general.actionBtn}
              onClick={e => callback('flip', props.index)}>
        Flip
      </button>
    );
  }
  if (stage == 0
      && self.party === gs.pov
      && self.runnable) {
    return (
      <button className={general.actionBtn}
              onClick={e => callback('run', props.index)}>
        Run
      </button>
    );
  }
  if (gs.provs[gs.activeProv].candidates.includes(props.index)
      && stage == 1
      && self.party === gs.pov
      && !self.funded) {
    return (
      <button className={general.actionBtn}
              onClick={e => callback('fund', props.index)}>
        Fund
      </button>
    );
  }
  if (gs.provs[gs.activeProv].officials.includes(props.index)
      && gs.parties[gs.pov].votes > 0
      && stage == 2) {
    return (
      <button className={general.actionBtn}
              onClick={e => callback('vote', props.index)}>
        Vote
      </button>
    );
  }
  return null;
}

function Pol(props) {
  const self = props.gs.pols[props.index];
  return (
    <div className={styles.sameLine}>
      <div>{self.name} ({props.gs.parties[self.party].abbr})</div>
      {actionButton(props)}
    </div>
  );
}

export default Pol;
