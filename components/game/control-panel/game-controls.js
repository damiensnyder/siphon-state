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
          emptyMsg={"All your politicians are busy right now."}
          inProvince={false}
          pols={runnable}
          key={0} />,
      <PolCategory gs={gs}
          callback={this.props.callback}
          emptyMsg={"None of your politicians are busy right now."}
          inProvince={false}
          pols={unrunnable}
          key={1} />,
      <PolCategory gs={gs}
          callback={this.props.callback}
          emptyMsg={"You don't have any sympathizers right now."}
          inProvince={false}
          pols={self.symps}
          key={2} />
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
