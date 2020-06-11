import { useRouter } from 'next/router';
import React from 'react';
import io from 'socket.io-client';
import styles from './[gameCode].module.css';
import Province from '../../components/province';
import OtherPlayer from '../../components/other-player';

function chatHandler(msg) {

}

const Game = () => {
  const router = useRouter();
  const { gameCode } = router.query;
  const socket = io.connect('/game/' + gameCode);

  const numPlayers = 4;
  var gameState = {
    provinces: [
      { name: 'texum', isActive: false },
      { name: 'TikManDoo', isActive: false },
      { name: 'Starf', isActive: false },
      { name: '1', isActive: false },
      { name: 'Cancelr', isActive: false }
    ]
  };

  socket.on('update', (newGameState) => {
    gameState = newGameState;
  });

  const provinces = Array(5);
  for (var i = 0; i < 5; i++) {
    provinces[i] = (
      <Province gameState={gameState} index={i} key={i}></Province>
    );
  }

  const otherPlayers = Array(numPlayers - 1);
  for (var i = 0; i < numPlayers - 1; i++) {
    otherPlayers[i] = (
      <OtherPlayer gameState={gameState} index={i} key={i}></OtherPlayer>
    );
  }

  return (
    <div id={styles.root}>
      <div id={styles.gameContainer} className={styles.containerLevel2}>
        {provinces}
      </div>
      <Chat handler={chatHandler} />
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
