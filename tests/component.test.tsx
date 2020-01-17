import React, {ReactElement} from 'react';
import {shallow, mount, ReactWrapper} from 'enzyme';
import TimeField from '../src/index';

describe('Component', () => {
  let a: ReactWrapper | null;
  let b: ReactWrapper | null;
  let c: ReactWrapper | null;
  let persist: jest.Mock;
  let onChangeA: jest.Mock;
  let onChangeB: jest.Mock;
  let onChangeC: jest.Mock;

  beforeEach(() => {
    persist = jest.fn();
    onChangeA = jest.fn();
    onChangeB = jest.fn();
    a = mount(<TimeField value={'12:34'} onChange={onChangeA} />);
    b = mount(<TimeField value={'12:34:56'} onChange={onChangeB} showSeconds />);
    c = mount(<TimeField value={'12:34:56.789'} onChange={onChangeC} showSeconds showMillis />);
  });

  afterEach(() => {
    if (a) {
      a.unmount();
    }
    a = null;

    if (b) {
      b.unmount();
    }
    b = null;

    if (c) {
      c.unmount();
    }
    c = null;
  });

  test('should render input field', () => {
    expect(a.find('input')).toHaveLength(1);
    expect(b.find('input')).toHaveLength(1);
    expect(c.find('input')).toHaveLength(1);
  });

  test('should render custom input field', () => {
    const customInput = shallow(<TimeField value={'12:34'} onChange={onChangeA} input={<input id="lol" />} />);

    expect(customInput.find('input')).toHaveLength(1);
    expect(customInput.find('input').getElement().props.id).toEqual('lol');
  });

  test('should render time value from props', () => {
    expect(a.find('input').getElement().props.value).toEqual('12:34');
    expect(b.find('input').getElement().props.value).toEqual('12:34:56');
    expect(c.find('input').getElement().props.value).toEqual('12:34:56.789');
  });

  test('should render reserved props', () => {
    expect(a.setProps({value: '21:43'}).state('value')).toEqual('21:43');
    expect(b.setProps({value: '21:43:13'}).state('value')).toEqual('21:43:13');
    expect(c.setProps({value: '21:43:13.896'}).state('value')).toEqual('21:43:13.896');
  });

  test('should keep old values w/o changes', () => {
    expect(a.setProps({value: '12:34'}).state('value')).toEqual('12:34');
    expect(b.setProps({value: '12:34:56'}).state('value')).toEqual('12:34:56');
    expect(c.setProps({value: '12:34:56.789'}).state('value')).toEqual('12:34:56.789');
  });

  test('should validate reserved props before render', () => {
    expect(a.setProps({value: '30:60'}).state('value')).toEqual('30:00');
    expect(b.setProps({value: '30:60:90'}).state('value')).toEqual('30:00:00');
    expect(c.setProps({value: '30:60:90.999'}).state('value')).toEqual('30:00:00.999');
  });

  test('should validate value after input change', () => {
    const eventA = {target: {value: '12:34'}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34:56'}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56.789'}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle added number character', () => {
    const eventA = {target: {value: '212:34', selectionEnd: 1}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('22:34');

    const eventB = {target: {value: '12:34:156', selectionEnd: 7}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:16');

    const eventC = {target: {value: '12:34:56.1789', selectionEnd: 10}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.189');
  });

  test('should handle added ":" character', () => {
    const eventA = {target: {value: '12::34', selectionEnd: 3}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34::56', selectionEnd: 6}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34::56.789', selectionEnd: 6}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle added "." character', () => {
    const eventC = {target: {value: '12:34:56..789', selectionEnd: 9}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle added number character before ":"', () => {
    const eventA = {target: {value: '121:34', selectionEnd: 3}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:14');

    const eventB = {target: {value: '12:341:56', selectionEnd: 6}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:16');

    const eventC = {target: {value: '12:341:56.789', selectionEnd: 6}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:16.789');
  });

  test('should handle added number character before "."', () => {
    const eventC = {target: {value: '12:34:568.789', selectionEnd: 9}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.889');
  });

  test('should handle added number character before ":" (update position)', () => {
    const eventA = {target: {value: '132:34', selectionEnd: 2}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('13:34');

    const eventB = {target: {value: '12:334:56', selectionEnd: 5}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:33:56');

    const eventC = {target: {value: '12:334:56.789', selectionEnd: 5}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:33:56.789');
  });

  test('should handle added number character before "." (update position)', () => {
    const eventC = {target: {value: '12:34:576.789', selectionEnd: 8}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:57.789');
  });

  test('should keep old value if position is out of range', () => {
    const eventA = {target: {value: '12:341', selectionEnd: 6}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34:561', selectionEnd: 9}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56.7891', selectionEnd: 13}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should keep old value if not a number was typed', () => {
    const eventA = {target: {value: 'a12:34', selectionEnd: 1}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34:a56', selectionEnd: 7}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56.a789', selectionEnd: 10}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle removed character', () => {
    const eventA = {target: {value: '1:34', selectionEnd: 1}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('10:34');

    const eventB = {target: {value: '12:34:6', selectionEnd: 6}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:06');

    const eventC = {target: {value: '12:34:56.89', selectionEnd: 9}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.089');
  });

  test('should handle removed ":" character', () => {
    const eventA = {target: {value: '1234', selectionEnd: 2}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('10:34');

    const eventB = {target: {value: '12:3456', selectionEnd: 5}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:30:56');

    const eventC = {target: {value: '12:3456.789', selectionEnd: 5}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:30:56.789');
  });

  test('should handle removed "." character', () => {
    const eventC = {target: {value: '12:34:56789', selectionEnd: 8}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:50.789');
  });

  test('should handle single character replacement', () => {
    const eventA = {target: {value: '12:44', selectionEnd: 4}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:44');

    const eventB = {target: {value: '12:34:46', selectionEnd: 7}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:46');

    const eventC = {target: {value: '12:34:56.489', selectionEnd: 10}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.489');
  });

  test('should handle single ":" character replacement', () => {
    const eventA = {target: {value: '12a34', selectionEnd: 3}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34a56', selectionEnd: 6}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34a56.789', selectionEnd: 9}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle single "." character replacement', () => {
    const eventC = {target: {value: '12:34:56a789', selectionEnd: 9}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle more than 2 characters replacement (number)', () => {
    const eventA = {target: {value: '12:2', selectionEnd: 4}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:20');

    const eventB = {target: {value: '12:34:2', selectionEnd: 7}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:20');

    const eventC = {target: {value: '12:34:56.2', selectionEnd: 10}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.200');
  });

  test('should handle 2 characters replacement (invalid character)', () => {
    const eventA = {target: {value: '12:a', selectionEnd: 4}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34:a', selectionEnd: 7}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56.a9', selectionEnd: 10}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle more than 2 characters replacement (invalid character)', () => {
    const eventA = {target: {value: '12a', selectionEnd: 3}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: '12:34a', selectionEnd: 6}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: '12:34:56a', selectionEnd: 9}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });

  test('should handle all characters replacement (invalid character)', () => {
    const eventA = {target: {value: 'a', selectionEnd: 1}, persist};
    expect(a.simulate('change', eventA).state('value')).toEqual('12:34');

    const eventB = {target: {value: 'a', selectionEnd: 1}, persist};
    expect(b.simulate('change', eventB).state('value')).toEqual('12:34:56');

    const eventC = {target: {value: 'a', selectionEnd: 1}, persist};
    expect(c.simulate('change', eventC).state('value')).toEqual('12:34:56.789');
  });
});
