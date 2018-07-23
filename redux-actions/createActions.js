import identity from 'lodash/identity';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import last from 'lodash/last';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil'; // 检查一个值是否为null或undefined
import invariant from 'invariant';
import camelCase from './utils/camelCase';
import arrayToObject from './utils/arrayToObject';
import flattenActionMap from './utils/flattenActionMap';
import unflattenActionCreators from './utils/unflattenActionCreators';
import createAction from './createAction';
import { DEFAULT_NAMESPACE } from './constants';

export default function createActions(actionMap, ...identityActions) {
  const options = isPlainObject(last(identityActions))
    ? identityActions.pop()
    : {};
  invariant(
    identityActions.every(isString) &&
      (isString(actionMap) || isPlainObject(actionMap)),
    'Expected optional object followed by string action types'
  );

  // 这里是说可以没有actionMap,只有identityActions,数量可以不止一个
  if (isString(actionMap)) {
    return actionCreatorsFromIdentityActions(
      [actionMap, ...identityActions],
      options
    );
  }
  return {
    ...actionCreatorsFromActionMap(actionMap, options),
    ...actionCreatorsFromIdentityActions(identityActions, options)
  };
}

/**
 * 
 * @param {Array} actionMap createActions的第一个参数
 * @param {Object} options createActions的最后一个Object，或者为空。配置项。
 */
function actionCreatorsFromActionMap(actionMap, options) {
  const flatActionMap = flattenActionMap(actionMap, options);
  const flatActionCreators = actionMapToActionCreators(flatActionMap);
  /**
   * flattenActionMap 和 unflattenActionCreators 互为反操作，一个是平铺，一个是还原
   */
  return unflattenActionCreators(flatActionCreators, options);
}

/**
 * 
 * @param {Array} actionMap 
 * @param {Object} param1 配置项，包含prefix和namespace两个属性
 */
function actionMapToActionCreators(
  actionMap,
  { prefix, namespace = DEFAULT_NAMESPACE } = {}
) {
  function isValidActionMapValue(actionMapValue) {
    // 可以是函数，或者null,undefined
    if (isFunction(actionMapValue) || isNil(actionMapValue)) {
      return true;
    }

    // 可以是数组，但是要有payload和meta，格式如下
    if (isArray(actionMapValue)) {
      const [payload = identity, meta] = actionMapValue;
      return isFunction(payload) && isFunction(meta);
    }

    return false;
  }

  return arrayToObject(
    Object.keys(actionMap),
    (partialActionCreators, type) => {
      const actionMapValue = actionMap[type];
      invariant(
        isValidActionMapValue(actionMapValue),
        'Expected function, undefined, null, or array with payload and meta ' +
          `functions for ${type}`
      );
      const prefixedType = prefix ? `${prefix}${namespace}${type}` : type;
      const actionCreator = isArray(actionMapValue)
        // createAction(type, payloadTransformer, metaFunc);
        ? createAction(prefixedType, ...actionMapValue)
        // 如果actionMapValue是函数，那就是payloadTransformer。actionMapValue也可以为空。
        : createAction(prefixedType, actionMapValue);
      return { ...partialActionCreators, [type]: actionCreator };
    }
  );
}

/**
 * 
 * @param {Array} identityActions 所有的identity函数转换组成的数组
 * @param {Object} options createActions的最后一个Object，或者为空。配置项。
 * @returns {Object}
 */
function actionCreatorsFromIdentityActions(identityActions, options) {
  /**
   * 数组转换成一个对象
   * {
   *    [item]: identity
   *    ...
   * }
   */
  const actionMap = arrayToObject(
    identityActions,
    (partialActionMap, type) => ({ ...partialActionMap, [type]: identity })
  );
  const actionCreators = actionMapToActionCreators(actionMap, options);
  return arrayToObject(
    Object.keys(actionCreators),
    (partialActionCreators, type) => ({
      ...partialActionCreators,
      // 这里只是转换大小写
      [camelCase(type)]: actionCreators[type]
    })
  );
}
