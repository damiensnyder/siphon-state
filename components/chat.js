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

  render() {
    return (
      <div id={styles.chatLog}>
        <div id={styles.messages}>
          <ChatMessage sender="adf" msg="asdfgjsn" />
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
