import React from 'react';

import general from '../../general.module.css';
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

    if (window.getSelection !== undefined) {        // All browsers except IE <9
      window.getSelection().removeAllRanges();
    } else if (document.selection !== undefined) {  // IE <9
      document.selection.empty();
    }

    this.setState({
      copied: true
    });

    setTimeout(() => {
      this.setState({
        copied: false
      });
    }, 2500);
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
        <button className={styles.actionBtn + ' ' + general.priorityBtn}
                id={styles.copyBtn}
                onClick={this.copyInviteLink}>
          {this.state.copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    );
  }
}

export default InviteLink;
