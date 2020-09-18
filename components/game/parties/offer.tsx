import React from "react";

import general from "../../general.module.css";
import styles from "./parties.module.css";

interface OfferProps {
  gs: any,
  ownParty: any,
  callback: any,
  index: number
}

class Offer extends React.Component {
  props: OfferProps;
  state: {
    amount: number,
    paid: boolean
  };

  constructor(props: OfferProps) {
    super(props);

    this.state = {
      amount: 0,
      paid: false
    };
  }

  offerButtonJsx() {
    if (this.state.amount > this.props.ownParty.funds + 60
        || this.state.amount == 0) {
      return <span className={styles.spaced}>Offer:</span>;
    }

    const offerAction = () => {
      this.setState({
        paid: true
      });
      this.props.callback('offer', {
        target: this.props.index,
        amount: this.state.amount
      });
    }

    return (
      <button className={general.actionBtn + ' ' + styles.spaced}
          onClick={offerAction}>
        Offer
      </button>
    );
  }

  incrementButtonJsx(value) {
    const label = value > 0 ? "+" : "-";

    if (this.state.amount + value < 0
        || this.state.amount + value > this.props.ownParty.funds + 60) {
      return (
        <button className={general.actionBtn + ' ' +
            styles.incrementBtn + ' ' +
            general.inactiveBtn2}>
          {label}
        </button>
      );
    }

    const clickAction = () => {
      this.setState({
        amount: this.state.amount + value
      });
    }

    return (
      <button className={general.actionBtn + ' ' + styles.incrementBtn}
          onClick={clickAction}>
        {label}
      </button>
    );

  }

  render() {
    const unofferAction = () => {
      this.setState({
        paid: false,
        amount: 0
      });
      this.props.callback('unoffer', this.props.index);
    };

    if (this.state.paid) {
      return (
        <div className={styles.paymentOuter}>
          <span className={styles.spaced}>
            Offered: {formatMoneyString(this.state.amount)}
          </span>
        </div>
      );
    }

    if (!this.props.gs.started
        || this.props.gs.ended
        || this.props.ownParty == undefined) {
      return null;
    }

    return (
      <div className={styles.paymentOuter}>
        {this.offerButtonJsx.bind(this)()}
        <div className={styles.digitWrapper}>
          {this.incrementButtonJsx.bind(this)(10)}
          {Math.floor(this.state.amount / 10)}
          {this.incrementButtonJsx.bind(this)(-10)}
        </div>
        <div className={styles.digitWrapper}>.</div>
        <div className={styles.digitWrapper}>
          {this.incrementButtonJsx.bind(this)(1)}
          {this.state.amount % 10}
          {this.incrementButtonJsx.bind(this)(-1)}
        </div>
        <div className={styles.digitWrapper}>M</div>
      </div>
    );
  }
}

function formatMoneyString(amount: number): string {
  if (amount >= 10) {
    return "$" + (amount / 10) + "M";
  } else {
    return "$" + (amount * 100) + "k";
  }
}

export default Offer;
