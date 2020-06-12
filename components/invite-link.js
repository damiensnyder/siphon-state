import React from 'react';
import styles from './invite-link.module.css';

class InviteLink extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      copied: false
    }

    this.linkArea = React.createRef();
    this.copyInviteLink = this.copyInviteLink.bind(this);
  }

  // Selects the textarea with the invite link and copies it to clipboard.
  copyInviteLink() {
    this.linkArea.current.select();
    document.execCommand('copy');

    this.setState({
      copied: true
    });

    setTimeout(() => {
      this.setState({
        copied: false
      });
    }, 3000);
  }

  render() {
    return (
      <div className={styles.sameLine}>
        <textarea rows={1}
                  ref={this.linkArea}
                  className={styles.gameLink}
                  onChange={() => {}} // suppresses warning
                  value={'https://filter-state.herokuapp.com/game/' +
                         this.props.gameCode}>
        </textarea>
        <button className={styles.actionBtn}
                id={styles.copyBtn}
                onClick={this.copyInviteLink}>
          {this.state.copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    );
  }
}

export default InviteLink;
