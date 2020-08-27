import React from "react";

import PolCategory from "../pols/pol-category";
import styles from "./provs.module.css";

function Prov(props) {
  if (props.gs.stage >= 2) {
    return (
      <PolCategory gs={props.gs}
          name={"Officials"}
          callback={props.callback}
          provIndex={props.index}
          pols={props.gs.officials} />
    );
  }

  return (
    <PolCategory gs={props.gs}
        name={"Candidates"}
        callback={props.callback}
        provIndex={props.index}
        pols={props.gs.provs[props.index].candidates} />
  );
}

export default Prov;
