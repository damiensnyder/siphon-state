import React from 'react';

import ProvsHeader from './provs-header';
import general from '../../general.module.css';
import styles from './provs.module.css';

class ProvSwitcher extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tab: 0
    };

    this.switchTab = this.switchTab.bind(this);
  }

  switchTab(target) {
    this.setState({
      tab: target
    });
  }

  render() {
    return (
      <div className={general.outerWrapper + ' ' +
          general.vertWrapper}>
        <ProvsHeader gs={this.props.gs}
          tabCallback={this.switchTab} />
        <Prov gs={this.props.gs}
          callback={this.props.callback}
          index={this.state.tab} />
      </div>
    );
  }
}

export default ProvSwitcher;
