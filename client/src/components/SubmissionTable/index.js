import React from 'react'
import {
  DataTypeProvider,
  SortingState,
  IntegratedSorting,
  FilteringState,
  IntegratedFiltering,
} from '@devexpress/dx-react-grid'
import {
  Grid,
  Table,
  TableHeaderRow,
  TableFilterRow,
} from '@devexpress/dx-react-grid-bootstrap3'

const columns = [
  { name: 'fbrf', title: 'FBrf' },
  {
    name: 'name',
    title: 'Name',
    getCellValue: (row) => row?.userData?.contact?.name ?? '',
  },
  { name: 'submittedToFlybase', title: 'Submitted' },
  {
    name: 'email',
    title: 'E-mail',
    getCellValue: (row) => row?.userData?.contact?.email ?? '',
  },
  {
    name: 'numGenes',
    title: '# Genes',
    getCellValue: (row) => (row?.userData?.genes ?? []).length,
  },
]
const FilterIcon = ({ type }) => {
  if (type === 'month') {
    return <i className="glyphicon glyphicon-calendar" />
  }
  return <TableFilterRow.Icon type={type} />
}

const SubmissionTable = ({ rows }) => {
  return (
    <div>
      <Grid rows={rows} columns={columns}>
        <DataTypeProvider
          for={['submittedToFlybase']}
          availableFilterOperations={[
            'month',
            'contains',
            'startsWith',
            'endsWith',
          ]}
        />
        <DataTypeProvider
          for={['numGenes']}
          availableFilterOperations={[
            'equal',
            'notEqual',
            'greaterThan',
            'greaterThanOrEqual',
            'lessThan',
            'lessThanOrEqual',
          ]}
        />
        <SortingState
          defaultSorting={[
            { columnName: 'submittedToFlybase', direction: 'desc' },
          ]}
        />
        <IntegratedSorting />
        <FilteringState defaultFilters={[]} />
        <IntegratedFiltering />
        <Table />
        <TableHeaderRow showSortingControls />
        <TableFilterRow showFilterSelector iconComponent={FilterIcon} />
      </Grid>
    </div>
  )
}

export default SubmissionTable
