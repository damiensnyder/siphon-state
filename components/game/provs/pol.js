import React from 'react';

import general from '../../general.module.css';
import styles from './pol.module.css';

// Return the appropriate action button for the pol (e.g., "Flip"), or none
// if no action is applicable or the viewer is not playing.
function actionButtons(props) {
  const gs = props.gs;
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
  if (props.self.hasOwnProperty('oldPartyIndex')) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('unflip', props.index)}>
        Unflip
      </button>
    );
  }

  if (stage == 0 && props.self.party === gs.pov) {
    buttons.push(
      <button className={general.actionBtn}
              onClick={e => callback('run', props.index)}>
        Run
      </button>
    );
  }
  if (stage == 0
      && props.self.party === gs.pov
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
      && props.self.party === gs.pov) {
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
  return (
    <div className={styles.outer}>
      <div className={styles.inner}>
        <span class={styles.name + ' ' +
            (props.self.party == props.gs.pov ? styles.ownPol : null)}>
          {props.self.name}
        </span>
        <div class={styles.support}>
          {0}
        </div>
        <div className={styles.actionContainer}>
          {/*actionButtons(props)*/}
        </div>
      </div>
    </div>
  );
}

export default Pol;
