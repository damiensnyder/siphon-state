import React from "react";

import general from "../../general.module.css";
import styles from "./pm-choice.module.css";

function chooserText(props): React.ReactElement {
  if (props.gs.stage == 2) {
    return (
      <h3 className={styles.chooserText}>
        The party that controls the prime minister will choose between:
      </h3>
    );
  }
  if (props.gs.primeMinister == null ||
      props.gs.pols[props.gs.primeMinister].party == props.gs.pov) {
    return null;
  }

  return (
    <h3 className={styles.chooserText}>
      {props.gs.parties[props.gs.pols[props.gs.primeMinister].party].name} is
      choosing between:
    </h3>
  );
}

function PmChoice(props): React.ReactElement {
  const numOtherParties: number = props.gs.parties.length - 1;

  let option1: string = "Gain $" + (0.5 * numOtherParties) + "M";
  let option2: string = "Your politicians get +1 support in the next race";
  if (props.gs.decline == 1) {
    option1 = "Gain $" + numOtherParties + "M";
    option2 = "Get +2 support in the next race and +1 in the race after that";
  } else if (props.gs.decline == 2) {
    option1 = "SUSPEND THE CONSTITUTION: Gain $" + (3 * numOtherParties) +
        "M. If you win the next prime minister, you win the game, but if " +
        "you fail, you lose all your funds and get -2 support temporarily";
    option2 = "No effects";
  } else if (props.gs.decline > 3) {
    option1 = `SUSPEND THE CONSTITUTION: Gain $${3 * numOtherParties}M and ` +
        `get ${props.gs.decline - 2} support. If you win the next prime ` +
        "minister, you win the game, but if you fail, you lose all your " +
        "funds and get -2 support";
    option2 = "No effects";
  }

  return (
    <div className={styles.outerWrapper}>
      {chooserText(props)}
      <div className={styles.buttonRow}>
        <button className={styles.optionButton + ' ' +
            (props.gs.decline >= 2 ? styles.suspend + ' ' : '') +
            general.actionBtn}
            onClick={() => props.callback('choose', true)}>
          {option1}
        </button>
        <span>OR</span>
        <button className={styles.optionButton + ' ' +
            general.actionBtn}
            onClick={() => props.callback('choose', false)}>
          {option2}
        </button>
      </div>
    </div>
  );
}

export default PmChoice;
