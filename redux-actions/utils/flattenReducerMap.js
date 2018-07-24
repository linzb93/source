import isPlainObject from 'lodash/isPlainObject';
import isMap from 'lodash/isMap';
import hasGeneratorInterface from './hasGeneratorInterface';
import flattenWhenNode from './flattenWhenNode';

export default flattenWhenNode(
  /**
   * 这里解释下为什么要补上判断 hasGeneratorInterface(node)
   * hasGeneratorInterface(node)为true的条件是：
   * map的每一项，它的所有属性组成的数组，只能由throw和next组成。
   * 假如hasGeneratorInterface(node)为false，表示上面形成的这个数组还有其他元素，所以还要平铺
   * 因此handleActions的每一项只能由next和throw这两个函数组成，不能再包含其他的。
   */
  node => (isPlainObject(node) || isMap(node)) && !hasGeneratorInterface(node)
);
