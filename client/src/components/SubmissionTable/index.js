import React from 'react'
import {
  Grid,
  Table,
  TableHeaderRow,
} from '@devexpress/dx-react-grid-bootstrap3'

const columns = [
  { name: 'fbrf', title: 'FBrf' },
  { name: 'submittedToFlybase', title: 'Submitted' },
  {
    name: 'name',
    title: 'Name',
    getCellValue: row => row?.userData?.contact?.name ?? ''
  },
  {
    name: 'email',
    title: 'E-mail',
    getCellValue: row => row?.userData?.contact?.email ?? ''
  },

]

const SubmissionTable = ({ rows }) => {
  return (
  <div>
    <Grid rows={rows} columns={columns}>
      <Table />
      <TableHeaderRow />
    </Grid>
  </div>
  )
}

export default SubmissionTable

