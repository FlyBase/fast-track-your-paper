import React, { useState } from 'react'
import { render, fireEvent, waitForElement } from '@testing-library/react'

import { useStateFromProp } from '../useStateFromProp'

const ParentComp = () => {
  const [globalValue, setGlobalValue] = useState(true)
  return (
    <div>
      <button onClick={() => setGlobalValue(!globalValue)}>Global</button>
      <TestComp initialValue={globalValue}>Flag 1</TestComp>
      <TestComp initialValue={globalValue}>Flag 2</TestComp>
    </div>
  )
}
const TestComp = ({ initialValue = false, children }) => {
  const [value, setValue] = useStateFromProp(initialValue)
  return (
    <div>
      <button onClick={() => setValue(!value)}>Local</button>
      <div>{value && <div>{children}</div>}</div>
    </div>
  )
}

test('Loads and is visible by default', () => {
  const { getAllByText } = render(<ParentComp />)
  expect(getAllByText(/flag/i)).toHaveLength(2)
})

test('Global click to hide', () => {
  const { getByText, queryAllByText } = render(<ParentComp />)
  const button = getByText('Global')
  expect(queryAllByText(/flag/i)).toHaveLength(2)
  fireEvent.click(button)
  expect(queryAllByText(/flag/i)).toHaveLength(0)
})

test('Local click to hide', () => {
  const { getAllByText, queryByText } = render(<ParentComp />)
  const button = getAllByText('Local')[0]
  expect(queryByText(/flag 1/i)).toBeInTheDocument()
  fireEvent.click(button)
  expect(queryByText(/flag 1/i)).not.toBeInTheDocument()
})

test('Global click to hide then local click to show', () => {
  const { getByText, getAllByText, queryAllByText } = render(<ParentComp />)
  const globalButton = getByText('Global')
  // Get the first local button
  const localButton = getAllByText('Local')[0]
  expect(queryAllByText(/flag/i)).toHaveLength(2)
  fireEvent.click(globalButton)
  expect(queryAllByText(/flag/i)).toHaveLength(0)
  fireEvent.click(localButton)
  expect(queryAllByText(/flag 1/i)).toHaveLength(1)
})
