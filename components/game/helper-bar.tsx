import React from "react";

import general from "../general.module.css";
import styles from "./helper-bar.module.css";

interface HelperBarProps {
  gs: any,
  callback: any
}

function startMsg(props: HelperBarProps) {
  if (!props.gs.started) {
    return "Click ready when you're ready for the game to start.";
  }
  if (props.gs.activeProv.stage == 0) {
    return "Choose 3 candidates to nominate. (" +
        (props.gs.activeProv.candidates.length) + "/3)";
  }
  if (props.gs.provs[props.gs.activeProvId].stage == 1) {
    return "Buy ads for your own candidates and smear other candidates to " +
        "help win the race.";
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
        {startMsg(props)}
      </span>
      <button className={general.actionBtn + ' ' + general.priorityBtn}
          onClick={() => props.callback('ready')}>
        {buttonMsg(props)}
      </button>
    </div>
  );
}

export default HelperBar;
