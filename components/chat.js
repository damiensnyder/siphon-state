import React from 'react';
import styles from './chat.module.css';
import ChatMessage from './chat-message';

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      msgs: [
        { sender: "Player", text: "Message" }
      ]
    }
  }

  msgsToJsx() {
    return this.state.msgs.map(msg => (
      <ChatMessage sender={msg.sender} text={msg.text} />
    ));
  }

  render() {
    return (
      <div id={styles.chatLog}>
        <div id={styles.messages}>
          {this.msgsToJsx()}
        </div>
        <div id={styles.inputRow}>
          <input id={styles.inputText} placeholder="Chat here" />
          <button id={styles.sendBtn}>Send</button>
        </div>
      </div>
    );
  }
}

export default Chat;
