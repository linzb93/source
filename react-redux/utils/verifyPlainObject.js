import isPlainObject from './isPlainObject'
import warning from './warning'

// 验证是否是PlainObject
export default function verifyPlainObject(value, displayName, methodName) {
  if (!isPlainObject(value)) {
    warning(
      `${methodName}() in ${displayName} must return a plain object. Instead received ${value}.`
    )
  }
}
