import React from 'react';
import Router from 'next/router';

import general from '../general.module.css';

function joinGame(gameCode) {
  Router.push('/game/' + gameCode);
}

function GameItem(props) {
  return (
    <div>
      {props.info.name}
      <button className={general.actionBtn + ' ' + general.priorityBtn}
              onClick={() => {joinGame(props.info.gameCode)}}>
        Join
      </button>
    </div>
  );
}

export default GameItem;
