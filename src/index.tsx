import React, {ChangeEvent, KeyboardEvent, CSSProperties, ReactElement, SyntheticEvent, RefObject} from 'react';

const DEFAULT_COLON = ':';
const DEFAULT_DOT = '.';
const DEFAULT_VALUE = `00${DEFAULT_COLON}00`;
const DEFAULT_VALUE_SECONDS = `00${DEFAULT_COLON}00${DEFAULT_COLON}00`;
const DEFAULT_VALUE_MILLIS = `00${DEFAULT_COLON}00${DEFAULT_COLON}00${DEFAULT_DOT}000`;
const UP_ARROW_KEY_CODE = 38;
const DOWN_ARROW_KEY_CODE = 40;

export function isNumber<T>(value: T): boolean {
  const number = Number(value);
  return !isNaN(number) && String(value) === String(number);
}

export function formatTimeItem(value?: string | number, length?: number): string {
  return `${value || ''}${'0'.repeat(length || 2)}`.substr(0, length || 2);
}

export function validateTimeAndCursor(
  showSeconds = false,
  showMillis = false,
  value = '',
  defaultValue = '',
  colon = DEFAULT_COLON,
  cursorPosition = 0
): [string, number] {
  // eslint-disable-next-line prefer-const
  let [oldH, oldM, oldS, oldSS] = [...String(defaultValue).split(colon), ''];
  if (oldS && (showMillis || (!showMillis && oldS.indexOf(DEFAULT_DOT) > -1))) {
    [oldS, oldSS] = oldS.split(DEFAULT_DOT);
  }

  let newCursorPosition = Number(cursorPosition);
  let [newH, newM, newS, newSS] = [...String(value).split(colon), ''];
  if (showMillis && newS) {
    [newS, newSS] = newS.split(DEFAULT_DOT);
  }

  if (newH.length > 2) {
    newH = oldH;
    newCursorPosition -= 1;
  }
  newH = formatTimeItem(newH, 2);

  newM = formatTimeItem(newM, 2);
  if (Number(newM[0]) > 5) {
    newM = oldM;
    newCursorPosition -= 1;
  }

  if (showSeconds) {
    newS = formatTimeItem(newS, 2);
    if (Number(newS[0]) > 5) {
      newS = oldS;
      newCursorPosition -= 1;
    }
  }

  if (showMillis) {
    if (newSS && newSS.length > 3) {
      newSS = oldSS;
      newCursorPosition -= 1;
    }
    newSS = formatTimeItem(newSS, 3);
  }

  const validatedValue = showSeconds
    ? showMillis
      ? `${newH}${colon}${newM}${colon}${newS}.${newSS}`
      : `${newH}${colon}${newM}${colon}${newS}`
    : `${newH}${colon}${newM}`;

  return [validatedValue, newCursorPosition];
}

export function increment(value: string, number: number): string {
  const length = value.length;
  let newValue = Number(value) + number;
  if (newValue < 0) {
    newValue = 0;
  }
  return newValue.toString().padStart(length, '0');
}

type onChangeType = (event: SyntheticEvent<HTMLInputElement>, value: string) => void;

interface Props {
  value?: string;
  onChange?: onChangeType;
  showSeconds?: boolean;
  showMillis?: boolean;
  input: ReactElement | null;
  colon?: string;
  className?: string;
  style?: CSSProperties | {};
}

interface State {
  value: string;
  cursorPosition: number;
  _colon: string;
  _defaultValue: string;
  _showSeconds: boolean;
  _showMillis: boolean;
  _maxLength: number;
}

export default class TimeField extends React.Component<Props, State> {
  private inputRef: RefObject<HTMLInputElement>;
  static defaultProps: Props = {
    showSeconds: false,
    showMillis: false,
    input: null,
    style: {},
    colon: DEFAULT_COLON
  };

