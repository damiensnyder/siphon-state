import React from "react";

import general from "../general.module.css";
import styles from "./helper-bar.module.css";

interface HelperBarProps {
  gs: any,
  callback: any
}

function helperMsg(props: HelperBarProps): string {
  if (!props.gs.started) {
    return "Click ready when you're ready for the game to start.";
  }
  if (props.gs.ended) {
    return "" + props.gs.parties[props.gs.suspender].name + " wins! Click " +
        "rematch when you're ready to play again.";
  }
  if (props.gs.stage == 0) {
    return "Choose candidates to nominate in each province.";
  }
  if (props.gs.stage == 1) {
    return "Buy ads for your own candidates and smear other candidates to " +
        "help win the race. Rounds remaining: " + (3 - props.gs.rounds);
  }
  if (props.gs.stage == 2) {
    const votesRemaining = props.gs.parties[props.gs.pov].votes;
    let votesRemainingMsg = "";
    if (votesRemaining > 0) {
      votesRemainingMsg = " Votes remaining: " + votesRemaining;
    }
    return "Vote for a candidate to be elected prime minister." +
        votesRemainingMsg;
  }
  if (props.gs.stage == 3) {
    let suspenderMsg = "";
    if (props.gs.decline >= 3) {
      suspenderMsg = " If the prime minister's party also wins the next " +
          "election, they win the game. Otherwise, they lose the game.";
    }
    const primeMinisterPayout = props.gs.parties.length * props.gs.decline / 2;
    return "At the end of this stage, the prime minister's party will " +
        "receive $" + primeMinisterPayout + " and all other parties will " +
        "receive $7.5M." + suspenderMsg;
  }
}

function buttonMsg(props: HelperBarProps) {
  if (props.gs.parties[props.gs.pov].ready) {
    return "Cancel";
  }
  if (!props.gs.started) {
    return "Ready";
  }
  if (props.gs.ended) {
    return "Rematch";
  }
  return "Done";
}

function HelperBar(props: HelperBarProps) {
  return (
    <div className={styles.barWrapper}>
      <span>
        {helperMsg(props)}
      </span>
      <button className={general.actionBtn + ' ' + general.priorityBtn}
          onClick={() => props.callback('ready')}>
        {buttonMsg(props)}
      </button>
    </div>
  );
}

export default HelperBar;
