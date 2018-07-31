function defaultEqualityCheck(a, b) {
  return a === b
}
/**
 * 判断两个数组是否浅相等
 * @param {Function} equalityCheck 判断二者相等的函数
 * @param {Array} prev 
 * @param {Array} next 
 */
function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  const length = prev.length
  for (let i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false
    }
  }

  return true
}

// 默认的存储函数
export function defaultMemoize(func, equalityCheck = defaultEqualityCheck) {
  let lastArgs = null
  let lastResult = null

  return function () {
    // 每次调用函数时会跟lastArgs比较，如果相同，则直接返回lastResult，否则lastResult要计算一遍再返回。
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments)
    }

    lastArgs = arguments
    return lastResult
  }
}

function getDependencies(funcs) {
  // 要求传入的数组元素都是函数。返回参数或参数的第一个元素，类型是数组。
  const dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs

  if (!dependencies.every(dep => typeof dep === 'function')) {
    const dependencyTypes = dependencies.map(
      dep => typeof dep
    ).join(', ')
    throw new Error(
      'Selector creators expect all input-selectors to be functions, ' +
      `instead received the following types: [${dependencyTypes}]`
    )
  }

  return dependencies
}
/**
 * 
 * @param {Function} memoize 记忆函数
 * @param {any} memoizeOptions 需要用到的参数
 */
export function createSelectorCreator(memoize, ...memoizeOptions) {
  /**
   * createSelector的使用demo:
   * 
   * const shop = item => item.shop;
   * const shopSelector = createSelector(shop, item => item * 2);
   * shopSelector({shop: 3}); //输出6
   * 
   * 原理：
   * 1. 获取前面n-1个函数参数并执行，函数的参数就是selector函数的参数；
   * 2. 将上面的结果作为参数传入createSelector的最后一个函数参数并执行，输出结果。
   */
  return (...funcs) => {
    let recomputations = 0
    const resultFunc = funcs.pop()
    const dependencies = getDependencies(funcs) // 这里的dependencies已经排除funcs数组的最后一个item了
    
    /**
     * 计数器+1，执行最后一个函数。
     */
    const memoizedResultFunc = memoize(
      function () {
        recomputations++
        return resultFunc.apply(null, arguments)
      },
      ...memoizeOptions
    )

    // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.
    const selector = memoize(function () {
      const params = []
      const length = dependencies.length

      for (let i = 0; i < length; i++) {
        // 这里的arguments不是空的，因为这个是在defaultMemoize函数return的函数当中执行。
        params.push(dependencies[i].apply(null, arguments))
      }

      return memoizedResultFunc.apply(null, params)
    })

    selector.resultFunc = resultFunc
    selector.dependencies = dependencies
    selector.recomputations = () => recomputations
    selector.resetRecomputations = () => recomputations = 0
    return selector
  }
}

// 这个是最常用的。
export const createSelector = createSelectorCreator(defaultMemoize)

/**
 * 由多个selector组成，返回一个Object。
 * 和createSelector不同，createSelector可能返回一个具体值，因为无法知道传入的key，
 * 而createStructuredSelector就知道传入的key是什么，所以返回的是一个Object。
 * createStructuredSelector返回的Object的key和selectors的key一一对应。
 * @param {Object} selectors 
 * @param {Function} selectorCreator 
 */
export function createStructuredSelector(selectors, selectorCreator = createSelector) {
  // selectors建议是Object，而不是Array
  if (typeof selectors !== 'object') {
    throw new Error(
      'createStructuredSelector expects first argument to be an object ' +
      `where each property is a selector, instead received a ${typeof selectors}`
    )
  }
  const objectKeys = Object.keys(selectors)
  return selectorCreator(
    objectKeys.map(key => selectors[key]),
    (...values) => {
      return values.reduce((composition, value, index) => {
        composition[objectKeys[index]] = value
        return composition
      }, {})
    }
  )
}
