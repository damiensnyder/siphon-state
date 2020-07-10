import React from 'react';
import Router from 'next/router';

import general from '../general.module.css';
import styles from './join-menu.module.css';

function joinGame(gameCode) {
  Router.push('/game/' + gameCode);
}

function statusString(started, ended) {
  if (ended) {
    return "Ended";
  }
  if (started) {
    return "In game";
  }
  return "In lobby";
}

function GameItem(props) {
  const info = props.info;
  return (
    <div className={styles.gameItemOuter}>
      <div className={styles.gameItemInner}>
        <div>
          <div>Name: {info.name}</div>
          <div>Players: {info.players}</div>
          <div>Status: {statusString(info.started, info.ended)}</div>
        </div>
        <button className={general.actionBtn}
                onClick={() => {joinGame(info.gameCode)}}>
          Join
        </button>
      </div>
    </div>
  );
}

export default GameItem;
