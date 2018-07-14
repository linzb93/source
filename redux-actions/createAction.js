import identity from 'lodash/identity'; // 返回函数的第一个参数
import isFunction from 'lodash/isFunction';
import isNull from 'lodash/isNull';
import invariant from 'invariant'; // 在开发过程中报描述性错误，在生产环境抛出错误

export default function createAction(
  type,
  payloadCreator = identity,
  metaCreator
) {
  invariant(
    isFunction(payloadCreator) || isNull(payloadCreator),
    'Expected payloadCreator to be a function, undefined or null'
  );
  /**
   * payloadCreator转换，如果第一个参数是error，那么就返回error，否则返回本身
   */
  const finalPayloadCreator =
    isNull(payloadCreator) || payloadCreator === identity
      ? identity
      : (head, ...args) =>
          head instanceof Error ? head : payloadCreator(head, ...args);

  const hasMeta = isFunction(metaCreator);
  const typeString = type.toString();

  const actionCreator = (...args) => {
    const payload = finalPayloadCreator(...args);
    // action 就像redux中的action一样是个Object，这里除了payload，还有error和meta。
    const action = { type }; 

    if (payload instanceof Error) {
      action.error = true;
    }

    if (payload !== undefined) {
      action.payload = payload;
    }

    if (hasMeta) {
      action.meta = metaCreator(...args);
    }

    return action;
  };

  actionCreator.toString = () => typeString;

  return actionCreator;
}
