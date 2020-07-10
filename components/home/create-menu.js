import React from 'react';
import Router from 'next/router';

import general from '../general.module.css';
import styles from './main.module.css';

class CreateMenu extends React.Component {
  constructor(props) {
    super(props);

    this.nameInput = React.createRef();
    this.gameCodeInput = React.createRef();
  }

  async createGame(settings) {
    let res = await fetch('/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({settings: settings})
    });

    if (res.status == 200) {
      Router.push('/game/' + settings.gameCode);
    }
  }

  createHandler() {
    const settings = {
      name: this.gameCodeInput.current.value,
      private: false,
      gameCode: this.gameCodeInput.current.value
    };
    this.createGame(settings);
  }

  render() {
    return (
      <div className={styles.menuOuter}>
        <div className={general.sameLine}>
          Game code: <input ref={this.gameCodeInput} />
        </div>
        <button className={general.actionBtn + ' ' + general.priorityBtn}
                onClick={this.createHandler.bind(this)}>
          Create Game
        </button>
      </div>
    );
  }
}

export default CreateMenu;
