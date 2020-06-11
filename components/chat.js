import React from 'react';
import styles from './chat.module.css';
import ChatMessage from './chat-message';

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: []
    }
  }

  msgsToJsx() {
    return this.state.messages.map(msg => (
      <ChatMessage sender={msg.sender} text={msg.text} />
    ));
  }

  sendMsg() {
    const newMsgs = this.state.messages;
    newMsgs.push({
      sender: 'You',
      text: 'placeholder'
    });
    this.setState(state => ({
      messages: newMsgs
    }));
  }

  render() {
    return (
      <div id={styles.chatLog}>
        <div id={styles.messages}>
          {this.msgsToJsx()}
        </div>
        <div id={styles.inputRow}>
          <input name="msgText" id={styles.inputText} placeholder="Chat here" />
          <button id={styles.sendBtn} onClick={this.sendMsg.bind(this)}>
            Send
          </button>
        </div>
      </div>
    );
  }
}

export default Chat;
