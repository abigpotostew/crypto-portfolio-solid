import {useContainer, useWebId} from "swrlit";
import React, {useState} from "react"
import { useTable } from 'react-table'
import CssBaseline from '@material-ui/core/CssBaseline'
import MaUTable from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

function Table({ columns, data }) {
    // Use the state and functions returned from useTable to build your UI
    const { getTableProps, headerGroups, rows, prepareRow } = useTable({
        columns,
        data,
    })

    // Render the UI for your table
    return (
        <MaUTable {...getTableProps()}>
            <TableHead>
                {headerGroups.map(headerGroup => (
                    <TableRow {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <TableCell {...column.getHeaderProps()}>
                                {column.render('Header')}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableHead>
            <TableBody>
                {rows.map((row, i) => {
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
        </MaUTable>
    )
}

export default function Ledger({children = (item, index) => <li key={index}>{`${item}`}</li>}) {


    const defaultData = [
        {
            id:"a",
            fromCurrency:"USD",
            toCurrency:"ETH",
            outAmount:2000.0,
            inAmount:4.5,
            rate:4.5 // from / to amounts
        }
    ]

    // const [table, setTable] = useState(defaultData)
    //
    // return <div>{table&&table.map((i)=>(<Row key={i.id}></Row>))}</div>;

    const data = React.useMemo(() => defaultData, [])

    return (
        <div>
            <CssBaseline />
            <Table columns={columns} data={data} />
        </div>
    )
}