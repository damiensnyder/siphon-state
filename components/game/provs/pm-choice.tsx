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
  if (props.gs.pols[props.gs.primeMinister].party == props.gs.pov) {
    return <h3 className={styles.chooserText}>Choose between:</h3>;
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
  const pmIsOwnParty: boolean = props.gs.stage == 3 &&
      props.gs.pols[props.gs.primeMinister].party == props.gs.pov;
  const chosenTrue: boolean = pmIsOwnParty &&
      props.gs.parties[props.gs.pov].pmChoice;

  let option1: string = "$" + (0.5 * numOtherParties) + "M";
  let option2: string = "+1 support in the next race";
  if (props.gs.decline == 1) {
    option1 = "$" + numOtherParties + "M";
    option2 = "+2 support in the next race and +1 in the race after that";
  } else if (props.gs.decline == 2) {
    option1 = `SUSPEND THE CONSTITUTION: Gain $${3 * numOtherParties}M. ` +
        "Winning the next prime minister wins the game, but failing " +
        "docks all remaining funds and temporarily gives -2 support";
    option2 = "No effects";
  } else if (props.gs.decline > 3) {
    option1 = `SUSPEND THE CONSTITUTION: Gain $${3 * numOtherParties}M and ` +
        `+{props.gs.decline - 2} support. Winning the next prime minister ` +
        "wins the game, but failing docks all remaining funds and " +
        "temporarily gives -2 support";
    option2 = "No effects";
  }

  const hitAddendum: string = ", and calling a hit on a member of the prime " +
      "minister's party costs $2.5M extra";
  const suspenderAddendum: string = " Members of a party that has suspended " +
      "the constitution cannot be targeted at all."

  return (
    <div className={styles.outerWrapper}>
      {chooserText(props)}
      <div className={styles.buttonRow}>
        <button className={styles.optionButton + ' ' +
                general.actionBtn + ' ' +
                (pmIsOwnParty ? '' : general.inactiveBtn2 + ' ') +
                ((chosenTrue) ? styles.chosen : '')}
            onClick={() => props.callback('choose', true)}>
          {option1}
        </button>
        <span>OR</span>
        <button className={styles.optionButton + ' ' +
                general.actionBtn + ' ' +
                (pmIsOwnParty ? '' : general.inactiveBtn2 + ' ') +
                ((pmIsOwnParty && !chosenTrue) ? styles.chosen : '')}
            onClick={() => props.callback('choose', false)}>
          {option2}
        </button>
      </div>
      <div className={styles.addendum}>
        Members of the prime minister's party cannot be bribed
        {props.gs.decline >= 1 ? hitAddendum : ""}.
        {props.gs.decline >= 2 ? suspenderAddendum : ""}
      </div>
    </div>
  );
}

export default PmChoice;
