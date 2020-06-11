import React from 'react';
import styles from './chat.module.css';

class Chat extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id={styles.chatLog}>
        <div id={styles.messages}>
          msg
        </div>
        <div id={styles.inputRow}>
          input
        </div>
      </div>
    );
  }
}

export default Chat;
