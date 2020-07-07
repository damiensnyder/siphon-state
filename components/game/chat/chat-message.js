import React from 'react';

import styles from './chat-message.module.css';

class ChatMessage extends React.Component {
  constructor(props) {
    super(props);
  }

  senderStyle() {
    return this.props.msg.isSelf ? styles.selfSender : styles.sender;
  }

  render() {
    if (this.props.msg.isSystem) {
      return (
        <div>
          <span className={styles.systemMsg}>{this.props.msg.text}</span>
        </div>
      );
    }

    return (
      <div>
        <span className={this.senderStyle()}>{this.props.msg.sender}:</span>
        &nbsp;&nbsp;{this.props.msg.text}
      </div>
    );
  }
}

export default ChatMessage;
