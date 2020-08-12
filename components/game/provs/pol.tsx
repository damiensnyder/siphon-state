import React from "react";

import general from "../../general.module.css";
import styles from "./pol.module.css";

function formatMoneyString(amount) {
  if (amount >= 10) {
    return "$" + (amount / 10) + "M";
  } else {
    return "$" + (amount * 100) + "k";
  }
}

function bubbleJsx(props) {
  const bubbleStyle = styles.bubble + " " +
      (props.pol.support <= -1 ? styles.negativeSupport : "");
  
  let bubbleInfo: string | number;
  if (props.gs.primeMinister === props.polIndex) {
    bubbleInfo = "★";
  } else if (props.gs.stage === 0) {
    bubbleInfo = props.pol.baseSupport;
  } else {
    bubbleInfo = Math.round(props.pol.support);
  }

  return <div className={bubbleStyle}>{bubbleInfo}</div>;
}

function buttonsJsx(props) {
  // Return nothing if the viewer is not playing
  if (props.gs.pov === undefined) {
    return null;
  }

  const isCandidate: boolean = props.gs.provs[props.provIndex]
      .candidates.includes(props.polIndex);
  const ownParty = props.gs.parties[props.gs.pov];
  const buttons = [];

  // If they can be nominated, add "Nominate" button
  if (props.pol.party === props.gs.pov && 
      props.gs.stage === 0 &&
      props.gs.parties[props.gs.pov].pols.includes(props.pol)) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('run', props.polIndex)}>
        Nominate
      </button>
    );
  }

  // If they are currently nominated, add "Undo" button
  if (props.pol.party === props.gs.pov && 
      props.gs.stage === 0 &&
      isCandidate) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('unrun', props.pol)}>
        Undo
      </button>
    );
  }

  // If they are an active official, add "Vote" button
  if (props.gs.stage === 2 && 
      props.gs.officials.includes(props.polIndex) &&
      props.gs.parties[props.gs.pov].votes > 0) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('vote', props.index)}>
        Vote
      </button>
    );
  }

  // If they have votes, add "Undo" button
  if (props.pol.party === props.gs.pov && 
      props.gs.stage === 2 &&
      props.gs.officials.includes(props.polIndex) &&
      props.pol.support >= 1) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('unvote', props.index)}>
        Undo
      </button>
    );
  }

  if (props.gs.stage === 1 && isCandidate) {
    if (props.pol.party === props.gs.pov) {
      if (ownParty.funds >= 3 + props.gs.rounds) {
        if (props.pol.hasOwnProperty('adsBought')) {
          buttons.push(
            <button className={general.actionBtn}
                onClick={() => props.callback('ad', props.index)}>
              Buy ad
            </button>
          );
        } else {
          buttons.push(
            <button className={general.actionBtn}
                onClick={() => props.callback('ad', props.index)}>
              Buy ad: {formatMoneyString(3 + props.gs.rounds)}
            </button>
          );
        }
      }
      if (props.pol.adsBought > 0) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('unad', props.index)}>
            Undo
          </button>
        );
      }
    } else {
      if (ownParty.funds >= 2 + props.gs.rounds) {
        if (props.pol.hasOwnProperty('adsBought')) {
          buttons.push(
            <button className={general.actionBtn}
                onClick={() => props.callback('smear', props.polIndex)}>
              Smear
            </button>
          );
        } else {
          buttons.push(
            <button className={general.actionBtn}
                onClick={() => props.callback('smear', props.polIndex)}>
              Smear: {formatMoneyString(2 + props.gs.rounds)}
            </button>
          );
        }
      }
      if (props.pol.adsBought > 0) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('unsmear', props.polIndex)}>
            Undo
          </button>
        );
      }
    }
  }

  // If they have been bribed, add a "Flip" button or an "Undo" button depending
  // on whether they have already been flipped.
  if (ownParty.bribed.includes(props.polIndex)) {
    if (props.pol.party !== props.gs.pov) {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('flip',
                {polIndex: props.polIndex})}>
          Flip
        </button>
      );
    } else {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('unflip',
                {polIndex: props.polIndex})}>
          Undo
        </button>
      );
    }
  }

  // If they are sympathetic, add a "Bribe" or "Undo" button depending on
  // whether they've been flipped.
  if (ownParty.sympathetic.includes(props.polIndex) && 
      props.pol.party !== props.gs.pov) {
    if (props.pol.flipped) {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('unbribe')}>
          Undo
        </button>
      );
    } else if (ownParty.funds >= 10 * (2 + props.gs.rounds)) {
      if (props.pol.hasOwnProperty('flipped')) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('bribe')}>
            Bribe
          </button>
        );
      } else {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('bribe')}>
            Bribe: {formatMoneyString(10 * (2 + props.gs.rounds))}
          </button>
        );
      }
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
  let nameStyle = styles.name;
  if (props.pol.party == props.gs.pov) {
    nameStyle += " " + styles.ownPol;
  } else if (props.gs.pov !== undefined) {
    for (let i = 0; i < props.gs.ownParty.bribed.length; i++) {
      if (props.gs.ownParty.bribed[i].id == props.pol.id) {
        nameStyle += " " + styles.bribed;
      }
    }
    if (props.gs.ownParty.symps.length > 0 && 
        props.gs.ownParty.symps[0].id == props.pol.id && 
        !props.gs.ownParty.symps[0].flipped) {
      nameStyle += " " + styles.symp;
    }
  }

  return nameStyle;
}

function Pol(props) {
  const imageUrl: string = "url('/politicians/" + props.pol.url + ".png')";

  return (
    <div className={styles.polWrapper}>
      <div className={styles.cardOuter}
          style={{backgroundImage: imageUrl}}>
        <div className={styles.darkenOnHover} />
        <div className={styles.spacer} />
        <span className={styles.partyAbbr + ' ' +
            (props.pol.party == props.gs.pov ? styles.ownPol : '')}>
          {props.gs.parties[props.pol.party].abbr}
        </span>
        <span className={nameStyle(props)}>
          {props.pol.name}
        </span>
        {bubbleJsx(props)}
      </div>
      {props.gs.parties[props.gs.pov].ready ? null : buttonsJsx(props)}
    </div>
  );
}

export default Pol;
