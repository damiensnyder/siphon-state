import React from 'react';
import styles from './chat.module.css';
import ChatMessage from './chat-message';

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentMsg: "",
      messages: []
    }

    this.socket = this.props.socket;
    this.socket.on('msg', (msg) => addMsg(msg));

    this.textInput = React.createRef();
    this.messagesInner = React.createRef();
    this.bottomMessage = React.createRef();
    this.messageJustSent = false;

    this.handleTyping = this.handleTyping.bind(this);
    this.checkIfEnterPressed = this.checkIfEnterPressed.bind(this);
    this.sendMsg = this.sendMsg.bind(this);
  }

  msgsToJsx() {
    return this.state.messages.map(msg => (
      <ChatMessage sender={msg.sender} text={msg.text} />
    ));
  }

  handleTyping(event) {
    this.setState({currentMsg: event.target.value});
  }

  checkIfEnterPressed(key) {
    if (key.keyCode == 13) {
      this.sendMsg();
      this.textInput.current.focus();
    }
  }

  sendMsg() {
    const newMsg = this.state.currentMsg.trim();
    if (newMsg.length > 0) {
      // Add the message to the list of messages
      const messages = this.state.messages;
      messages.push({
        sender: 'You',
        text: newMsg
      });

      // Update the message box and scroll to the bottom of the chat log
      this.setState(state => ({
        currentMsg: "",
        messages: messages
      }));
      this.messageJustSent = true;

      // Send the message to the server
      this.socket.emit('msg', newMsg);
    }
  }

  addMsg(msg) {
    messages.push(msg);
    scrollToBottom();
  }

  scrollToBottom() {
    var e = this.messagesInner.current;
    if (this.messageJustSent ||
        e.scrollHeight - e.scrollTop === e.clientHeight) {
      this.bottomMessage.current.scrollIntoView(false);
      this.messageJustSent = false;
    }
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div id={styles.chatLog}>
        <div id={styles.messagesOuter}>
          <div id={styles.messagesInner} ref={this.messagesInner}>
            {this.msgsToJsx()}
            <div id={styles.bottomMessage} ref={this.bottomMessage} />
          </div>
        </div>
        <div id={styles.inputRow}>
          <input name="msgText" id={styles.inputBox} placeholder="Chat here"
            value={this.state.currentMsg} onChange={this.handleTyping}
            onKeyDown={this.checkIfEnterPressed} ref={this.textInput} />
          <button id={styles.sendBtn} onClick={this.sendMsg}>
            Send
          </button>
        </div>
      </div>
    );
  }
}

export default Chat;
