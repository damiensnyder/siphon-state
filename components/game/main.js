import React from 'react';
import io from 'socket.io-client';

import Chat from './chat/chat';
import styles from './main.module.css';
import gsAfter from './gamestate-manager';

class GameView extends React.Component {
  constructor(props) {
    super(props);

    this.socket = undefined;
    this.gameCode = '';

    this.state = {
      gs: {
        parties: [],
        pov: -1,
        started: false,
        ended: false
      },
      messages: [],
      connected: false
    };

    this.handlers = {
      'join': this.joinHandler,
      'replace': this.replaceHandler,
      'ready': this.readyHandler,
      'msg': this.msgHandler,
      'action': this.actionHandler
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

  // Creates the socket connection to the server and handlers for when messages
  // are received from the server.
  initializeSocket() {
    this.socket = io.connect('/game/' + this.props.gameCode);

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
      this.setState({gs: gs});
    });

    this.socket.on('newready', (readyInfo) => {
      const gs = this.state.gs;
      gs.parties[readyInfo.party].ready = readyInfo.isReady;
      this.setState({gs: gs});
    });

    this.socket.on('newreplace', (party) => {
      const gs = this.state.gs;
      gs.parties[party].connected = true;
      this.setState({gs: gs});
    });

    this.socket.on('newdisconnect', (party) => {
      const gs = this.state.gs;
      gs.parties[party].ready = false;
      gs.parties[party].connected = false;
      this.setState({gs: gs});
    });
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
  joinHandler(partyInfo) {
    this.addMsg({
      sender: 'Client',
      text: `You have joined the game as '${partyInfo.name}' ` +
          `(${partyInfo.abbr}).`,
      isSelf: false,
      isSystem: true
    });
  }

  replaceHandler(target) {
    const gs = this.state.gs;
    gs.pov = target;
    gs.parties[target].connected = true;
    gs.parties[target].symps = [];
    gs.parties[target].bribed = [];
    this.setState({
      gs: gs
    });
  }

  readyHandler(isReady) {
    const gs = this.state.gs;
    gs.parties[gs.pov].ready = isReady;
    this.setState({
      gs: gs
    });
  }

  // Handler passed to the Chat component, called whenever the user sends a chat
  // message. Shows the message client-side instantly while the initial callback
  // function sends the message to the server to be broadcasted to everyone
  // else.
  msgHandler(msg) {
    this.addMsg({
      sender: 'You',
      text: msg,
      isSelf: true,
      isSystem: false
    });
  }

  actionHandler(data) {
    this.setState({
      gs: gsAfter(this.state.gs, data.type, data.actionInfo)
    });
    this.socket.emit(data.type, data.actionInfo);
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
        <Chat messages={this.state.messages}
            callback={this.callback} />
      </div>
    );
  }
}

export default GameView;
