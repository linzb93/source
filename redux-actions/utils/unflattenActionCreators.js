import isEmpty from 'lodash/isEmpty';
import { DEFAULT_NAMESPACE } from '../constants';
import camelCase from './camelCase';

export default function unflattenActionCreators(
  flatActionCreators,
  { namespace = DEFAULT_NAMESPACE, prefix } = {}
) {
  function unflatten(
    flatActionType,
    partialNestedActionCreators = {},
    partialFlatActionTypePath = []
  ) {
    const nextNamespace = camelCase(partialFlatActionTypePath.shift());
    /**
     * 对于一般的 actionCreatorsMap 来说，也就是复制了一遍。
     * 这是要处理这种 map 的，例如：(假设namespace是"//")
     * {
     *    “a//b///c”: actionCreator
     * }
     * 这个将转换成：
     * {
     *    "a":{
     *        "b": {
     *            "c": actionCreator
     *        }
     *    }
     * }
     */
    if (isEmpty(partialFlatActionTypePath)) {
      partialNestedActionCreators[nextNamespace] =
        flatActionCreators[flatActionType];
    } else {
      if (!partialNestedActionCreators[nextNamespace]) {
        partialNestedActionCreators[nextNamespace] = {};
      }
      unflatten(
        flatActionType,
        partialNestedActionCreators[nextNamespace],
        partialFlatActionTypePath
      );
    }
  }

  const nestedActionCreators = {};
  Object.getOwnPropertyNames(flatActionCreators).forEach(type => {
    const unprefixedType = prefix
      ? type.replace(`${prefix}${namespace}`, '')
      : type;
    return unflatten(
      type,
      nestedActionCreators,
      // 可能某些type自带这个namespace(比如默认的'//')
      unprefixedType.split(namespace)
    );
  });

  return nestedActionCreators;
}
