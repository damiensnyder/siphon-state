import { useRouter } from 'next/router';
import React from 'react';
import io from 'socket.io-client';
import styles from './[gameCode].module.css';
import Province from '../../components/province';
import OtherPlayer from '../../components/other-player';

const Game = () => {
  const router = useRouter();
  const { gameCode } = router.query;

  const numPlayers = 4;
  const gameState = {
    activeProvince: 2
  };

  const provinces = Array(5);
  for (var i = 0; i < 5; i++) {
    provinces[i] = (<Province gameState={gameState} index={i}></Province>);
  }

  const otherPlayers = Array(numPlayers - 1);
  for (var i = 0; i < numPlayers - 1; i++) {
    otherPlayers[i] = (<OtherPlayer index={i}></OtherPlayer>);
  }

  return (
    <div id={styles.root}>
      <div id={styles.gameContainer} className={styles.containerLevel2}>
        {provinces}
      </div>
      <div id={styles.eventLog} className={styles.containerLevel2}>
      </div>
      <div id={styles.otherPlayers} className={styles.containerLevel2}>
        {otherPlayers}
      </div>
      <div id={styles.controlPanel} className={styles.containerLevel2}>
        {gameCode}
      </div>
    </div>
  );
};

export default Game;
