import React, { useState } from 'react'

import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import PropTypes from 'prop-types'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip'

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CurrencySelect from "./CurrencySelect";

const initialData = {
    fromCurrency: 'USD',
    fromAmount: 0.0,
    toCurrency: 'BTC',
    toAmount: 0.0,
    fee:0.0,
    feeCurrency:'USD',
    // status: 'single',
    // progress: 0,
    // subRows: undefined,
}

const AddTradeDialog = props => {
    const [trade, setTrade] = useState(initialData)
    const { addTradeHandler } = props
    const [open, setOpen] = React.useState(false)

    const [switchState, setSwitchState] = React.useState({
        addMultiple: false,
    })

    const handleSwitchChange = name => event => {
        setSwitchState({ ...switchState, [name]: event.target.checked })
    }

    const resetSwitch = () => {
        setSwitchState({ addMultiple: false })
    }

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        resetSwitch()
    }

    const handleAdd = event => {
        addTradeHandler(trade)
        setTrade(initialData)
        switchState.addMultiple ? setOpen(true) : setOpen(false)
    }

    const handleChange = name => ({ target: { value } }) => {
        console.log("yo",name, "is now", value)
        setTrade({ ...trade, [name]: value })
    }

    return (
        <div>
            <Tooltip title="Add">
                <IconButton aria-label="add" onClick={handleClickOpen}>
                    <AddIcon />
                </IconButton>
            </Tooltip>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Add Trade</DialogTitle>
                <DialogContent>
                    <DialogContentText>Demo add item to react table.</DialogContentText>

                    <CurrencySelect
                        label={"From"}
                        onChangeHandler={handleChange('fromCurrency')}
                    />

                    {/*<TextField*/}
                    {/*    autoFocus*/}
                    {/*    margin="dense"*/}
                    {/*    label="From Currency"*/}
                    {/*    type="text"*/}
                    {/*    fullWidth*/}
                    {/*    value={trade.fromCurrency}*/}
                    {/*    onChange={handleChange('fromCurrency')}*/}
                    {/*/>*/}
                    <TextField
                        margin="dense"
                        label="From Amount"
                        type="number"
                        fullWidth
                        value={trade.fromAmount}
                        onChange={handleChange('fromAmount')}
                    />
                    {/*<TextField*/}
                    {/*    margin="dense"*/}
                    {/*    label="To Currency"*/}
                    {/*    type="text"*/}
                    {/*    fullWidth*/}
                    {/*    value={trade.toCurrency}*/}
                    {/*    onChange={handleChange('toCurrency')}*/}
                    {/*/>*/}
                    <CurrencySelect
                        label={"To"}
                        onChangeHandler={handleChange('toCurrency')} />
                    <TextField
                        margin="dense"
                        label="To Amount"
                        type="number"
                        fullWidth
                        value={trade.toAmount}
                        onChange={handleChange('toAmount')}
                    />

                    <TextField
                        margin="dense"
                        label="Fee"
                        type="number"
                        fullWidth
                        value={trade.fee}
                        onChange={handleChange('fee')}
                    />
                    {/*<TextField*/}
                    {/*    margin="dense"*/}
                    {/*    label="Free Currency"*/}
                    {/*    type="text"*/}
                    {/*    fullWidth*/}
                    {/*    value={trade.feeCurrency}*/}
                    {/*    onChange={handleChange('feeCurrency')}*/}
                    {/*/>*/}
                    <CurrencySelect
                        label={"Fee"}
                        onChangeHandler={handleChange('feeCurrency')} />

                </DialogContent>
                <DialogActions>
                    <Tooltip title="Add multiple">
                        <Switch
                            checked={switchState.addMultiple}
                            onChange={handleSwitchChange('addMultiple')}
                            value="addMultiple"
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                    </Tooltip>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAdd} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

AddTradeDialog.propTypes = {
    addTradeHandler: PropTypes.func.isRequired,
}

export default AddTradeDialog