import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'

const Input = styled.input`
  font-size: 1.3em;
  min-height: 3em;
  line-height: 1.5em;
`

const InputWrapper = styled.div`
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0, 0.5);
`

const GeneSearchInput = ({ onChange = () => {}, children }) => {
  const handleOnChange = evt => {
    const symbol = evt?.target?.value ?? ''
    onChange(symbol)
  }

  return (
    <div>
      <label htmlFor="gene">Gene Search:</label>
      <InputWrapper>
        <Input type="text" id="gene" name="gene" onChange={handleOnChange} />
      </InputWrapper>
      {children}
    </div>
  )
}

GeneSearchInput.propTypes = {
  onChange: PropTypes.func,
}

export default GeneSearchInput
