import React from "react";

import PolCategory from "../pols/pol-category";
import PmChoice from "./pm-choice";

function Prov(props) {
  if (props.gs.stage >= 2) {
    return (
      <div>
        <PolCategory gs={props.gs}
            callback={props.callback}
            provIndex={props.index}
            pols={props.gs.officials} />
        <PmChoice gs={props.gs}
            callback={props.callback} />
      </div>
    );
  }

  if (props.gs.rounds === 0) {
    const ownPol: number =
        props.gs.provs[props.index].candidates.filter((polIndex: number) => {
      return props.gs.pols[polIndex].party === props.gs.pov;
    });
    return (
      <PolCategory gs={props.gs}
          callback={props.callback}
          provIndex={props.index}
          pols={ownPol} />
    );
  }

  return (
    <PolCategory gs={props.gs}
        callback={props.callback}
        provIndex={props.index}
        pols={props.gs.provs[props.index].candidates} />
  );
}

export default Prov;
