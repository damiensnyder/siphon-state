import { useRouter } from 'next/router';
import React from 'react';
import io from 'socket.io-client';
import styles from './[gameCode].module.css';
import Province from '../../components/province';
import OtherPlayer from '../../components/other-player';

const Game = () => {
  const router = useRouter();
  const { gameCode } = router.query;

  return (
    <div id={styles.root}>
      <div id={styles.gameContainer} className={styles.containerLevel2}>
        <Province></Province>
        <Province></Province>
        <Province></Province>
        <Province></Province>
        <Province></Province>
      </div>
      <div id={styles.eventLog} className={styles.containerLevel2}>
      </div>
      <div id={styles.otherPlayers} className={styles.containerLevel2}>
        <OtherPlayer></OtherPlayer>
        <OtherPlayer></OtherPlayer>
        <OtherPlayer></OtherPlayer>
      </div>
      <div id={styles.controlPanel} className={styles.containerLevel2}>
        {gameCode}
      </div>
    </div>
  );
};

export default Game;
