import React from 'react';
import Router from 'next/router';

import general from '../general.module.css';
import styles from './main.module.css';

class CreateMenu extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = React.createRef();
  }

  async createGame(gameCode) {
    let res = await fetch('/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({gameCode: gameCode})
    });

    if (res.status === 200) {
      Router.push('/game/' + gameCode);
    } else {
      console.log('failed');
    }
  }

  createHandler() {
    let gameCode = this.textInput.current.value;
    if (!gameCode) gameCode = "boof";
    this.createGame(gameCode);
  }

  render() {
    return (
      <div className={styles.menuOuter}>
        <input ref={this.textInput} />
        <button className={general.actionBtn + ' ' + general.priorityBtn}
                onClick={this.createHandler.bind(this)}>
          Create Game
        </button>
      </div>
    );
  }
}

export default CreateMenu;
