import React from 'react';

import PolCategory from '../pol-category';
import ControlsHeader from './controls-header';
import general from '../../general.module.css';
import styles from './control-panel.module.css';

class GameControls extends React.Component {
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
    const gs = this.props.gs;
    const self = gs.parties[gs.pov];
    const runnable = [];
    const unrunnable = [];
    const symps = [];

    for (let i = 0; i < self.pols.length; i++) {
      let pol = self.pols[i];
      if (gs.pols[pol].runnable) {
        runnable.push(pol);
      } else {
        unrunnable.push(pol);
      }
    }

    var polCategories = [
      <PolCategory gs={gs}
          callback={this.props.callback}
          key={0}
          inProvince={false}
          pols={runnable} />,
      <PolCategory gs={gs}
          callback={this.props.callback}
          key={1}
          inProvince={false}
          pols={unrunnable} />,
      <PolCategory gs={gs}
          callback={this.props.callback}
          key={2}
          inProvince={false}
          pols={self.symps} />
    ];

    return (
      <div className={general.outerWrapper + ' ' + general.vertWrapper}>
        <ControlsHeader gs={gs}
            callback={this.props.callback}
            activeTab={this.state.tab}
            tabCallback={this.switchTab} />
        <div className={general.outerWrapper + ' ' +
            general.vertWrapper + ' ' +
            general.growable + ' ' +
            styles.notInGame}>
          {polCategories[this.state.tab]}
        </div>
      </div>
    );
  }
}

export default GameControls;
