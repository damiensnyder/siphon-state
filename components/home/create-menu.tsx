import React from "react";
import Router from "next/router";

import TextInput from "../text-input";
import SelectInput from "../select-input";
import CheckboxInput from "../checkbox-input";
import general from "../general.module.css";
import styles from "./main.module.css";

const NATIONS: string[] = [
  "Kallavur",
  "Anbridge"
];

class CreateMenu extends React.Component {
  state: {
    name: string,
    nation: string,
    private: boolean
  }

  constructor(props) {
    super(props);

    this.state = {
      name: "",
      nation: NATIONS[0],
      private: true
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
    this.setState({
      nation: option
    });
  }

  privateCallback(isPrivate: boolean): void {
    this.setState({
      private: isPrivate
    });
  }

  async createGame() {
    const settings = {
      name: this.state.name,
      nation: this.state.nation,
      private: this.state.private
    };
    if (this.state.name.length === 0) {
      settings.name = "My Game";
    }

    let res = await fetch('/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({settings: settings})
    });

    const resInfo = await res.json();
    if (res.status === 200) {
      await Router.push('/game/' + resInfo.gameCode);
    }
  }

  render(): React.ReactNode {
    return (
      <div className={styles.menuOuter}>
        <h2>Create Game</h2>
        <TextInput label={'Name:'}
            maxLength={40}
            text={this.state.name}
            placeholder={'My Game'}
            textCallback={this.nameCallback.bind(this)}
            submitCallback={this.createGame.bind(this)} />
        <SelectInput label={'Nation:'}
            options={NATIONS}
            selected={this.state.nation}
            selectCallback={this.nationCallback.bind(this)} />
        <CheckboxInput label={'Private:'}
            checked={this.state.private}
            checkCallback={this.privateCallback.bind(this)} />
        <div className={general.spacer}>
          <button className={general.actionBtn + ' ' + general.priorityBtn}
              onClick={this.createGame.bind(this)}>
            Create
          </button>
        </div>
      </div>
    );
  }
}

export default CreateMenu;
