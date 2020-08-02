import { useEffect } from 'react'

/**
 * This hook takes a React reference (created by `useRef`)
 * and a function handler and then executes the handler when
 * the user touches/clicks outside of the element indicated
 * by the ref. The handler function will receive the event
 * object that triggered the execution.
 *
 * e.g.
 *
 * import { useRef } from 'react'
 * import { useOnClickOutside } = './path/useOnClickOutside'
 *
 * const onClose = () => console.log("onClose triggered")
 *
 * const MyDiv = () => {
 *   const ref = useRef()
 *   useOnClickOutside(ref, onClose)
 *
 *   return (
 *     <div ref={ref}>
 *     </div>
 *   )
 * }
 *
 * Hook source - https://usehooks.com/useOnClickOutside/
 *
 * @param ref     - React reference for element to watch for clicks outside.
 * @param handler - Function to execute when a click outside is registered.
 */
export const useOnClickOutside = (ref, handler) => {
  // Execute the following when the reference or handler update.
  useEffect(
    () => {
      const listener = (event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return
        }
        // Run handler, passing down the event object.
        handler(event)
      }
      // Attach listener to global document events.
      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)

      return () => {
        // Remove event listeners when component is unmounted.
        document.removeEventListener('mousedown', listener)
        document.removeEventListener('touchstart', listener)
      }
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  )
}
