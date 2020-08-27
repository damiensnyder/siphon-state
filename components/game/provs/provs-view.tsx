import React from "react";

import ProvsHeader from "./provs-header";
import Prov from "./prov";
import general from "../../general.module.css";
import HelperBar from "../helper-bar/helper-bar";
import styles from "./provs.module.css";

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
        <div className={styles.provOuter}>
          <div className={styles.provInner}>
            <Prov gs={this.props.gs}
                callback={this.props.callback}
                index={this.state.tab} />
            <HelperBar gs={this.props.gs}
                callback={this.props.callback}
                activeTab={this.state.tab}
                tabCallback={this.switchTab.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}

export default ProvsView;
