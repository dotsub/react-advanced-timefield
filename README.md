# react-advanced-timefield

Advanced react time input field. Based out of the [Simple React time input field](https://github.com/antonfisher/react-simple-timefield).

[![Build Status](https://travis-ci.org/dotsub/react-advanced-timefield.svg?branch=master)](https://travis-ci.org/dotsub/react-advanced-timefield)
[![Coverage Status](https://coveralls.io/repos/github/dotsub/react-advanced-timefield/badge.svg?branch=master)](https://coveralls.io/github/dotsub/react-advanced-timefield?branch=master)
[![npm](https://img.shields.io/npm/dt/react-advanced-timefield.svg?colorB=brightgreen)](https://www.npmjs.com/package/react-advanced-timefield)
[![npm](https://img.shields.io/npm/v/react-advanced-timefield.svg?colorB=brightgreen)](https://www.npmjs.com/package/react-advanced-timefield)
[![GitHub license](https://img.shields.io/github/license/dotsub/react-advanced-timefield.svg)](https://github.com/dotsub/react-advanced-timefield/blob/master/LICENSE)

## Differences with react-simple-timefield

- Added milliseconds support with `showMillis` property
- Removed 24 hour limit (new limit is 99)
- Added up/down arrow support to increase or decrease based on cursor position
- Added className property to receive css classes
- Added TypeScript compatibility
- Added `minValue` and `maxValue` properties

## Installation
```bash
npm install --save react-advanced-timefield

#for React <16 use: npm install --save react-advanced-timefield@1
```

## Usage
```jsx
import TimeField from 'react-advanced-timefield';
...
<TimeField
    value={time}                       // {String}   required, format '00:00' or '00:00:00'
    minValue={time}                    // {String}   optional, format '00:00' or '00:00:00'
    maxValue={time}                    // {String}   optional, format '00:00' or '00:00:00'
    onChange={(event, value) => {...}} // {Function} required
    input={<MyCustomInputElement />}   // {Element}  default: <input type="text" />
    colon=":"                          // {String}   default: ":"
    showSeconds                        // {Boolean}  default: false
    showMillis                         // {Boolean}  default: false
/>
```

## Real world example
```jsx
import TimeField from 'react-advanced-timefield';

class App extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      time: '12:34'
    };

    this.onTimeChange = this.onTimeChange.bind(this);
  }

  onTimeChange(event, time) {
    this.setState({time});
  }

  render() {
    const {time} = this.state;

    return (
      <TimeField value={time} onChange={this.onTimeChange} />
    );
  }
}
```

#### Run demo:
For running demo locally, replace:
```javascript
import TimeField from '../';
// to
import TimeField from '../src';
```
in `demo/index.tsx` file.

```bash
# run development mode
cd demo
npm run dev
```

#### Build:
```bash
npm test
npm run format
npm run build
```

## License
MIT License. Free use and change.
