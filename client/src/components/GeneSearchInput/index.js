import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'

const Input = styled.input`
  font-size: 1.3em;
  min-height: 2em;
  line-height: 1.5em;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0, 0.5);
`

const GeneSearchInput = ({ onChange = () => {}, children }) => {
  const handleOnChange = evt => {
    const symbol = evt?.target?.value ?? ''
    onChange(symbol)
  }

  return (
    <>
      <div className="form-group">
        <div
          className="col-sm-10 col-sm-offset-1 control-label"
          style={{ marginBottom: '1em' }}>
          <label htmlFor="gene">Gene Search:</label>
          <div>
            <Input
              type="text"
              id="gene"
              name="gene"
              onChange={handleOnChange}
            />
          </div>
        </div>
        {children}
      </div>
    </>
  )
}

GeneSearchInput.propTypes = {
  onChange: PropTypes.func,
}

export default GeneSearchInput
