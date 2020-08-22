import React from 'react';

import general from './general.module.css';

function TextInput(props): React.ReactElement {
  const submitIfEnterPressed = (key): void => {
    if (key.keyCode == 13) {
      props.submitCallback();
    }
  };

  const textChangeHandler = (e): void => {
    props.textCallback(e.target.value);
  };

  return (
    <div className={general.horizWrapper}>
      <div className={general.spacer + " " + general.growable}>
        <div className={general.settingTextWrapper}>
          <div className={general.horizWrapper}>
            {props.label}
            <input className={general.settingsInput}
                maxLength={props.maxLength}
                value={props.text}
                placeholder={props.placeholder}
                onChange={textChangeHandler}
                onKeyDown={submitIfEnterPressed} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextInput;
