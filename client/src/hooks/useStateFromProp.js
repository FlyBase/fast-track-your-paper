import { useState, useEffect } from 'react'
/**
 * Hook to make local state dependent on a property.
 *
 * e.g.
 * import { useStateFromProp } './hooks'
 *
 * const MyComp = ({ initialValue = 'my val' }) => {
 *    const [ value, setValue ] = useStateFromProp(initialValue)
 *    return (
 *      <div>{value}</div>
 *    )
 * }
 *
 *
 * @param initialValue  The initial value to set from a prop.
 * @returns {[value, setValue]} Returns the state value and a setter for the value.
 */
export const useStateFromProp = initialValue => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => setValue(initialValue), [initialValue])
  return [value, setValue]
}
