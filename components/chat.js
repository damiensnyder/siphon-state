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

      this.messageJustSent = true;
    }
  }

  scrollToBottom() {
    var mi = this.messagesInner.current;
    if (this.messageJustSent ||
        mi.scrollHeight - mi.scrollTop === mi.clientHeight) {
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
          <input name="msgText" id={styles.inputText} placeholder="Chat here"
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
