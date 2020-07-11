import React from 'react';

import general from './general.module.css';

function SettingText(props) {
  const submitIfEnterPressed = (key) => {
    if (key.keyCode == 13) {
      props.submitCallback();
    }
  };

  const textChangeHandler = (e) => {
    props.textCallback(e.target.value);
  };

  return (
    <div className={general.sameLine}>
      {props.label}
      <input className={general.settingsInput}
             maxLength={props.maxLength}
             value={props.text}
             onChange={textChangeHandler}
             onKeyDown={submitIfEnterPressed} />
    </div>
  );
}

export default SettingText;
