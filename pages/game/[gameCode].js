import {useRouter} from 'next/router';
import React from 'react';
import GameView from '../../components/game/main';

// Getting the query information is ridiculous outside of a function component,
// but far too much needs to happen to make sense outside of a class component,
// so this just gets the game code from the router query and passes it on to a
// class component.
function Game() {
  const router = useRouter();
  const {gameCode} = router.query;
  return (<GameView gameCode={gameCode} />);
}

export default Game;
