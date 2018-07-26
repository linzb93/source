import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import identity from 'lodash/identity';
import isNil from 'lodash/isNil';
import isUndefined from 'lodash/isUndefined';
import includes from 'lodash/includes';
import invariant from 'invariant';
import { ACTION_TYPE_DELIMITER } from './constants';

export default function handleAction(type, reducer = identity, defaultState) {
  /**
   * reducer 可以是和redux的reducer一样的function，
   * 也可以是一个Object，包含next和throw两个属性，默认为identity。
   */
  const types = type.toString().split(ACTION_TYPE_DELIMITER);
  invariant(
    !isUndefined(defaultState),
    `defaultState for reducer handling ${types.join(', ')} should be defined`
  );
  invariant(
    isFunction(reducer) || isPlainObject(reducer),
    'Expected reducer to be a function or object with next and throw reducers'
  );

  const [nextReducer, throwReducer] = isFunction(reducer)
    ? [reducer, reducer]
    : [reducer.next, reducer.throw].map(
        aReducer => (isNil(aReducer) ? identity : aReducer)
      );

  return (state = defaultState, action) => {
    const { type: actionType } = action;
    if (!actionType || !includes(types, actionType.toString())) {
      return state;
    }

    /**
     * 返回的就是一个普通的 reducer 了
     * reducer(state, action) => a new state
     */
    return (action.error === true ? throwReducer : nextReducer)(state, action);
  };
}
