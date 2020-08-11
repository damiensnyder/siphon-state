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
              isTop={true}
              callback={props.callback}
              pols={props.gs.officials} />
        </div>
      </div>
    );
  }

  if (props.gs.stage == 0 && props.gs.pov !== undefined) {
    return (
      <div className={styles.provOuter}>
        <div className={styles.provInner}>
          <PolCategory gs={props.gs.provs[props.index].candidates}
              name={"Candidates"}
              isTop={true}
              callback={props.callback}
              pols={props.gs.officials} />
          <PolCategory gs={props.gs.provs[props.index].candidates}
              name={"Available"}
              isTop={false}
              callback={props.callback}
              pols={props.gs.parties[props.gs.pov].candidates} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.provOuter}>
      <div className={styles.provInner}>
        <PolCategory gs={props.gs.provs[props.index].candidates}
            name={"Candidates"}
            isTop={true}
            callback={props.callback}
            pols={props.gs.officials} />
      </div>
    </div>
  );
}

export default Prov;
