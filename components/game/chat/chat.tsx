import React from "react";

import ChatMessage from "./chat-message";
import general from "../../general.module.css";
import styles from "./chat.module.css";

class Chat extends React.Component {
  props: any;
  state: {currentMsg: string};
  textInput: any;
  messagesInner: any;
  bottomMessage: any;
  messageJustSent: any;

  constructor(props) {
    super(props);

    this.state = {
      currentMsg: ""
    };

    this.textInput = React.createRef();
    this.messagesInner = React.createRef();
    this.bottomMessage = React.createRef();
    this.messageJustSent = false;

    this.handleTyping = this.handleTyping.bind(this);
    this.checkIfEnterPressed = this.checkIfEnterPressed.bind(this);
    this.sendMsg = this.sendMsg.bind(this);
  }

  msgsToJsx(): any {
    let msgsJsx: any[] = [];
    this.props.messages.forEach((msg, msgIndex) => {
      msgsJsx.push(
        <ChatMessage msg={msg} key={msgIndex} />
      );
    });
    return msgsJsx;
  }

  handleTyping(event): void {
    this.setState({currentMsg: event.target.value});
  }

  checkIfEnterPressed(key): void {
    if (key.keyCode == 13) {
      this.sendMsg();
      this.textInput.current.focus();
    }
  }

  sendMsg(): void {
    const newMsg: string = this.state.currentMsg.trim();
    if (newMsg.length > 0) {
      this.props.callback('msg', newMsg);

      // Update the message box and scroll to the bottom of the chat log
      this.setState(() => ({
        currentMsg: ""
      }));
      this.messageJustSent = true;
    }
  }

  // Scroll to the bottom of the chat log, only if the user just sent a message
  // themselves or they are already scrolled to within 50 pixels of the bottom
  // of the chat log.
  scrollToBottom() {
    let p = this.messagesInner.current;
    if (this.messageJustSent ||
        p.scrollHeight - p.scrollTop < p.clientHeight + 50) {
      this.bottomMessage.current.scrollIntoView(false);
      this.messageJustSent = false;
    }
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div id={styles.chatContainer}>
        <div id={styles.messagesOuter}>
          <div id={styles.messagesInner}
               ref={this.messagesInner}>
            {this.msgsToJsx()}
            <div id={styles.bottomMessage}
                 ref={this.bottomMessage} />
          </div>
        </div>
        <div id={styles.inputRow}>
          <input id={styles.inputBox}
                 placeholder="Chat here"
                 value={this.state.currentMsg}
                 onChange={this.handleTyping}
                 onKeyDown={this.checkIfEnterPressed}
                 ref={this.textInput} />
          <button className={general.actionBtn}
              id={styles.sendBtn}
              onClick={this.sendMsg}>
            Send
          </button>
        </div>
      </div>
    );
  }
}

export default Chat;
