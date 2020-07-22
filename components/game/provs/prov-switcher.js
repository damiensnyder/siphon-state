import React from 'react';

import ProvsHeader from './provs-header';
import Prov from './prov';
import PregamePlaceholder from './pregame-placeholder';
import general from '../../general.module.css';

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

  currentProvOrPlaceholder() {
    if (!this.props.gs.started) {
      return <PregamePlaceholder />;
    }
    return (
      <Prov gs={this.props.gs}
          callback={this.props.callback}
          index={this.state.tab} />
    );
  }

  render() {
    return (
      <div className={general.outerWrapper + ' ' +
          general.vertWrapper}>
        <ProvsHeader gs={this.props.gs}
            activeTab={this.state.tab}
            tabCallback={this.switchTab} />
        {this.currentProvOrPlaceholder()}
      </div>
    );
  }
}

export default ProvSwitcher;
