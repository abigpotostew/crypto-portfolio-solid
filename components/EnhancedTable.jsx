import React from 'react'

import Checkbox from '@material-ui/core/Checkbox'
import MaUTable from '@material-ui/core/Table'
import PropTypes from 'prop-types'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableFooter from '@material-ui/core/TableFooter'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TablePaginationActions from './TablePaginationActions'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import TableToolbar from './TableToolbar'
import {
    useGlobalFilter,
    usePagination,
    useRowSelect,
    useSortBy,
    useTable,
} from 'react-table'

const IndeterminateCheckbox = React.forwardRef(
    ({indeterminate, ...rest}, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <Checkbox ref={resolvedRef} {...rest} />
            </>
        )
    }
)

const inputStyle = {
    padding: 0,
    margin: 0,
    border: 0,
    background: 'transparent',
}

// Create an editable cell renderer
const EditableCell = ({
                          value: initialValue,
                          row: {index},
                          column: {id},
                          updateMyData, // This is a custom function that we supplied to our table instance
                      }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = e => {
        setValue(e.target.value)
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateMyData(index, id, value)
    }

    // If the initialValue is changed externall, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return (
        <input
            style={inputStyle}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    )
}

EditableCell.propTypes = {
    cell: PropTypes.shape({
        value: PropTypes.any.isRequired,
    }),
    row: PropTypes.shape({
        index: PropTypes.number.isRequired,
    }),
    column: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    updateMyData: PropTypes.func.isRequired,
}

// Create an editable numeric cell renderer
export const EditableNumericCell = ({
                                        value: initialValue,
                                        row: {index},
                                        column: {id},
                                        updateMyData, // This is a custom function that we supplied to our table instance
                                    }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const doParseValue = (s) => {
        let v = parseFloat(s)
        if (isNaN(v)) {
            v = 0.0
        }
        return v
    }

    const onChange = e => {
        setValue(e.target.value)
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        let parsedValue = doParseValue(value)

        //set it to the parsed numeric
        setValue(parsedValue)
        updateMyData(index, id, parsedValue)
    }

    // If the initialValue is changed externally, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    //todo use material ui //textfield
    /**
     * <TextField
     id="standard-number"
     label="Number"
     type="number"
     InputLabelProps={{
            shrink: true,
          }}
     />
     */
    return (
        <input
            style={inputStyle}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    )
}

EditableNumericCell.propTypes = {
    cell: PropTypes.shape({
        value: PropTypes.any.isRequired,
    }),
    row: PropTypes.shape({
        index: PropTypes.number.isRequired,
    }),
    column: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    updateMyData: PropTypes.func.isRequired,
}


// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
    Cell: EditableCell,
}

const EnhancedTable = ({
                           columns,
                           data,
                           // setData,
                           deleteData, addData,
                           updateMyData,
                           skipPageReset,
                       }) => {
    const {
        getTableProps,
        headerGroups,
        footerGroups,
        prepareRow,
        page,
        gotoPage,
        setPageSize,
        preGlobalFilteredRows,
        setGlobalFilter,
        state: {pageIndex, pageSize, selectedRowIds, globalFilter},
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            autoResetPage: !skipPageReset,
            // updateMyData isn't part of the API, but
            // anything we put into these options will
            // automatically be available on the instance.
            // That way we can call this function from our
            // cell renderer!
            updateMyData,
        },
        useGlobalFilter,
        useSortBy,
        usePagination,
        useRowSelect,
        hooks => {
            hooks.allColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox.  Pagination is a problem since this will select all
                    // rows even though not all rows are on the current page.  The solution should
                    // be server side pagination.  For one, the clients should not download all
                    // rows in most cases.  The client should only download data for the current page.
                    // In that case, getToggleAllRowsSelectedProps works fine.
                    Header: ({getToggleAllRowsSelectedProps}) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
                    Cell: ({row}) => (
                        <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    ),
                },
                ...columns,
            ])
        }
    )

    const handleChangePage = (event, newPage) => {
        gotoPage(newPage)
    }

    const handleChangeRowsPerPage = event => {
        setPageSize(Number(event.target.value))
    }

    const deleteTradeHandler = event => {
        const rowsIdsToDelete = Object.keys(selectedRowIds).map(x => parseInt(x, 10))
        const deletes = data.filter((_, i) => rowsIdsToDelete.includes(i))

        deleteData(deletes)
    }

    const addTradeHandler = trade => {
        addData([trade])
    }

    // Render the UI for your table
    return (
        <TableContainer>
            <TableToolbar
                numSelected={Object.keys(selectedRowIds).length}
                deleteTradeHandler={deleteTradeHandler}
                addTradeHandler={addTradeHandler}
                preGlobalFilteredRows={preGlobalFilteredRows}
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
            />
            <MaUTable {...getTableProps()}>
                <TableHead>
                    {headerGroups.map(headerGroup => (
                        <TableRow {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <TableCell
                                    {...(column.id === 'selection'
                                        ? column.getHeaderProps()
                                        : column.getHeaderProps(column.getSortByToggleProps()))}
                                >
                                    {column.render('Header')}
                                    {column.id !== 'selection' ? (
                                        <TableSortLabel
                                            active={column.isSorted}
                                            // react-table has a unsorted state which is not treated here
                                            direction={column.isSortedDesc ? 'desc' : 'asc'}
                                        />
                                    ) : null}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <TableRow {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return (
                                        <TableCell {...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        )
                    })}
                </TableBody>

                <TableFooter>
                    {footerGroups.map(group => (
                        <tr {...group.getFooterGroupProps()}>
                            {group.headers.map(column => (
                                <td {...column.getFooterProps()}>{column.render('Footer')}</td>
                            ))}
                        </tr>
                    ))}
                    <TableRow>
                        <TablePagination
                            // rowsPerPageOptions={[
                            //     {label: "5", value: 5, key:"5-pagination"},
                            //     {label: "10", value: 10},
                            //     {label: "25", value: 25},
                            //     // 10,
                            //     // 25,
                            //     { label: 'All', value: data.length },
                            // ]}
                            colSpan={3}
                            count={data.length}
                            rowsPerPage={pageSize}
                            page={pageIndex}
                            SelectProps={{
                                inputProps: {'aria-label': 'rows per page'},
                                native: true,
                            }}
                            onChangePage={handleChangePage}
                            onChangeRowsPerPage={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                        />
                    </TableRow>
                </TableFooter>
            </MaUTable>
        </TableContainer>
    )
}

EnhancedTable.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    updateMyData: PropTypes.func.isRequired,
    // setData: PropTypes.func.isRequired,
    addData: PropTypes.func.isRequired,
    deleteData: PropTypes.func.isRequired,
    skipPageReset: PropTypes.bool.isRequired,
}

export default EnhancedTable