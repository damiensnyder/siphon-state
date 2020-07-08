import React from 'react';
import {useCallback} from 'react';
import Router from 'next/router';

import style from './main.module.css';

function HomeView() {
  const createGame = useCallback((e) => {
    let gameCode = textInput.current.value;
    console.log(gameCode);
    if (!gameCode) gameCode = "boof";

    fetch('/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({gameCode: gameCode})
    }).then((res) => {
      if (res.status === 200) {
        Router.push('/game/' + gameCode);
      } else {
        console.log('failed');
      }
    });
  }, []);

  const textInput = React.createRef();

  return (
    <div>
      <input ref={textInput} />
      <button onClick={createGame}>
        press to make game
      </button>
    </div>
  );
}

export default HomeView;
