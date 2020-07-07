import React from 'react';

import general from '../general.module.css';
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
      {buyButton(props)}
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

function buyButton(props) {
  const self = props.gs.parties[props.index];
  if (self.funds >= 5 && props.gs.started && !props.gs.ended) {
    return (
      <button className={general.actionBtn}
              onClick={e => props.callback('buy', {})}>
        Buy symp ($5)
      </button>
    );
  }
  return null;
}

function OwnPlayer(props) {
  const self = props.gs.parties[props.index];
  return (
    <div className={activityStyle(props)}>
      <h2 className={styles.name + " " + styles.ownName}>
        {self.name}
      </h2>
      <h4 className={styles.abbr + " " + styles.ownName}>
        {self.abbr}
      </h4>
      {gsInfo(props)}
    </div>
  );
}

export default OwnPlayer;
