import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    /**
     * Redux middleware的格式基本上是这样的
     * const m = ({dispatch, getState}) => next => action => {};
     * e.g:
     * const logger = ({dispatch, getState}) => next => action => {
     *      console.log('before');
     *      next(action);
     *      console.log(getState());
     *      console.log('after');
     * };
     */
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    /**
     * middleware(middlewareAPI) 返回的是 f(next)
     * next 也就是 dispatch
     * 因此 chain[i](dispatch) 返回的是 f(action)
     */
    dispatch = compose(...chain)(store.dispatch)
    /**
     * dispatch的值就是 chain[0](dispatch)，也是 f(action)
     * 在业务代码里面 dispatch 之后，是从第一个中间件开始执行的，一直到最后一个中间件，然后发送给 reducer。
     * 每个中间件的 next 就是 dispatch，也就是下一个中间件的 f(action)。
     * 最后一个中间件的 next 就是原有的 store.dispatch，此时执行 store.dispatch 就是发送给 reducer 了。
     */

    return {
      ...store,
      dispatch
    }
  }
}
