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
        parties: [],
        pov: -1
      },
      messages: [],
      connected: false,
      started: false,
      ended: false
    };

    this.handlers = {
      'join': this.joinHandler,
      'replace': this.replaceHandler,
      'ready': this.readyHandler,
      'chat': this.chatHandler,
      'pay': this.payHandler,
      'buy': this.buyHandler,
      'flip': this.flipHandler,
      'run': this.runHandler,
      'fund': this.fundHandler,
      'vote': this.voteHandler
    };

    for (let key in this.handlers) {
      this.handlers[key] = this.handlers[key].bind(this);
    }
    this.callback = this.callback.bind(this);
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
                  callback={this.callback}
                  index={i}
                  key={i} />
      );
    }
    return provincesJsx;
  }

  // Passed to child components. Assigns the callback to the proper handler
  // function and passes the data along. Sends the type and data via the socket
  // to the server.
  callback(type, data) {
    this.handlers[type](data);
    this.socket.emit(type, data);
  }

  // Passed to the control panel and called when the player joins the game.
  // Sends the player's info to the server and shows a system chat message to
  // the player.
  joinHandler(data) {
    this.addMsg({
      sender: 'Client',
      text: `You have joined the game as '${data.name}'.`,
      isSelf: false,
      isSystem: true
    });
  }

  replaceHandler(data) {
    const gs = this.state.gs;
    gs.pov = data;
    gs.parties[data].connected = true;
    this.setState({
      gs: gs
    });
  }

  readyHandler(data) {
    const gs = this.state.gs;
    gs.parties[gs.pov].ready = data;
    this.setState({
      gs: gs
    });
  }

  // Handler passed to the Chat component, called whenever the user sends a chat
  // message. Shows the message client-side instantly while the initial callback
  // function sends the message to the server to be broadcasted to everyone
  // else.
  chatHandler(data) {
    this.addMsg({
      sender: 'You',
      text: data,
      isSelf: true,
      isSystem: false
    });
  }

  payHandler(data) {
    const gs = this.state.gs;
    gs.parties[gs.pov].funds -= data.amount;
    gs.parties[data.p2].funds += data.amount;
    this.setState({
      gs: gs
    });
  }

  buyHandler(data) {
    const gs = this.state.gs;
    gs.parties[gs.pov].funds -= 5;
    this.setState({
      gs: gs
    });
  }

  flipHandler(data) {
    
  }

  runHandler(data) {

  }

  fundHandler(data) {

  }

  voteHandler(data) {

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
              callback={this.callback} />
        <div id={styles.playersSidebar}
             className={styles.containerLevel2}>
          <PlayersSidebar gs={this.state.gs}
                          callback={this.callback} />
        </div>
        <div id={styles.controlPanel}
             className={styles.containerLevel2}>
          <ControlPanel gs={this.state.gs}
                        callback={this.callback}
                        gameCode={this.gameCode} />
        </div>
      </div>
    );
  }
}

export default GameView;
