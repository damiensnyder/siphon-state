import React from "react";

import Payment from "./payment";
import general from "../../general.module.css";
import styles from "./parties.module.css";

interface PartyProps {
  gs: any,
  index: number,
  callback: any
}

function ownFundsJsx(amount: number) {
  return (
    <span className={styles.funds}>
      Funds: {"$" + (amount * 100000).toLocaleString()}
    </span>
  );
}

function votesJsx(votes: number) {
  return (
    <span className={styles.funds}>
      Votes: {votes}
    </span>
  );
}

function replaceBtnJsx(props: PartyProps) {
  return (
    <div className={styles.funds}>
      <button className={general.actionBtn}
          onClick={() => props.callback('replace', props.index)}>
        Replace
      </button>
    </div>
  );
}

function paymentJsx(props: PartyProps) {
  if (props.gs.pov != props.index && props.gs.pov >= 0) {
    return (
      <Payment index={props.index}
          gs={props.gs}
          ownParty={props.gs.parties[props.gs.pov]}
          callback={props.callback} />
    );
  }
  return null;
}

function Party(props: PartyProps) {
  const self = props.gs.parties[props.index];
  let nameStyle: string = styles.partyInfo;
  if (props.gs.pov == props.index) {
    nameStyle += " " + styles.ownParty;
  } else if (props.gs.priority == props.index) {
    nameStyle += " " + styles.priority;
  }

  const showReplace: boolean = props.gs.pov === undefined && !self.connected;
  const showVotes: boolean = props.gs.stage == 2;
  const showPayment: boolean = props.gs.started &&
      !props.gs.ended &&
      props.gs.pov !== undefined &&
      !props.gs.parties[props.gs.pov].ready;
  const showFunds: boolean = props.gs.started &&
      !props.gs.ended &&
      props.gs.pov === props.index;

  return (
    <div className={styles.partyOuter + " " +
        (self.ready ? styles.ready : "")}>
      <div className={nameStyle}>
        <span className={styles.partyName}>
          {self.name}
        </span>
        <div className={styles.abbrAndVotes}>
          <span className={styles.partyAbbr}>{self.abbr}</span>
          <span className={styles.votes}>
            {showVotes ? votesJsx(self.votes) : null}
          </span>
        </div>
      </div>
      {showReplace ? replaceBtnJsx(props) : null}
      {showPayment ? paymentJsx(props) : null}
      {showFunds ? ownFundsJsx(self.funds) : null}
    </div>
  );
}

export default Party;
