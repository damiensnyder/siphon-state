import React from 'react';
import Router from 'next/router';

import TextInput from '../text-input';
import general from '../general.module.css';
import styles from './main.module.css';

class CreateMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: ""
    }

    this.nameInput = React.createRef();
    this.nameInput = React.createRef();
  }

  componentWillUnmount() {
    this.setState({
      name: ""
    });
  }

  nameCallback(text) {
    this.setState({
      name: text
    });
  }

  async createGame() {
    if (this.state.name.length > 0) {
      let res = await fetch('/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          settings: {
            name: this.state.name,
            private: false
          }
        })
      });

      const resInfo = await res.json();
      if (res.status == 200) {
        Router.push('/game/' + resInfo.gameCode);
      }
    }
  }

  render() {
    return (
      <div className={styles.menuOuter}>
        <TextInput label={"Name:"}
                   maxLength={40}
                   text={this.state.name}
                   textCallback={this.nameCallback.bind(this)}
                   submitCallback={this.createGame.bind(this)} />
        <div className={general.spacer}>
          <button className={general.actionBtn + ' ' + general.priorityBtn}
                  onClick={this.createGame.bind(this)}>
            Create Game
          </button>
        </div>
      </div>
    );
  }
}

export default CreateMenu;
