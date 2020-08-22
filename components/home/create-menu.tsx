import React from 'react';
import Router from 'next/router';

import TextInput from '../text-input';
import general from '../general.module.css';
import styles from './main.module.css';
import SelectInput from "../select-input";

const NATIONS: string[] = [
  "Kallavur",
  "Anbridge"
];

class CreateMenu extends React.Component {
  state: {
    name: string
  }

  constructor(props) {
    super(props);

    this.state = {
      name: ""
    }
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

  nationCallback(option: string): void {

  }

  privateCallback(isPrivate: boolean): void {

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
      if (res.status === 200) {
        await Router.push('/game/' + resInfo.gameCode);
      }
    }
  }

  render(): React.ReactNode {
    return (
      <div className={styles.menuOuter}>
        <h2>Create Game</h2>
        <TextInput label={"Name:"}
            maxLength={40}
            text={this.state.name}
            textCallback={this.nameCallback.bind(this)}
            submitCallback={this.createGame.bind(this)} />
        <SelectInput label={"Nation:"}
            options={NATIONS}
            selected={NATIONS[0]}
            selectCallback={this.nationCallback.bind(this)} />
        <div className={general.spacer}>
          <button className={general.actionBtn + " " + general.priorityBtn}
              onClick={this.createGame.bind(this)}>
            Create
          </button>
        </div>
      </div>
    );
  }
}

export default CreateMenu;
