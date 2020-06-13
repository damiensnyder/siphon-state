import React from 'react';
import io from 'socket.io-client';
import styles from './players-sidebar.module.css';
import OtherPlayer from './other-player';

class PlayersSidebar extends React.Component {
  constructor(props) {
    super(props);
  }

  // Converts the array of other players in the game to an array of JSX objects.
  otherPlayersToJsx() {
    const otherPlayersJsx = [];
    for (var i = 0; i < this.props.gs.players.length; i++) {
      if (i !== this.props.gs.pov) {
        otherPlayersJsx.push(
          <OtherPlayer gs={this.props.gs}
                       index={i}
                       key={i} />
        );
      }
    }
    return otherPlayersJsx;
  }

  render() {
    const noOtherPlayers = this.props.gs.players.length === 0 ||
                           (this.props.gs.pov === 0 &&
                            this.props.gs.players.length === 1);
    const noPlayersSidebar = (
      <div id={styles.noPlayersWrapper}>
        <div>No other players have joined yet. Be the first!</div>
      </div>
    );
    return noOtherPlayers ? noPlayersSidebar : this.otherPlayersToJsx();
  }
}

export default PlayersSidebar;
