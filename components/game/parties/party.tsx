import React from 'react';

import Payment from './payment';
import general from '../../general.module.css';
import styles from './parties.module.css';

function ownFundsJsx(amount) {
  return (
    <span className={styles.info}>
      Funds: {"$" + (amount * 100000).toLocaleString()}
    </span>
  );
}

function votesJsx(votes) {
  return (
    <span className={styles.info}>
      Votes: {votes}
    </span>
  );
}

function replaceBtnJsx(props) {
  return (
    <div className={styles.info}>
      <button className={general.actionBtn}
          onClick={() => props.callback('replace', props.index)}>
        Replace
      </button>
    </div>
  );
}

function paymentJsx(props) {
  if (props.gs.pov != props.index && props.gs.pov >= 0) {
    return (
      <Payment index={props.index}
          gs={props.gs}
          callback={props.callback} />
    );
  }
  return null;
}

function Party(props) {
  const self = props.gs.parties[props.index];
  var nameStyle = styles.nameAndAbbr;
  if (props.gs.pov == props.index) {
    nameStyle +=  " " + styles.ownParty;
  } else if (props.gs.priority == props.index) {
    nameStyle +=  " " + styles.priority
  }

  const showReplace = props.gs.pov < 0 && !self.connected;
  const showVotes = (props.gs.activeProv != undefined
      && props.gs.activeProv.stage == 2);
  const showPayment = (props.gs.started
      && !props.gs.ended
      && props.gs.ownParty != undefined
      && !props.gs.ownParty.ready);
  const showFunds = (props.gs.started
      && !props.gs.ended
      && props.gs.pov == props.index);

  return (
    <div className={styles.playerOuter + " " +
        (self.ready ? styles.ready : "")}>
      <div className={nameStyle}>
        <span className={styles.name}>
          {self.name}
        </span>
        <span className={styles.abbr}>
          {self.abbr}
        </span>
      </div>
      {showReplace ? replaceBtnJsx(props) : null}
      {showVotes ? votesJsx(self.votes) : null}
      {showPayment ? paymentJsx(props) : null}
      {showFunds ? ownFundsJsx(self.funds) : null}
    </div>
  );
}

export default Party;