  constructor(props: Props) {
    super(props);
    const _showSeconds = Boolean(props.showSeconds);
    const _showMillis = Boolean(props.showMillis);
    const _defaultValue = _showSeconds ? (_showMillis ? DEFAULT_VALUE_MILLIS : DEFAULT_VALUE_SECONDS) : DEFAULT_VALUE;
    const _colon = props.colon && props.colon.length === 1 ? props.colon : DEFAULT_COLON;
    const [validatedTime] = validateTimeAndCursor(_showSeconds, _showMillis, this.props.value, _defaultValue, _colon);

    this.inputRef = React.createRef();
    this.state = {
      value: validatedTime,
      cursorPosition: 0,
      _colon,
      _showSeconds,
      _showMillis,
      _defaultValue,
      _maxLength: _defaultValue.length
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onKeyDowned = this.onKeyDowned.bind(this);
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (this.props.value && this.props.value !== this.state.value && prevState.value !== this.props.value) {
      const [validatedTime, validatedCursorPosition] = validateTimeAndCursor(
        this.state._showSeconds,
        this.state._showMillis,
        this.props.value,
        this.state._defaultValue,
        this.state._colon,
        this.state.cursorPosition
      );
      if (validatedTime !== this.state.value) {
        this.setState({value: validatedTime, cursorPosition: this.state.cursorPosition}, () => {
          if (this.inputRef.current) {
            this.inputRef.current.selectionStart = validatedCursorPosition;
            this.inputRef.current.selectionEnd = validatedCursorPosition;
          }
        });
      }
    }
  }

  onInputChange(event: ChangeEvent<HTMLInputElement>, callback: onChangeType): void {
    const oldValue = this.state.value;
    const inputEl = event.target;
    const inputValue = inputEl.value;
    const position = inputEl.selectionEnd || 0;
    const isTyped = inputValue.length > oldValue.length;
    const cursorCharacter = inputValue[position - 1];
    const addedCharacter = isTyped ? cursorCharacter : null;
    const removedCharacter = isTyped ? null : oldValue[position];
    const replacedSingleCharacter = inputValue.length === oldValue.length ? oldValue[position - 1] : null;
    const colon = this.state._colon;
    const dot = DEFAULT_DOT;

    let newValue = oldValue;
    let newPosition = position;

    if (addedCharacter !== null) {
      if (position > this.state._maxLength) {
        newPosition = this.state._maxLength;
      } else if ((position === 3 || position === 6) && addedCharacter === colon) {
        newValue = `${inputValue.substr(0, position - 1)}${colon}${inputValue.substr(position + 1)}`;
      } else if ((position === 3 || position === 6) && isNumber(addedCharacter)) {
        newValue = `${inputValue.substr(0, position - 1)}${colon}${addedCharacter}${inputValue.substr(position + 2)}`;
        newPosition = position + 1;
      } else if (position === 9 && addedCharacter === dot) {
        newValue = `${inputValue.substr(0, position - 1)}${dot}${inputValue.substr(position + 1)}`;
      } else if (position === 9 && isNumber(addedCharacter)) {
        newValue = `${inputValue.substr(0, position - 1)}${dot}${addedCharacter}${inputValue.substr(position + 2)}`;
        newPosition = position + 1;
      } else if (isNumber(addedCharacter)) {
        // user typed a number
        newValue = inputValue.substr(0, position - 1) + addedCharacter + inputValue.substr(position + 1);
        if (position === 2 || position === 5) {
          newPosition = position + 1;
        }
      } else {
        // if user typed NOT a number, then keep old value & position
        newPosition = position - 1;
      }
    } else if (replacedSingleCharacter !== null) {
      // user replaced only a single character
      if (isNumber(cursorCharacter)) {
        if (position - 1 === 2 || position - 1 === 5) {
          newValue = `${inputValue.substr(0, position - 1)}${colon}${inputValue.substr(position)}`;
        } else {
          newValue = inputValue;
        }
      } else {
        // user replaced a number on some non-number character
        newValue = oldValue;
        newPosition = position - 1;
      }
    } else if (
      typeof cursorCharacter !== 'undefined' &&
      cursorCharacter !== colon &&
      cursorCharacter !== dot &&
      !isNumber(cursorCharacter)
    ) {
      // set of characters replaced by non-number
      newValue = oldValue;
      newPosition = position - 1;
    } else if (removedCharacter !== null) {
      if ((position === 2 || position === 5) && removedCharacter === colon) {
        newValue = `${inputValue.substr(0, position - 1)}0${colon}${inputValue.substr(position)}`;
        newPosition = position - 1;
      } else if (position === 8 && removedCharacter === dot) {
        newValue = `${inputValue.substr(0, position - 1)}0${dot}${inputValue.substr(position)}`;
        newPosition = position - 1;
      } else {
        // user removed a number
        newValue = `${inputValue.substr(0, position)}0${inputValue.substr(position)}`;
      }
    }

    const [validatedTime, validatedCursorPosition] = validateTimeAndCursor(
      this.state._showSeconds,
      this.state._showMillis,
      newValue,
      oldValue,
      colon,
      newPosition
    );

    this.setState({value: validatedTime, cursorPosition: newPosition}, () => {
      inputEl.selectionStart = validatedCursorPosition;
      inputEl.selectionEnd = validatedCursorPosition;
      callback(event, validatedTime);
    });

    event.persist();
  }

  onKeyDowned(event: KeyboardEvent<HTMLInputElement>, callback: onChangeType): void {
    const keyCode = event.keyCode;
    const isUpArrow = keyCode === UP_ARROW_KEY_CODE;
    const isDownArrow = keyCode === DOWN_ARROW_KEY_CODE;
    if (isUpArrow || isDownArrow) {
      const oldValue = this.state.value;
      const inputEl = event.target as HTMLInputElement;
      const position = inputEl.selectionEnd || 0;
      const colon = this.state._colon;
      const showMillis = this.state._showMillis;
      let [hours, minutes, seconds, millis] = oldValue.split(colon);
      if (showMillis && seconds) {
        [seconds, millis] = seconds.split(DEFAULT_DOT);
      }

      let newValue = oldValue;
      let newPosition = position;

      event.preventDefault(); // prevents cursor moving to beginning or end of input
      if (position > this.state._maxLength) {
        newPosition = this.state._maxLength;
      } else if (position < 3) {
        // hours
        newValue = `${increment(hours, isUpArrow ? 1 : -1)}${oldValue.substr(2)}`;
      } else if (position >= 3 && position < 6) {
        // minutes
        newValue = `${oldValue.substr(0, 3)}${increment(minutes, isUpArrow ? 1 : -1)}${oldValue.substr(5)}`;
      } else if (position >= 6 && position < 9) {
        // seconds
        newValue = `${oldValue.substr(0, 6)}${increment(seconds, isUpArrow ? 1 : -1)}${oldValue.substr(8)}`;
      } else {
        // millis
        newValue = `${oldValue.substr(0, 9)}${increment(millis, isUpArrow ? 100 : -100)}`;
      }

      const [validatedTime, validatedCursorPosition] = validateTimeAndCursor(
        this.state._showSeconds,
        this.state._showMillis,
        newValue,
        oldValue,
        colon,
        newPosition
      );
      this.setState({value: validatedTime, cursorPosition: newPosition}, () => {
        inputEl.selectionStart = validatedCursorPosition;
        inputEl.selectionEnd = validatedCursorPosition;
        const changeEvent = event as SyntheticEvent<HTMLInputElement>;
        callback(changeEvent, validatedTime);
      });
    }
    event.persist();
  }

  render(): ReactElement {
    const {value} = this.state;
    const {onChange, className, style, showSeconds, showMillis, input, colon, ...props} = this.props; //eslint-disable-line no-unused-vars
    const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) =>
      this.onInputChange(event, (e: SyntheticEvent<HTMLInputElement>, v: string) => onChange && onChange(e, v));
    const onKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) =>
      this.onKeyDowned(event, (e: SyntheticEvent<HTMLInputElement>, v: string) => onChange && onChange(e, v));

    if (input) {
      return React.cloneElement(input, {
        ...props,
        value,
        className,
        style,
        onChange: onChangeHandler,
        onKeyDown: onKeyDownHandler
      });
    }

    return (
      <input
        ref={this.inputRef}
        type="text"
        {...props}
        value={value}
        onChange={onChangeHandler}
        onKeyDown={onKeyDownHandler}
        className={className}
        style={style}
      />
    );
  }
}
