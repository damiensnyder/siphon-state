import React from 'react';
import Router from 'next/router';

import GameItem from './game-item';
import general from '../general.module.css';
import styles from './menu.module.css';

class JoinMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetched: false,
      error: false,
      games: []
    }

    this.gameCodeInput = React.createRef();
  }

  componentDidMount() {
    this.fetchGames();
  }

  async fetchGames() {
    let res = await fetch('/api/activeGames', {
      method: 'GET'
    });
    const games = await res.json();
    if (res.status == 200) {
      this.setState({
        games: games,
        fetched: true
      });
    } else {
      this.setState({
        error: true,
        fetched: true
      });
    }
  }

  gamesToJsx() {
    if (!this.state.fetched) {
      return <div>Loading...</div>;
    }
    if (this.state.error) {
      return <div>Error fetching games.</div>;
    }
    if (this.state.games.length == 0) {
      return <div>No games found.</div>;
    }

    return this.state.games.map((game) => {
      return <GameItem key={game.gameCode}
                       info={game} />;
    });
  }

  render() {
    return (
      <div className={styles.menuOuter}>
        <div>
          {this.gamesToJsx.bind(this)()}
        </div>
        <input ref={this.gameCodeInput} />
        <button className={general.actionBtn + ' ' + general.priorityBtn}>
          Join
        </button>
      </div>
    );
  }
}

export default JoinMenu;
