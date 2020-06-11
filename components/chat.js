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
  }

  msgsToJsx() {
    return this.state.messages.map(msg => (
      <ChatMessage sender={msg.sender} text={msg.text} />
    ));
  }

  handleTyping() {
    this.setState({currentMsg: event.target.value});
  }

  sendMsg() {
    if (this.state.currentMsg.trim().length > 0) {
      const newMsgs = this.state.messages;
      newMsgs.push({
        sender: 'You',
        text: this.state.currentMsg.trim()
      });
      this.setState(state => ({
        currentMsg: "",
        messages: newMsgs
      }));
    }
  }

  render() {
    return (
      <div id={styles.chatLog}>
        <div id={styles.messages}>
          {this.msgsToJsx()}
        </div>
        <div id={styles.inputRow}>
          <input name="msgText" id={styles.inputText} placeholder="Chat here"
            value={this.state.currentMsg}
            onChange={this.handleTyping.bind(this)} />
          <button id={styles.sendBtn} onClick={this.sendMsg.bind(this)}>
            Send
          </button>
        </div>
      </div>
    );
  }
}

export default Chat;
