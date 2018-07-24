import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import isEmpty from 'lodash/isEmpty';
import toString from 'lodash/toString';
import isSymbol from 'lodash/isSymbol';
import invariant from 'invariant';
import { ACTION_TYPE_DELIMITER } from './constants';

function isValidActionType(type) {
  return isString(type) || isFunction(type) || isSymbol(type);
}

function isValidActionTypes(types) {
  if (isEmpty(types)) {
    return false;
  }
  return types.every(isValidActionType);
}

export default function combineActions(...actionsTypes) {
  /**
   * 这个函数是用来合并有相同reducers逻辑的多个action.
   * combineActions是由一个个createAction的返回值组成的。
   */
  invariant(
    isValidActionTypes(actionsTypes),
    'Expected action types to be strings, symbols, or action creators'
  );
  const combinedActionType = actionsTypes
    .map(toString)
    /**
     * 这里调用join方法是把所有actionType的name拼接在一起
     * 然后在 utils/flattenWhenNode.js 文件中的connectNamespace函数里面会再拆分
     * 成一个个actionHandler。
     */
    .join(ACTION_TYPE_DELIMITER);
  return { toString: () => combinedActionType };
}
