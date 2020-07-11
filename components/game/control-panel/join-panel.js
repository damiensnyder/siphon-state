import React from 'react';

import TextInput from '../../text-input';
import InviteLink from './invite-link';
import general from '../../general.module.css';
import styles from './join-panel.module.css';

class JoinPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      partyName: "",
      abbr: "",
      abbrPlaceholder: ""
    }

    this.partyAbbr = React.createRef();
    this.updateAbbr = this.updateAbbr.bind(this);
    this.updatePartyName = this.updatePartyName.bind(this);
    this.joinGame = this.joinGame.bind(this);
  }

  updatePartyName(text) {
    this.setState({
      partyName: text,
      abbrPlaceholder: text.trim().substring(0, 4).toUpperCase()
    });
  }

  updateAbbr(text) {
    this.setState({
      abbr: text
    });
  }

  joinGame() {
    const abbr = this.state.abbr === "" ?
        this.state.abbrPlaceholder :
        this.state.abbr;

    this.props.callback('join', {
      name: this.state.partyName,
      abbr: abbr
    });
  }

  render() {
    return (
      <div className={general.outerWrapper + ' ' + general.horizWrapper}>
        <div className={general.menu}>
          <TextInput label={"Party name:"}
                     maxLength={40}
                     text={this.state.partyName}
                     textCallback={this.updatePartyName}
                     submitCallback={this.joinGame} />
          <TextInput label={"Abbreviation:"}
                     maxLength={4}
                     text={this.state.abbr}
                     placeholder={this.state.abbrPlaceholder}
                     textCallback={this.updateAbbr}
                     submitCallback={this.joinGame} />
          <div className={general.spacer}>
            <button className={general.actionBtn + ' ' + general.priorityBtn}
                    onClick={this.joinGame}>
              Join Game
            </button>
          </div>
        </div>
        <div id={styles.orDiv}>or</div>
        <div className={general.menu}>
          <div className={general.spacer}>
            <InviteLink gameCode={this.props.gameCode} />
          </div>
          <span id={styles.inviteFriend}>invite a friend</span>
        </div>
      </div>
    );
  }
}

export default JoinPanel;
