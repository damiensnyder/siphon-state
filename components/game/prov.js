import React from 'react';
import styles from './prov.module.css';
import PolCategory from './pol-category';

class Prov extends React.Component {
  constructor(props) {
    super(props);

    this.activityStyle = this.activityStyle.bind(this);
    this.polCategoriesToJsx = this.polCategoriesToJsx.bind(this);
  }

  activityStyle(self) {
    if (this.props.gs.activeProv === this.props.index) {
      return styles.prov + " " + styles.activeProv;
    } else {
      return styles.prov + " " + styles.inactiveProv;
    }
  }

  polCategoriesToJsx(self) {
    const dropouts = <PolCategory gs={this.props.gs}
        callback={this.props.callback}
        pols={self.dropouts}
        type={'Dropouts'}
        key={0} />;
    const candidates = <PolCategory gs={this.props.gs}
        callback={this.props.callback}
        pols={self.candidates}
        type={'Candidates'}
        key={1} />;
    const officials = <PolCategory gs={this.props.gs}
        callback={this.props.callback}
        pols={self.officials}
        type={'Officials'}
        key={2} />;
    const governors = <PolCategory gs={this.props.gs}
        callback={this.props.callback}
        pols={self.governors}
        type={'Governors'}
        key={3} />;

    return [];    // delete this
    if (self.stage == 0) {
      return [candidates];
    } else if (self.stage == 1) {
      return [candidates, dropouts];
    } else if (self.stage == 2) {
      return [officials, dropouts];
    } else if (self.stage == 3) {
      return [governors, officials, dropouts];
    } else {
      return [];
    }
  }

  render() {
    const self = this.props.gs.provs[this.props.index];
    return (
      <div className={this.activityStyle()}>
        <h2 className={styles.provName}>{self.name}</h2>
        {this.polCategoriesToJsx(self)}
      </div>
    );
  }
}

export default Prov;
