import React from 'react';
import styles from './province.module.css';
import PolCategory from './pol-category';

class Province extends React.Component {
  constructor(props) {
    super(props);

    this.activityStyle = this.activityStyle.bind(this);
    this.polCategoriesToJsx = this.polCategoriesToJsx.bind(this);
  }

  activityStyle(self) {
    if (this.props.gs.activeProvince === this.props.index) {
      return styles.province + " " + styles.activeProvince;
    } else {
      return styles.province + " " + styles.inactiveProvince;
    }
  }

  polCategoriesToJsx(self) {
    const dropouts = <PolCategory gs={this.props.gs}
                                  pols={self.dropouts}
                                  type={'Dropouts'}
                                  key={0} />;
    const candidates = <PolCategory gs={this.props.gs}
                                    pols={self.candidates}
                                    type={'Candidates'}
                                    key={1} />;
    const officials = <PolCategory gs={this.props.gs}
                                   pols={self.officials}
                                   type={'Officials'}
                                   key={2} />;
    const governors = <PolCategory gs={this.props.gs}
                                   pols={self.governors}
                                   type={'Governors'}
                                   key={3} />;

    if (self.stage === 0) {
      return [candidates];
    } else if (self.stage === 1) {
      return [candidates, dropouts];
    } else if (self.stage === 1) {
      return [officials, candidates, dropouts];
    } else if (self.stage === 1) {
      return [governors, officials, candidates, dropouts];
    } else {
      return [];
    }
  }

  render() {
    const self = this.props.gs.provinces[this.props.index];
    return (
      <div className={this.activityStyle()}>
        <h2 className={styles.provinceName}>{self.name}</h2>
        {this.polCategoriesToJsx(self)}
      </div>
    );
  }
}

export default Province;
