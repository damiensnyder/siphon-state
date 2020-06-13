import React from 'react';
import io from 'socket.io-client';
import styles from './game-view.module.css';
import Province from './province';
import PlayersSidebar from './players-sidebar';
import ControlPanel from './control-panel';
import Chat from './chat';

class GameView extends React.Component {
  constructor(props) {
    super(props);

    this.socket = undefined;
    this.gameCode = '';

    this.state = {
      gs: {
        provinces: [
          { name: '', isActive: false },
          { name: '', isActive: false },
          { name: '', isActive: false },
          { name: '', isActive: false },
          { name: '', isActive: false }
        ],
        players: [],
        pov: -1
      },
      messages: [],
      connected: false
    };

    this.chatHandler = this.chatHandler.bind(this);
    this.joinHandler = this.joinHandler.bind(this);
  }

  componentDidMount() {
    this.waitForGameCode();
  }

  // The game code mysteriously does not load immediately, so this waits for
  // another function that checks until it gets it.
  async waitForGameCode() {
    await this.retryUntilGameCode();
  }

  // Checks every 20 ms until the game code is set by the router.
  retryUntilGameCode() {
    return new Promise((resolve) => {
      var timesChecked = 0;
      var checkForRouter = setInterval(() => {
        if (this.props.gameCode !== undefined) {
          clearInterval(checkForRouter);
          this.gameCode = this.props.gameCode;
          this.initializeSocket();
        }
        timesChecked++;
        if (timesChecked == 250) {
          clearInterval(checkForRouter);
        }
      }, 20);
      resolve(null);
    });
  }

  initializeSocket() {
    this.socket = io.connect('/game/' + this.props.gameCode);
    this.connected = true;

    this.socket.on('connection', () => {
      this.setState({
        connected: true
      });
    });

    this.socket.on('disconnect', () => {
      this.setState({
        connected: false
      });
      this.addMsg({
        sender: 'Client',
        msg: 'You have been disconnected.',
        isSelf: false,
        isSystem: true
      });
    });

    this.socket.on('msg', (msg) => {
      this.addMsg(msg);
    });

    this.socket.on('update', (gs) => {
      this.setState({
        gs: gs
      });
    });
  }

  // Converts the array of provinces in the game to an array of JSX objects.
  provincesToJsx() {
    const provincesJsx = [];
    for (var i = 0; i < this.state.gs.provinces.length; i++) {
      provincesJsx.push(
        <Province gs={this.state.gs}
                  index={i}
                  key={i} />
      );
    }
    return provincesJsx;
  }

  // Passed to the control panel and called when the player joins the game.
  // Sends the player's info to the server and shows a system chat message to
  // the player.
  joinHandler(partyInfo) {
    this.addMsg({
      sender: 'Client',
      text: `You have joined the game as '${partyInfo.name}'.`,
      isSelf: false,
      isSystem: true
    });
    this.socket.emit('join', partyInfo);
  }

  // Handler passed to the Chat component, called whenever the user sends a chat
  // message. Shows the message client-side instantly and sends the message to
  // the server to be broadcasted to everyone else.
  chatHandler(msgText) {
    this.addMsg({
      sender: 'You',
      text: msgText,
      isSelf: true,
      isSystem: false
    });
    this.socket.emit('msg', msgText);
  }

  // Adds a message to the Chat component.
  addMsg(msg) {
    const messages = this.state.messages;
    messages.push(msg);
    this.setState({
      messages: messages
    });
  }

  render() {
    return (
      <div id={styles.root}>
        <div id={styles.gameContainer}
             className={styles.containerLevel2}>
          {this.provincesToJsx()}
        </div>
        <Chat messages={this.state.messages}
              chatHandler={this.chatHandler} />
        <div id={styles.playersSidebar}
             className={styles.containerLevel2}>
          <PlayersSidebar gs={this.state.gs} />
        </div>
        <div id={styles.controlPanel}
             className={styles.containerLevel2}>
          <ControlPanel joinHandler={this.joinHandler}
                        gs={this.state.gs}
                        gameCode={this.gameCode} />
        </div>
      </div>
    );
  }
}

export default GameView;
