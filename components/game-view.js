import React from 'react';
import io from 'socket.io-client';

import Prov from './prov';
import PlayersSidebar from './players-sidebar/players-sidebar';
import ControlPanel from './control-panel/panel-switcher';
import Chat from './chat/chat';
import styles from './game-view.module.css';

class GameView extends React.Component {
  constructor(props) {
    super(props);

    this.socket = undefined;
    this.gameCode = '';

    this.state = {
      gs: {
        provs: [
          { name: '', isActive: false },
          { name: '', isActive: false },
          { name: '', isActive: false },
          { name: '', isActive: false },
          { name: '', isActive: false }
        ],
        activeProv: {},
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
      'msg': this.msgHandler,
      'flip': this.flipHandler,
      'pay': this.payHandler,
      'buy': this.buyHandler,
      'run': this.runHandler,
      'fund': this.fundHandler,
      'vote': this.voteHandler,
      'unflip': this.unflipHandler,
      'unpay': this.unpayHandler,
      'unbuy': this.unbuyHandler,
      'unrun': this.unrunHandler,
      'unfund': this.unfundHandler,
      'unvote': this.unvoteHandler
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
    this.setState({
      connected: true
    });

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

  // Converts the array of provs in the game to an array of JSX objects.
  provsToJsx() {
    const provsJsx = [];
    for (var i = 0; i < this.state.gs.provs.length; i++) {
      provsJsx.push(
        <Prov gs={this.state.gs}
                  callback={this.callback}
                  index={i}
                  key={i} />
      );
    }
    return provsJsx;
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
      text: `You have joined the game as '${data.name}' (${data.abbr}).`,
      isSelf: false,
      isSystem: true
    });
  }

  replaceHandler(target) {
    const gs = this.state.gs;
    gs.pov = target;
    gs.parties[target].connected = true;
    gs.parties[target].symps = [];
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
  msgHandler(data) {
    this.addMsg({
      sender: 'You',
      text: data,
      isSelf: true,
      isSystem: false
    });
  }

  flipHandler(pol) {
    const gs = this.state.gs;
    const oldParty = gs.parties[gs.pols[pol].party];
    oldParty.pols.splice(oldParty.pols.indexOf(pol), 1);
    gs.parties[gs.pov].symps.splice(gs.parties[gs.pov].symps.indexOf(pol), 1);
    gs.parties[gs.pov].pols.push(data);
    gs.pols[pol].party = gs.pov;
    gs.pols[pol].oldParty = oldParty;
    this.setState({
      gs: gs
    });
  }

  payHandler(party) {
    const gs = this.state.gs;
    gs.parties[gs.pov].funds -= data.amount;
    gs.parties[party].funds += data.amount;
    this.setState({
      gs: gs
    });
  }

  buyHandler() {
    const gs = this.state.gs;
    gs.parties[gs.pov].funds += 5;
    this.setState({
      gs: gs
    });
  }

  runHandler(pol) {
    const gs = this.state.gs;
    gs.pols[pol].runnable = false;
    gs.provs[gs.activeProv].candidates.push(pol);
    this.setState({
      gs: gs
    });
  }

  fundHandler(pol) {
    const gs = this.state.gs;
    gs.parties[gs.pov].funds--;
    gs.pols[pol].funded = true;
    this.setState({
      gs: gs
    });
  }

  voteHandler(pol) {
    const gs = this.state.gs;
    gs.parties[gs.pov].votes--;
    gs.pols[pol].votes++;
    this.setState({
      gs: gs
    });
  }

  unflipHandler(pol) {
    const gs = this.state.gs;
    const oldParty = gs.parties[gs.pols[pol].party];
    oldParty.pols.push(pol);
    gs.pols[pol].party = gs.pols[pol].oldParty;
    delete gs.pols[pol].oldParty;
    gs.parties[gs.pov].symps.push(pol, 1);
    gs.parties[gs.pov].pols.splice(gs.parties[gs.pov].pols.indexOf(pol), 1);
    this.setState({
      gs: gs
    });
  }

  unpayHandler(party) {
    const gs = this.state.gs;
    gs.parties[gs.pov].funds += data.amount;
    gs.parties[party].funds -= data.amount;
    this.setState({
      gs: gs
    });
  }

  unbuyHandler() {
    const gs = this.state.gs;
    gs.parties[gs.pov].funds += 5;
    this.setState({
      gs: gs
    });
  }

  unrunHandler(pol) {
    const gs = this.state.gs;
    gs.pols[pol].runnable = true;
    gs.activeProv.candidates.splice(gs.activeProv.indexOf(pol), 1);
    this.setState({
      gs: gs
    });
  }

  unfundHandler(pol) {
    const gs = this.state.gs;
    gs.parties[gs.pov].funds++;
    gs.pols[pol].funded = false;
    this.setState({
      gs: gs
    });
  }

  unvoteHandler(data) {
    const gs = this.state.gs;
    gs.parties[gs.pov].votes--;
    gs.pols[data].votes++;
    this.setState({
      gs: gs
    });
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
          {this.provsToJsx()}
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
