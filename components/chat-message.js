import React from 'react';
import styles from './chat-message.module.css';

class ChatMessage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <span class={styles.sender}>{this.props.sender}:</span>&nbsp;&nbsp;
        {this.props.text}
      </div>
    );
  }
}

export default ChatMessage;
