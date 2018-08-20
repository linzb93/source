const hasOwn = Object.prototype.hasOwnProperty

function is(x, y) {
  if (x === y) {
    // x, y为数字，且不能为0
    return x !== 0 || y !== 0 || 1 / x === 1 / y
  } else {
    // 处理NaN
    return x !== x && y !== y
  }
}

export default function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true
  
  // 如果type不是object，那么可以认为是基本包装对象(字符串、数字等)，如果之前相等的没有return出去，肯定就是不相等了。
  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    // key不一一相等，或者key相同value不同的
    if (!hasOwn.call(objB, keysA[i]) ||
        !is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}
