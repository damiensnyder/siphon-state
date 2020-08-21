import React from "react";

import general from "../../general.module.css";
import styles from "./parties.module.css";

interface PaymentProps {
  gs: any,
  ownParty: any,
  callback: any,
  index: number
}

class Payment extends React.Component {
  props: PaymentProps;
  state: {
    amount: number,
    paid: boolean
  };

  constructor(props: PaymentProps) {
    super(props);

    this.state = {
      amount: 0,
      paid: false
    };
  }

  payButtonJsx() {
    if (this.state.amount > this.props.ownParty.funds
        || this.state.amount == 0) {
      return <span className={styles.spaced}>Pay:</span>;
    }

    const payAction = () => {
      this.setState({
        paid: true
      });
      this.props.callback('pay', {
        target: this.props.index, amount: this.state.amount
      });
    }

    return (
      <button className={general.actionBtn + ' ' + styles.spaced}
          onClick={payAction}>
        Pay
      </button>
    );
  }

  incrementButtonJsx(value) {
    const label = value > 0 ? "+" : "-";

    if (this.state.amount + value < 0
        || this.state.amount + value > this.props.ownParty.funds) {
      return (
        <button className={general.actionBtn + ' ' +
            styles.incrementBtn + ' ' +
            styles.inactiveBtn}>
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
    const unpayAction = () => {
      this.setState({
        paid: false,
        amount: 0
      });
      this.props.callback('unpay', this.props.index);
    };

    if (this.state.paid) {
      return (
        <div className={styles.paymentOuter}>
          <span className={styles.spaced}>
            Paying: {formatMoneyString(this.state.amount)}
          </span>
          <button className={general.actionBtn}
              onClick={unpayAction}>
            Undo
          </button>
        </div>
      );
    }

    if (!this.props.gs.started
        || this.props.gs.ended
        || this.props.ownParty == undefined
        || this.props.ownParty.funds == 0) {
      return null;
    }

    return (
      <div className={styles.paymentOuter}>
        {this.payButtonJsx.bind(this)()}
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

export default Payment;
