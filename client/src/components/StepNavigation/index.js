import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'

/**
 * Arrow for the step navigation buttons.
 * @param direction - left/right
 * @param className - Required for styled-components support
 * @returns {*} - A font awesome long arrow.
 */
const Arrow = ({ direction, className }) => (
  <i className={`fa fa-long-arrow-${direction} fa-lg ${className}`} />
)
Arrow.propTypes = {
  direction: PropTypes.oneOf(['left', 'right']).isRequired,
}

/**
 * An arrow with a bit of padding on either the left or right side.
 * Right arrows get padding on the left.
 * Left arrows get padding on the right.
 */
const StyledArrow = styled(Arrow)`
  padding: ${({ direction }) =>
    direction === 'left' ? '0 0.75rem 0 0' : '0 0 0 0.75rem;'};
`

/**
 * General button component for encapsulating left/right navigation buttons.
 *
 * @param type - HTML button type.
 * @param direction - left / right
 * @param onClick - Button onClick handler
 * @param className - Overwrite default button classes. default: btn btn-primary btn-lg
 * @param children - Any children to pass in.
 * @returns {*} - Left / Right navigation buttons.
 */
const Button = ({
  type = 'button',
  direction = 'left',
  onClick,
  className = 'btn btn-primary btn-lg',
  children,
  ...props
}) => (
  <button type={type} onClick={onClick} className={className} {...props}>
    {direction === 'right' && children}
    <StyledArrow direction={direction} />
    {direction === 'left' && children}
  </button>
)
Button.propTypes = {
  direction: PropTypes.oneOf(['left', 'right']).isRequired,
}

/**
 * Prev navigation button, see StepNavigation.Button component for details.
 * @param props
 * @returns {*}
 */
export const Prev = (props) => <Button direction="left" {...props} />

/**
 * Next navigation button, see StepNavigation.Button component for details.
 * @param props
 * @returns {*}
 */
export const Next = (props) => <Button direction="right" {...props} />

/**
 * Default wrapper for step navigation button components.
 *
 * @param children
 * @returns {*} - Step navigation component.
 */
const StepNavigation = ({ children }) => (
  <nav
    className="navbar"
    css={`
      display: flex;
    `}>
    <div className="container-fluid">{children}</div>
  </nav>
)

export default StepNavigation
