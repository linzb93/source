import isMap from 'lodash/isMap';
import { DEFAULT_NAMESPACE, ACTION_TYPE_DELIMITER } from '../constants';
import ownKeys from './ownKeys';

// Map获取属性值只能通过get，而object可以通过[]的方式
function get(key, x) {
  return isMap(x) ? x.get(key) : x[key];
}

export default predicate =>
  function flatten(
    map,
    { namespace = DEFAULT_NAMESPACE, prefix } = {},
    partialFlatMap = {},
    partialFlatActionType = ''
  ) {
    function connectNamespace(type) {
      if (!partialFlatActionType) return type;
      const types = type.toString().split(ACTION_TYPE_DELIMITER);
      const partials = partialFlatActionType.split(ACTION_TYPE_DELIMITER);
      return []
        .concat(...partials.map(p => types.map(t => `${p}${namespace}${t}`)))
        .join(ACTION_TYPE_DELIMITER);
    }

    function connectPrefix(type) {
      if (partialFlatActionType || !prefix) {
        return type;
      }

      return `${prefix}${namespace}${type}`;
    }

    ownKeys(map).forEach(type => {
      const nextNamespace = connectPrefix(connectNamespace(type));
      const mapValue = get(type, map);

      if (predicate(mapValue)) {
        /**
         * 平铺一个Object里面的，这里的flatten是deep flatten
         * 一般是不会到这里的，都是进入else分支。什么情况会到这里？
         * 就是像这样的：
         * {
         *    "a":{
         *        "b": {
         *            "c": mapValue
         *        }
         *    }
         * }
         */
        flatten(mapValue, { namespace, prefix }, partialFlatMap, nextNamespace);
      } else {
        partialFlatMap[nextNamespace] = mapValue;
      }
    });

    return partialFlatMap;
  };
