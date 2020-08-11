import React from "react";

import ProvsHeader from "./provs-header";
import Prov from "./prov";
import general from "../../general.module.css";

interface ProvsViewProps {
  gs: any,
  callback: (string, any?) => void
}

interface ProvsViewState {
  tab: number
}

class ProvsView extends React.Component {
  props: ProvsViewProps;
  state: ProvsViewState;

  constructor(props: ProvsViewProps) {
    super(props);

    this.state = {
      tab: 0
    };
  }

  switchTab(target: number) {
    this.setState({
      tab: target
    });
  }

  render() {
    // @ts-ignore
    return (
      <div className={general.outerWrapper + ' ' +
          general.vertWrapper}>
        <ProvsHeader gs={this.props.gs}
            activeTab={this.state.tab}
            tabCallback={this.switchTab.bind(this)} />
        <Prov gs={this.props.gs}
            callback={this.props.callback}
            index={this.state.tab} />
      </div>
    );
  }
}

export default ProvsView;
