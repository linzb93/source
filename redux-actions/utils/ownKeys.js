import isMap from 'lodash/isMap';

export default function ownKeys(object) {
  if (isMap(object)) {
    return Array.from(object.keys()); // 将Map对象的key值集合转换成数组
  }
  
  // ES6 Reflect
  if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
    // 返回object的所有属性，包括一般属性和Symbol，同第14行开始的代码
    return Reflect.ownKeys(object);
  }

  let keys = Object.getOwnPropertyNames(object);

  if (typeof Object.getOwnPropertySymbols === 'function') {
    keys = keys.concat(Object.getOwnPropertySymbols(object));
  }

  return keys;
}
