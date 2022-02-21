import 'jsdom-global/register';
import React from 'react';
import {shallow, mount, ReactWrapper} from 'enzyme';
import TimeField from '../src/index';

describe('Component', () => {
  let a: ReactWrapper | null;
  let b: ReactWrapper | null;
  let c: ReactWrapper | null;
  let persist: jest.Mock;
  let preventDefault: jest.Mock;
  let onChangeA: jest.Mock;
  let onChangeB: jest.Mock;
  let onChangeC: jest.Mock;
  const upArrowKeyCode = 38;
  const downArrowKeyCode = 40;
  const ctrlKeyCode = 17;
  const altKeyCode = 18;

  beforeEach(() => {
    persist = jest.fn();
    preventDefault = jest.fn();
    onChangeA = jest.fn();
    onChangeB = jest.fn();
    onChangeC = jest.fn();
    a = mount(<TimeField value={'12:34'} onChange={onChangeA} />);
    b = mount(<TimeField value={'12:34:56'} onChange={onChangeB} showSeconds />);
    c = mount(<TimeField value={'12:34:56.789'} onChange={onChangeC} showSeconds showMillis />);
  });

  afterEach(() => {
    if (a) {
      a?.unmount();
    }
    a = null;

    if (b) {
      b?.unmount();
    }
    b = null;

    if (c) {
      c?.unmount();
    }
    c = null;
  });

  test('should render input field', () => {
    expect(a?.find('input')).toHaveLength(1);
    expect(b?.find('input')).toHaveLength(1);
    expect(c?.find('input')).toHaveLength(1);
  });

  test('should render custom input field', () => {
    const customInput = shallow(<TimeField value={'12:34'} onChange={onChangeA} input={<input id="lol" />} />);

    expect(customInput.find('input')).toHaveLength(1);
    expect(customInput.find('input').getElement().props.id).toEqual('lol');
  });

  test('should render custom styles', () => {
    const customStyle = shallow(<TimeField value={'12:34'} onChange={onChangeA} style={{width: '150px'}} />);

    expect(customStyle.find('input').getElement().props.style).toEqual({width: '150px'});
  });

  test('should render custom class names', () => {
    const customClassName = shallow(<TimeField value={'12:34'} onChange={onChangeA} className="class-1 class-2" />);

    expect(customClassName.find('input').getElement().props.className).toEqual('class-1 class-2');
  });

  test('should render custom class names and styles', () => {
    const customClassNameStlye = shallow(
      <TimeField value={'12:34'} onChange={onChangeA} className="class-1 class-2" style={{width: '150px'}} />
    );

    expect(customClassNameStlye.find('input').getElement().props.style).toEqual({width: '150px'});
    expect(customClassNameStlye.find('input').getElement().props.className).toEqual('class-1 class-2');
  });

  test('should render time value from props', () => {
    expect(a?.find('input').getElement().props.value).toEqual('12:34');
    expect(b?.find('input').getElement().props.value).toEqual('12:34:56');
    expect(c?.find('input').getElement().props.value).toEqual('12:34:56.789');
  });

  test('should render reserved props', () => {
    expect(a?.setProps({value: '21:43'}).state('value')).toEqual('21:43');
    expect(b?.setProps({value: '21:43:13'}).state('value')).toEqual('21:43:13');
    expect(c?.setProps({value: '21:43:13.896'}).state('value')).toEqual('21:43:13.896');
  });

  test('should keep old values w/o changes', () => {
    expect(a?.setProps({value: '12:34'}).state('value')).toEqual('12:34');
    expect(b?.setProps({value: '12:34:56'}).state('value')).toEqual('12:34:56');
    expect(c?.setProps({value: '12:34:56.789'}).state('value')).toEqual('12:34:56.789');
  });

  test('should validate reserved props before render', () => {
    expect(a?.setProps({value: '100:60'}).state('value')).toEqual('00:00');
    expect(b?.setProps({value: '100:60:90'}).state('value')).toEqual('00:00:00');
    expect(c?.setProps({value: '100:60:90.999'}).state('value')).toEqual('00:00:00.999');
  });

  test('should validate value after input change', () => {
    const eventA = {target: {value: '12:34'}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34:56'}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56.789'}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle added number character', () => {
    const eventA = {target: {value: '212:34', selectionEnd: 1}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('22:34');

    const eventB = {target: {value: '12:34:156', selectionEnd: 7}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:16');

    const eventC = {target: {value: '12:34:56.1789', selectionEnd: 10}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.189');
  });

  test('should handle added ":" character', () => {
    const eventA = {target: {value: '12::34', selectionEnd: 3}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34::56', selectionEnd: 6}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34::56.789', selectionEnd: 6}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle added "." character', () => {
    const eventC = {target: {value: '12:34:56..789', selectionEnd: 9}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle added number character before ":"', () => {
    const eventA = {target: {value: '121:34', selectionEnd: 3}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:14');

    const eventB = {target: {value: '12:341:56', selectionEnd: 6}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:16');

    const eventC = {target: {value: '12:341:56.789', selectionEnd: 6}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:16.789');
  });

  test('should handle added number character before "."', () => {
    const eventC = {target: {value: '12:34:568.789', selectionEnd: 9}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.889');
  });

  test('should handle added number character before ":" (update position)', () => {
    const eventA = {target: {value: '132:34', selectionEnd: 2}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('13:34');

    const eventB = {target: {value: '12:334:56', selectionEnd: 5}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:33:56');

    const eventC = {target: {value: '12:334:56.789', selectionEnd: 5}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:33:56.789');
  });

  test('should handle added number character before "." (update position)', () => {
    const eventC = {target: {value: '12:34:576.789', selectionEnd: 8}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:57.789');
  });

  test('should keep old value if position is out of range', () => {
    const eventA = {target: {value: '12:341', selectionEnd: 6}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34:561', selectionEnd: 9}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56.7891', selectionEnd: 13}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should keep old value if not a number was typed', () => {
    const eventA = {target: {value: 'a12:34', selectionEnd: 1}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34:a56', selectionEnd: 7}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56.a789', selectionEnd: 10}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle removed character', () => {
    const eventA = {target: {value: '1:34', selectionEnd: 1}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('10:34');

    const eventB = {target: {value: '12:34:6', selectionEnd: 6}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:06');

    const eventC = {target: {value: '12:34:56.89', selectionEnd: 9}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.089');
  });

  test('should handle removed ":" character', () => {
    const eventA = {target: {value: '1234', selectionEnd: 2}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('10:34');

    const eventB = {target: {value: '12:3456', selectionEnd: 5}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:30:56');

    const eventC = {target: {value: '12:3456.789', selectionEnd: 5}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:30:56.789');
  });

  test('should handle removed "." character', () => {
    const eventC = {target: {value: '12:34:56789', selectionEnd: 8}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:50.789');
  });

  test('should handle single character replacement', () => {
    const eventA = {target: {value: '12:44', selectionEnd: 4}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:44');

    const eventB = {target: {value: '12:34:46', selectionEnd: 7}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:46');

    const eventC = {target: {value: '12:34:56.489', selectionEnd: 10}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.489');
  });

  test('should handle single ":" character replacement', () => {
    const eventA = {target: {value: '12a34', selectionEnd: 3}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34a56', selectionEnd: 6}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34a56.789', selectionEnd: 9}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle single "." character replacement', () => {
    const eventC = {target: {value: '12:34:56a789', selectionEnd: 9}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle more than 2 characters replacement (number)', () => {
    const eventA = {target: {value: '12:2', selectionEnd: 4}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:20');

    const eventB = {target: {value: '12:34:2', selectionEnd: 7}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:20');

    const eventC = {target: {value: '12:34:56.2', selectionEnd: 10}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.200');
  });

  test('should handle 2 characters replacement (invalid character)', () => {
    const eventA = {target: {value: '12:a', selectionEnd: 4}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34:a', selectionEnd: 7}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56.a9', selectionEnd: 10}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle more than 2 characters replacement (invalid character)', () => {
    const eventA = {target: {value: '12a', selectionEnd: 3}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34a', selectionEnd: 6}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56a', selectionEnd: 9}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle all characters replacement (invalid character)', () => {
    const eventA = {target: {value: 'a', selectionEnd: 1}, persist};
    expect(a?.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: 'a', selectionEnd: 1}, persist};
    expect(b?.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: 'a', selectionEnd: 1}, persist};
    expect(c?.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle up arrow key in hours position', () => {
    const eventA = {keyCode: upArrowKeyCode, target: {selectionEnd: 1}, persist, preventDefault};
    expect(a?.simulate('keyDown', eventA).state('value')).toEqual('13:34');

    const eventB = {keyCode: upArrowKeyCode, target: {selectionEnd: 1}, persist, preventDefault};
    expect(b?.simulate('keyDown', eventB).state('value')).toEqual('13:34:56');

    const eventC = {keyCode: upArrowKeyCode, target: {selectionEnd: 1}, persist, preventDefault};
    expect(c?.simulate('keyDown', eventC).state('value')).toEqual('13:34:56.789');
  });

  test('should handle up arrow key in hours position on max limit', () => {
    const input = shallow(<TimeField value={'99:34:56.789'} onChange={onChangeC} showSeconds showMillis />);

    const eventC = {keyCode: upArrowKeyCode, target: {selectionEnd: 0}, persist, preventDefault};
    expect(input.simulate('keyDown', eventC).state('value')).toEqual('99:34:56.789');
  });

  test('should handle up arrow key in minutes position', () => {
    const eventA = {keyCode: upArrowKeyCode, target: {selectionEnd: 4}, persist, preventDefault};
    expect(a?.simulate('keyDown', eventA).state('value')).toEqual('12:35');

    const eventB = {keyCode: upArrowKeyCode, target: {selectionEnd: 4}, persist, preventDefault};
    expect(b?.simulate('keyDown', eventB).state('value')).toEqual('12:35:56');

    const eventC = {keyCode: upArrowKeyCode, target: {selectionEnd: 4}, persist, preventDefault};
    expect(c?.simulate('keyDown', eventC).state('value')).toEqual('12:35:56.789');
  });

  test('should handle up arrow key in minutes position on max limit', () => {
    const input = shallow(<TimeField value={'12:59:56.789'} onChange={onChangeC} showSeconds showMillis />);

    const eventC = {keyCode: upArrowKeyCode, target: {selectionEnd: 5}, persist, preventDefault};
    expect(input.simulate('keyDown', eventC).state('value')).toEqual('12:59:56.789');
  });

  test('should handle up arrow key in seconds position', () => {
    const eventB = {keyCode: upArrowKeyCode, target: {selectionEnd: 7}, persist, preventDefault};
    expect(b?.simulate('keyDown', eventB).state('value')).toEqual('12:34:57');

    const eventC = {keyCode: upArrowKeyCode, target: {selectionEnd: 7}, persist, preventDefault};
    expect(c?.simulate('keyDown', eventC).state('value')).toEqual('12:34:57.789');
  });

  test('should handle up arrow key in minutes position on max limit', () => {
    const input = shallow(<TimeField value={'12:34:59.789'} onChange={onChangeC} showSeconds showMillis />);

    const eventC = {keyCode: upArrowKeyCode, target: {selectionEnd: 8}, persist, preventDefault};
    expect(input.simulate('keyDown', eventC).state('value')).toEqual('12:34:59.789');
  });

  test('should handle up arrow key in millis position', () => {
    const eventC = {keyCode: upArrowKeyCode, target: {selectionEnd: 9}, persist, preventDefault};
    expect(c?.simulate('keyDown', eventC).state('value')).toEqual('12:34:56.889');
  });

  test('should handle up arrow key in millis position on max limit', () => {
    const input = shallow(<TimeField value={'12:34:56.999'} onChange={onChangeC} showSeconds showMillis />);

    const eventC = {keyCode: upArrowKeyCode, target: {selectionEnd: 10}, persist, preventDefault};
    expect(input.simulate('keyDown', eventC).state('value')).toEqual('12:34:56.999');
  });

  test('should handle down arrow key in hours position', () => {
    const eventA = {keyCode: downArrowKeyCode, target: {selectionEnd: 1}, persist, preventDefault};
    expect(a?.simulate('keyDown', eventA).state('value')).toEqual('11:34');

    const eventB = {keyCode: downArrowKeyCode, target: {selectionEnd: 1}, persist, preventDefault};
    expect(b?.simulate('keyDown', eventB).state('value')).toEqual('11:34:56');

    const eventC = {keyCode: downArrowKeyCode, target: {selectionEnd: 1}, persist, preventDefault};
    expect(c?.simulate('keyDown', eventC).state('value')).toEqual('11:34:56.789');
  });

  test('should handle down arrow key in hours position on min limit', () => {
    const input = shallow(<TimeField value={'00:34:56.999'} onChange={onChangeC} showSeconds showMillis />);

    const eventC = {keyCode: downArrowKeyCode, target: {selectionEnd: 2}, persist, preventDefault};
    expect(input.simulate('keyDown', eventC).state('value')).toEqual('00:34:56.999');
  });

  test('should handle down arrow key in minutes position', () => {
    const eventA = {keyCode: downArrowKeyCode, target: {selectionEnd: 4}, persist, preventDefault};
    expect(a?.simulate('keyDown', eventA).state('value')).toEqual('12:33');

    const eventB = {keyCode: downArrowKeyCode, target: {selectionEnd: 4}, persist, preventDefault};
    expect(b?.simulate('keyDown', eventB).state('value')).toEqual('12:33:56');

    const eventC = {keyCode: downArrowKeyCode, target: {selectionEnd: 4}, persist, preventDefault};
    expect(c?.simulate('keyDown', eventC).state('value')).toEqual('12:33:56.789');
  });

  test('should handle down arrow key in minutes position on min limit', () => {
    const input = shallow(<TimeField value={'12:00:56.999'} onChange={onChangeC} showSeconds showMillis />);

    const eventC = {keyCode: downArrowKeyCode, target: {selectionEnd: 5}, persist, preventDefault};
    expect(input.simulate('keyDown', eventC).state('value')).toEqual('12:00:56.999');
  });

  test('should handle down arrow key in seconds position', () => {
    const eventB = {keyCode: downArrowKeyCode, target: {selectionEnd: 7}, persist, preventDefault};
    expect(b?.simulate('keyDown', eventB).state('value')).toEqual('12:34:55');

    const eventC = {keyCode: downArrowKeyCode, target: {selectionEnd: 7}, persist, preventDefault};
    expect(c?.simulate('keyDown', eventC).state('value')).toEqual('12:34:55.789');
  });

  test('should handle down arrow key in seconds position on min limit', () => {
    const input = shallow(<TimeField value={'12:34:00.999'} onChange={onChangeC} showSeconds showMillis />);

    const eventC = {keyCode: downArrowKeyCode, target: {selectionEnd: 8}, persist, preventDefault};
    expect(input.simulate('keyDown', eventC).state('value')).toEqual('12:34:00.999');
  });

  test('should handle down arrow key in millis position', () => {
    const eventC = {keyCode: downArrowKeyCode, target: {selectionEnd: 9}, persist, preventDefault};
    expect(c?.simulate('keyDown', eventC).state('value')).toEqual('12:34:56.689');
  });

  test('should handle down arrow key in millis position on min limit', () => {
    const input = shallow(<TimeField value={'12:34:56.000'} onChange={onChangeC} showSeconds showMillis />);

    const eventC = {keyCode: downArrowKeyCode, target: {selectionEnd: 10}, persist, preventDefault};
    expect(input.simulate('keyDown', eventC).state('value')).toEqual('12:34:56.000');
  });

  test('should keep the cursor position after value update', () => {
    // GIVEN
    a?.setState({cursorPosition: 2});

    // WHEN
    a?.setProps({value: '21:43'});

    // THEN
    expect(a?.state('value')).toEqual('21:43');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(a?.find('input').instance().selectionEnd).toEqual(2);
  });

  test('updates state if same value is passed via properties but the internal state is different', () => {
    // GIVEN
    const eventA = {target: {value: '1:34'}, persist};
    a?.simulate('change', eventA);

    // WHEN
    a?.setProps({value: '12:34'});

    // THEN
    expect(a?.state('value')).toEqual('12:34');
  });

  test('should update state on down arrow key typed', () => {
    // GIVEN
    const eventA = {keyCode: downArrowKeyCode, target: {selectionEnd: 2}, persist, preventDefault};

    // WHEN
    a?.simulate('keyDown', eventA);

    // THEN
    expect(onChangeA).toBeCalled();
  });

  test('should update state on up arrow key typed', () => {
    // GIVEN
    const eventA = {keyCode: upArrowKeyCode, target: {selectionEnd: 2}, persist, preventDefault};

    // WHEN
    a?.simulate('keyDown', eventA);

    // THEN
    expect(onChangeA).toBeCalled();
  });

  test('should not update state on other keys typed', () => {
    // GIVEN
    const eventA1 = {keyCode: ctrlKeyCode, target: {selectionEnd: 2}, persist, preventDefault};
    const eventA2 = {keyCode: altKeyCode, target: {selectionEnd: 3}, persist, preventDefault};

    // WHEN
    a?.simulate('keyDown', eventA1);
    a?.simulate('keyDown', eventA2);

    // THEN
    expect(onChangeA).not.toBeCalled();
  });
});
