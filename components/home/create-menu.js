import React from 'react';
import Router from 'next/router';

import TextInput from '../text-input';
import general from '../general.module.css';
import styles from './main.module.css';

class CreateMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gameCode: ""
    }

    this.nameInput = React.createRef();
    this.gameCodeInput = React.createRef();
  }

  gameCodeCallback(text) {
    this.setState({
      gameCode: text
    });
  }

  async createGame() {
    let res = await fetch('/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        settings: {
          name: this.state.gameCode,
          private: false,
          gameCode: this.state.gameCode
        }
      })
    });

    if (res.status == 200) {
      Router.push('/game/' + this.state.gameCode);
    }
  }

  render() {
    return (
      <div className={styles.menuOuter}>
        <TextInput label={"Game code:"}
                   maxLength={20}
                   text={this.state.gameCode}
                   textCallback={this.gameCodeCallback.bind(this)}
                   submitCallback={this.createGame.bind(this)} />
        <button className={general.actionBtn + ' ' + general.priorityBtn}
                onClick={this.createGame.bind(this)}>
          Create Game
        </button>
      </div>
    );
  }
}

export default CreateMenu;
