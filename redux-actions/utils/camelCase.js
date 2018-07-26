import camelCase from 'lodash/camelCase';

// 将字符串转换成camelCase，去掉两侧和中间的符号
const namespacer = '/';

export default type =>
  type.indexOf(namespacer) === -1
    ? camelCase(type)
    : type
        .split(namespacer)
        .map(camelCase)
        .join(namespacer);
