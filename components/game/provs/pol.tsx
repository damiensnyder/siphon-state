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
  const ownParty = props.gs.parties[props.gs.pov];

  // Return nothing if the viewer is not playing
  if (props.gs.pov == undefined || ownParty.ready) {
    return null;
  }

  const isCandidate: boolean = props.gs.provs[props.provIndex]
      .candidates.includes(props.polIndex);
  const buttons = [];
  const runInfo = {
    polIndex: props.polIndex,
    provIndex: props.provIndex
  }

  // If they can be nominated, add "Run" button
  if (props.pol.party === props.gs.pov && 
      props.gs.stage === 0 &&
      ownParty.funds >= 5 &&
      ownParty.pols.includes(props.polIndex)) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('run', runInfo)}>
        Run: $500k
      </button>
    );
  }

  // If they are currently nominated, add "Undo" button
  if (props.pol.party === props.gs.pov && 
      props.gs.stage === 0 &&
      isCandidate) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('unrun', runInfo)}>
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
          onClick={() => props.callback('vote', props.polIndex)}>
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
          onClick={() => props.callback('unvote', props.polIndex)}>
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
                onClick={() => props.callback('ad', props.polIndex)}>
              Buy ad
            </button>
          );
        } else {
          buttons.push(
            <button className={general.actionBtn}
                onClick={() => props.callback('ad', props.polIndex)}>
              Buy ad: {formatMoneyString(3 + props.gs.rounds)}
            </button>
          );
        }
      }
      if (props.pol.adsBought > 0) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('unad', props.polIndex)}>
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
  if (ownParty.bribed != undefined &&
      ownParty.bribed.includes(props.polIndex)) {
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
  if (ownParty.sympathetic != undefined &&
      ownParty.sympathetic.includes(props.polIndex) &&
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
  let nameStyle: string = styles.name;
  const ownParty = props.gs.parties[props.gs.pov];

  if (props.pol.party === props.gs.pov) {
    nameStyle += " " + styles.ownPol;
  } else if (ownParty != undefined && ownParty.bribed != undefined) {
    if (ownParty.bribed.includes(props.polIndex)) {
      nameStyle += " " + styles.bribed;
    }
    if (ownParty.sympathetic.includes(props.polIndex) &&
        !props.pol.flipped) {
      nameStyle += " " + styles.sympathetic;
    }
  }

  return nameStyle;
}

function Pol(props) {
  const imageUrl: string = "url('/politicians/" + props.pol.url + ".png')";
  const polParty = props.gs.parties[props.pol.party];

  return (
    <div className={styles.polWrapper}>
      <div className={styles.cardOuter}
          style={{backgroundImage: imageUrl}}>
        <div className={styles.darkenOnHover} />
        <div className={styles.spacer} />
        <span className={styles.partyAbbr + ' ' +
            (props.pol.party == props.gs.pov ? styles.ownPol : '')}>
          {polParty.abbr}
        </span>
        <span className={nameStyle(props)}>
          {props.pol.name}
        </span>
        {bubbleJsx(props)}
      </div>
      {buttonsJsx(props)}
    </div>
  );
}

export default Pol;
