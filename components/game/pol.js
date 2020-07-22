import React from 'react';

import general from '../general.module.css';
import styles from './pol.module.css';

// Return the appropriate action button for the pol (e.g., "Flip"), or none
// if no action is applicable or the viewer is not playing.
function actionButtons(props) {
  const gs = props.gs;
  const self = gs.pols[props.index];
  const stage = gs.provs[gs.activeProvId].stage;
  const callback = props.callback;

  const buttons = [];
  if (gs.pov < 0 || gs.parties[gs.pov].ready) {
    return null;
  }

  if (gs.parties[gs.pov].symps.includes(props.index)) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('flip', props.index)}>
        Flip
      </button>
    );
  }
  if (self.hasOwnProperty('oldPartyIndex')) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('unflip', props.index)}>
        Unflip
      </button>
    );
  }

  if (stage == 0
      && self.party === gs.pov
      && self.runnable) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('run', props.index)}>
        Run
      </button>
    );
  }
  if (stage == 0
      && self.party === gs.pov
      && gs.provs[gs.activeProvId].candidates.includes(props.index)) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('unrun', props.index)}>
        Unrun
      </button>
    );
  }

  if (gs.provs[gs.activeProvId].candidates.includes(props.index)
      && stage == 1
      && self.party === gs.pov
      && !self.funded) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('fund', props.index)}>
        Fund
      </button>
    );
  }
  if (gs.provs[gs.activeProvId].candidates.includes(props.index)
      && stage == 1
      && self.party === gs.pov
      && self.funded) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('unfund', props.index)}>
        Unfund
      </button>
    );
  }

  if (gs.provs[gs.activeProvId].officials.includes(props.index)
      && gs.parties[gs.pov].votes > 0
      && stage == 2) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('vote', props.index)}>
        Vote
      </button>
    );
  }
  if (self.votes > 0) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('unvote', props.index)}>
        Unvote
      </button>
    );
  }

  return buttons;
}

function Pol(props) {
  const self = props.gs.pols[props.index];
  /*
  <div>{self.name} ({props.gs.parties[self.party].abbr})</div>
  {actionButtons(props)}
  */
  return (
    <div className={styles.outer}>
        <img className={styles.bgImg}
            src={'/politicians/pol.png'}
            alt={self.name} />
    </div>
  );
}

export default Pol;
