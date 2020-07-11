import React from 'react';

import PolCategory from '../pol-category';
import ControlsHeader from './controls-header';
import general from '../../general.module.css';

class GameControls extends React.Component {
  constructor(props) {
    super(props);

    this.setState({
      tab: 0
    });

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

    return (
      <div className={general.outerWrapper + ' ' + general.vertWrapper}>
        <ControlsHeader gs={gs}
                        callback={this.props.callback}
                        isTabbed={true}
                        tabCallback={this.switchTab} />
        <div className={general.horizWrapper}>
          <PolCategory gs={gs}
                       callback={this.props.callback}
                       type={"Available"}
                       inProvince={false}
                       pols={runnable} />
          <PolCategory gs={gs}
                       callback={this.props.callback}
                       type={"Unavailable"}
                       inProvince={false}
                       pols={unrunnable} />
          <PolCategory gs={gs}
                       callback={this.props.callback}
                       type={"Sympathizers"}
                       inProvince={false}
                       pols={self.symps} />
        </div>
      </div>
    );
  }
}

export default GameControls;
