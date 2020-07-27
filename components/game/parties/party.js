import React from 'react';

import Payment from './payment';
import general from '../../general.module.css';
import styles from './parties.module.css';

function ownFundsJsx(amount) {
  return <span>{"$" + (amount * 100000).toLocaleString()}</span>;
}

function votesJsx(votes) {
  return <span>Votes: {self.votes}</span>;
}

function infoJsx(props) {
  const self = props.gs.parties[props.index];

  if (props.gs.pov < 0 && !self.connected) {
    return (
      <div className={styles.controlsAndInfo}>
        <button className={general.actionBtn}
            onClick={() => props.callback('replace', props.index)}>
          Replace
        </button>
      </div>
    );
  }

  const infoJsx = []

  if (props.gs.started) {
    if (props.gs.pov == props.index) {
      infoJsx.push(ownFundsJsx(self.funds));
    }
    if (props.gs.activeProv != undefined
        && props.gs.activeProv.stage == 2) {
      infoJsx.push(votesJsx(self.votes));
    }
  }

  if (infoJsx.length == 0) {
    return null;
  }
  
  return (
    <div className={styles.controlsAndInfo}>
      {infoJsx}
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
      <div className={styles.paymentOuter}>
        {paymentJsx(props)}
      </div>
      {infoJsx(props)}
    </div>
  );
}

export default Party;
