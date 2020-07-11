import React from 'react';

import general from '../../general.module.css';
import styles from './player.module.css';

function activityStyle(props) {
  if (props.gs.turn == props.index) {
    return styles.player + " " + styles.activePlayer;
  } else {
    return styles.player + " " + styles.inactivePlayer;
  }
}

function gsInfo(props) {
  const self = props.gs.parties[props.index];
  return (
    <div>
      {readyIndicator(self)}
      <h4>
        ${self.funds}{numVotes(props)}
      </h4>
      {props.gs.pov >= 0 ? payButton(props) : null}
      {props.gs.pov >= 0 ? unpayButton(props) : null}
      {replaceButton(props)}
    </div>
  );
}

function readyIndicator(self) {
  return (
    <h4>
      Ready: {self.ready ? '✓' : '╳'}
    </h4>
  );
}

function numVotes(props) {
  if (props.gs.provs[props.gs.activeProvId].stage == 2) {
    return `, ${props.gs.parties[props.index].votes} votes`;
  }
  return null;
}

function replaceButton(props) {
  const self = props.gs.parties[props.index];
  if (props.gs.pov < 0 && !self.connected && !props.gs.ended) {
    return (
      <button className={general.actionBtn}
          onClick={e => props.callback('replace', props.index)}>
        Replace
      </button>
    );
  }
  return null;
}

function payButton(props) {
  if (props.gs.parties[props.gs.pov].funds >= 1
      && !props.gs.parties[props.gs.pov].ready
      && props.gs.started
      && !props.gs.ended) {
    return (
      <button className={general.actionBtn}
              onClick={e => props.callback('pay', props.index)}>
        Pay $1
      </button>
    );
  }
  return null;
}

function unpayButton(props) {
  if (props.gs.parties[props.index].paid > 0
      && !props.gs.parties[props.gs.pov].ready) {
    return (
      <button className={general.actionBtn}
              onClick={e => props.callback('unpay', props.index)}>
        Unpay $1
      </button>
    );
  }
  return null;
}

function OtherPlayer(props) {
  const self = props.gs.parties[props.index];
  return (
    <div className={activityStyle(props)}>
      <h2 className={styles.name + " " + styles.otherName}>
        {self.name}
      </h2>
      <h4 className={styles.abbr + " " + styles.otherName}>
        {self.abbr}
      </h4>
      {gsInfo(props, self)}
    </div>
  );
}

export default OtherPlayer;
