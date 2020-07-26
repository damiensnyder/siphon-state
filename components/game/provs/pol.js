import React from 'react';

import general from '../../general.module.css';
import styles from './pol.module.css';

function formatMoneyString(amount) {
  if (amount >= 10) {
    return "$" + (amount / 10) + "M";
  } else {
    return "$" + (amount * 100) + "k";
  }
}

function bigNumberJsx(props) {
  if (props.gs.activeProv.candidates.includes(props.self)
      && props.gs.activeProv.stage == 1) {
    // If candidate in race, return support (rounded to nearest integer)
    return (
      <div className={styles.bigNumber}>
        {Math.round(props.self.support)}
      </div>
    );
  }

  if (props.gs.activeProv.officials.includes(props.self)
      && props.gs.activeProv.stage == 2) {
    // If official in active province, return votes
    return <div className={styles.bigNumber}>{props.self.votes}</div>;
  }

  for (let i = 0; i < props.gs.provs.length; i++) {
    if (props.gs.provs[i].governor != undefined
        && props.gs.provs[i].governor.id == props.self.id) {
      // If governor, return a star
      return <div className={styles.bigNumber}>★</div>;
    }
  }

  return null;
}

function buttonsJsx(props) {
  if (props.gs.ownParty == undefined) {
    // Return nothing if the viewer is not playing
    return null;
  }

  const buttons = [];

  // If they can be nominated, add "Nominate" button
  if (props.self.party == props.gs.pov
      && props.gs.activeProv.stage == 0
      && props.gs.ownParty.candidates.includes(props.self)
      && !props.gs.activeProv.candidates.includes(props.self)
      && props.gs.activeProv.candidates.length < 3) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('run', props.self)}>
        Nominate
      </button>
    );
  }

  // If they are currently nominated, add "Undo" button
  if (props.self.party == props.gs.pov
      && props.gs.activeProv.stage == 0
      && props.gs.activeProv.candidates.includes(props.self)) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('unrun', props.self)}>
        Undo
      </button>
    );
  }

  // If they are an active official, add "Vote" button
  if (props.self.party == props.gs.pov
      && props.gs.activeProv.stage == 2
      && props.gs.activeProv.officials.includes(props.self)
      && props.gs.ownParty.votes > 0) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('vote', props.index)}>
        Vote
      </button>
    );
  }

  // If they have votes, add "Undo" button
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

  // If their ID matches a bribed politician's ID, add a flip button or an undo
  // button depending on whether they have already been flipped.
  for (let i = 0; i < props.gs.ownParty.bribed.length; i++) {
    if (props.gs.ownParty.bribed[i].id == props.self.id) {
      const targetIndex = i;
      if (props.self.party != props.gs.pov) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('flip', targetIndex)}>
            Flip
          </button>
        );
      } else {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('unflip', targetIndex)}>
            Undo
          </button>
        );
      }
    }
  }

  if (props.gs.ownParty.symps.length > 0
      && props.gs.ownParty.symps[0].id == props.self.id) {
    if (props.gs.ownParty.symps[0].flipped) {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('unbribe')}>
          Undo
        </button>
      );
    } else {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('bribe')}>
          Bribe: {formatMoneyString(5 * (3 + props.gs.rounds))}
        </button>
      );
    }
  }

  if (buttons.length > 0) {
    return (
      <div className={styles.btnRow}>
        {buttons}
      </div>
    );
  }
  return null;
}

function nameStyle(props) {
  var nameStyle = styles.name;
  if (props.self.party == props.gs.pov) {
    nameStyle += " " + styles.ownPol;
  } else if (props.gs.ownParty != undefined) {
    for (let i = 0; i < props.gs.ownParty.bribed.length; i++) {
      if (props.gs.ownParty.bribed[i].id == props.self.id) {
        nameStyle += " " + styles.bribed;
      }
    }
    if (props.gs.ownParty.symps[0].id == props.self.id
        && !props.gs.ownParty.symps[0].flipped) {
      nameStyle += " " + styles.symp;
    }
  }

  return nameStyle;
}

function Pol(props) {
  const imageUrl = "url('/politicians/" + props.self.url + ".png')";

  return (
    <div className={styles.polWrapper}>
      <div className={styles.cardOuter}
          style={{backgroundImage: imageUrl}}>
        <div className={styles.darkenOnHover} />
        <div className={styles.spacer} />
        <span className={styles.partyAbbr + ' ' +
            (props.self.party == props.gs.pov ? styles.ownPol : '')}>
          {props.gs.parties[props.self.party].abbr}
        </span>
        <span className={nameStyle(props)}>
          {props.self.name}
        </span>
        {bigNumberJsx(props)}
      </div>
      {buttonsJsx(props)}
    </div>
  );
}

export default Pol;
