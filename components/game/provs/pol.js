import React from 'react';

import general from '../../general.module.css';
import styles from './pol.module.css';

function bigNumberJsx(props) {
  if (props.gs.activeProv.candidates.includes(props.self)
      && props.gs.activeProv.stage == 1) {
    // If candidate in race, return support (rounded to nearest integer)
    return (
      <div className={styles.bigNumber}>
        {Math.round(props.self.support)}
      </div>
    );
  } else if (props.gs.activeProv.officials.includes(props.self)
      && props.gs.activeProv.stage == 2) {
    // If official in active province, return votes
    return <div className={styles.bigNumber}>{props.self.votes}</div>;
  } else if (props.gs.activeProv.governor == props.self) {
    // If governor, return a star
    return <div className={styles.bigNumber}>★</div>;
  }
  return null;
}

function buttonsJsx(props) {
  if (props.gs.ownParty == undefined) {
    // Return nothing if the viewer is not playing
    return null;
  }

  const buttons = [];

  if (props.self.party == props.gs.pov
      && props.gs.activeProv.stage == 0
      && props.gs.ownParty.candidates.includes(props.self)
      && !props.gs.activeProv.candidates.includes(props.self)
      && props.gs.activeProv.candidates.length < 3) {
    // If they can be nominated, return "Nominate" button
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('run', props.self)}>
        Nominate
      </button>
    );
  }
  if (props.self.party == props.gs.pov
      && props.gs.activeProv.stage == 0
      && props.gs.activeProv.candidates.includes(props.self)) {
    // If they are currently nominated, return "Undo" button
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('unrun', props.self)}>
        Undo
      </button>
    );
  }
  if (props.self.party == props.gs.pov
      && props.gs.activeProv.stage == 2
      && props.gs.activeProv.officials.includes(props.self)
      && props.gs.ownParty.votes > 0) {
    // If they are an active official, "Vote" button
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('vote', props.index)}>
        Vote
      </button>
    );
  }
  if (props.self.party == props.gs.pov
      && props.gs.activeProv.stage == 2
      && props.gs.activeProv.officials.includes(props.self)
      && props.self.votes > 0) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('unvote', props.index)}>
        Undo
      </button>
    );
  }

  if (props.gs.ownParty.bribed.includes(self)) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('flip', props.self)}>
        Flip
      </button>
    );
  }

  return (
    <div className={styles.btnRow}>
      {buttons}
    </div>
  );
}

function Pol(props) {
  const imageUrl = "url('/politicians/" + (props.self.id % 2) + ".png')";
  return (
    <div className={styles.polWrapper}>
      <div className={styles.cardOuter}
          style={{backgroundImage: imageUrl}}>
        <div className={styles.darkenOnHover} />
        <div className={styles.spacer} />
        <span className={styles.name + ' ' +
            (props.self.party == props.gs.pov ? styles.ownPol : null)}>
          {props.self.name}
        </span>
        {bigNumberJsx(props)}
      </div>
      {buttonsJsx(props)}
    </div>
  );
}

export default Pol;
