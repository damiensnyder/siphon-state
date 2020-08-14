import React from "react";

import PolCategory from "./pol-category";
import styles from "./provs.module.css";

function Prov(props) {
  if (props.gs.stage >= 2) {
    return (
      <div className={styles.provOuter}>
        <div className={styles.provInner}>
          <PolCategory gs={props.gs}
              name={"Officials"}
              callback={props.callback}
              provIndex={props.index}
              pols={props.gs.officials} />
        </div>
      </div>
    );
  }

  if (props.gs.stage === 0 && props.gs.pov !== undefined) {
    return (
      <div className={styles.provOuter}>
        <div className={styles.provInner}>
          <PolCategory gs={props.gs}
              name={"Candidates"}
              callback={props.callback}
              provIndex={props.index}
              pols={props.gs.provs[props.index].candidates} />
          <PolCategory gs={props.gs}
              name={"Available"}
              callback={props.callback}
              provIndex={props.index}
              pols={props.gs.parties[props.gs.pov].pols} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.provOuter}>
      <div className={styles.provInner}>
        <PolCategory gs={props.gs}
            name={"Candidates"}
            callback={props.callback}
            provIndex={props.index}
            pols={props.gs.provs[props.index].candidates} />
      </div>
    </div>
  );
}

export default Prov;
