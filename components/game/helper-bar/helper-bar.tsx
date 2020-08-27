import React from "react";

import general from "../../general.module.css";
import styles from "./helper-bar.module.css";

interface HelperBarProps {
  gs: any,
  callback: (string) => void,
  activeTab: number,
  tabCallback: (number) => void
}

class HelperBar extends React.Component {
  props: HelperBarProps;
  state: {helpIsVisible: boolean};

  constructor(props: HelperBarProps) {
    super(props);

    this.state = {
      helpIsVisible: false
    };
  }

  toggleHelp(): void {
    this.setState({
      helpIsVisible: !this.state.helpIsVisible
    });
  }

  readyButtonLabel(): string {
    if (this.props.gs.parties[this.props.gs.pov].ready) {
      return "Cancel";
    }
    if (!this.props.gs.started) {
      return "Ready";
    }
    if (this.props.gs.ended) {
      return "Rematch";
    }
    return "Done";
  }

  helpMessage() {
    if (!this.state.helpIsVisible) {
      return null;
    }

    let helpText = "ass face";

    return (
      <div className={styles.helpText}>
        {helpText}
      </div>
    );
  }

  render() {
    if (this.props.gs.parties[this.props.gs.pov] == null) {
      return null;
    }

    const buttonStyle: string = general.actionBtn + ' ' +
        styles.bigButton + ' ';
    const inactiveStyle: string = general.inactiveBtn2 + ' ' +
        styles.bigButton + ' ';
    const priorityStyle: string = buttonStyle + general.priorityBtn + ' ';

    let backButton = (
      <button className={buttonStyle}
          onClick={() => this.props.tabCallback(this.props.activeTab - 1)}>
        &lt;&lt; Back
      </button>
    );
    let nextButton: React.ReactElement = (
      <button className={buttonStyle}
          onClick={() => this.props.tabCallback(this.props.activeTab + 1)}>
        Next &gt;&gt;
      </button>
    );
    if (this.props.activeTab == 0) {
      backButton = (
        <button className={inactiveStyle}>
          &lt;&lt; Back
        </button>
      );
    }
    if (this.props.activeTab == this.props.gs.provs.length - 1) {
      nextButton = (
        <button className={inactiveStyle}>
          Next &gt;&gt;
        </button>
      );
    }

    return (
      <div className={styles.outerWrapper}>
        {this.helpMessage.bind(this)()}
        <div className={styles.buttonsRow}>
          <button className={priorityStyle}
              onClick={this.toggleHelp.bind(this)}>
            Help
          </button>
          {backButton}
          {nextButton}
          <button className={priorityStyle}
              onClick={() => this.props.callback('ready')}>
            {this.readyButtonLabel()}
          </button>
        </div>
      </div>
    );
  }
}



export default HelperBar;
