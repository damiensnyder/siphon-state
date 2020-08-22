import React from "react";

import general from "./general.module.css";

function CheckboxInput(props): React.ReactElement {
  const checkHandler = (e): void => {
    props.checkCallback(e.target.checked);
  };

  return (
    <div className={general.spacer}>
      {props.label}
      <input type={'checkbox'}
          checked={props.checked}
          onChange={checkHandler} />
    </div>
  );
}

export default CheckboxInput;
