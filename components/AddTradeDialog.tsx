import React, {useState} from 'react'

import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip'

import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CurrencySelect from "./CurrencySelect";
import {newTrade, Trade, TradeType} from "../src/store";
import {UncheckedCurrency} from "../src/marketdata/provider";

const initialData = {
    costCurrency: 'USD',
    costAmount: 0.0,
    inCurrency: 'btc',
    inAmount: 0.0,
    fee: 0.0,
    feeCoin: 'USD',
    // status: 'single',
    // progress: 0,
    // subRows: undefined,
}

export interface AddTradeDialogProps {
    addTradeHandler: (t: Trade) => any,
}

export default function AddTradeDialog(props: AddTradeDialogProps) {
    const [trade, setTrade] = useState(initialData)
    const {addTradeHandler} = props
    const [open, setOpen] = React.useState(false)

    const [switchState, setSwitchState] = React.useState({
        addMultiple: false,
    })

    // @ts-ignore
    const handleSwitchChange = name => event => {
        setSwitchState({...switchState, [name]: event.target.checked})
    }

    const resetSwitch = () => {
        setSwitchState({addMultiple: false})
    }

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        resetSwitch()
    }

    // @ts-ignore
    const handleAdd = event => {
        // todo check the currency against 'currencies' before saving it to pod.
        const newT = newTrade(new UncheckedCurrency(trade.inCurrency), trade.inAmount, trade.costAmount, trade.fee, "", new Date(), new Date(), "", "", TradeType.BUY)
        addTradeHandler(newT)
        setTrade(initialData)
        switchState.addMultiple ? setOpen(true) : setOpen(false)
    }

    const doParseValue = (s: string) => {
        let v = parseFloat(s)
        if (isNaN(v)) {
            v = 0.0
        }
        return v
    }
    // @ts-ignore
    const handleChange = (name: string, isNumeric: boolean) => ({target: {value}}) => {
        //need to convert some to numbers
        if (isNumeric) {
            let v = 0
            if (isNumeric) {
                v = doParseValue(value)
            }
            setTrade({...trade, [name]: v})
            console.log("yo", name, "is now", v)
        } else {
            setTrade({...trade, [name]: value})
            console.log("yo", name, "is now", value)
        }


    }

    // @ts-ignore
    return (
        <div>
            <Tooltip title="Add">
                <IconButton aria-label="add" onClick={handleClickOpen}>
                    <AddIcon/>
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
                        label={"Out"}
                        initialSelect={initialData.costCurrency}

                        onChangeHandler={handleChange('costCurrency', false)}
                    />

                    {/*<TextField*/}
                    {/*    autoFocus*/}
                    {/*    margin="dense"*/}
                    {/*    label="From Currency"*/}
                    {/*    type="text"*/}
                    {/*    fullWidth*/}
                    {/*    value={trade.outCurrency}*/}
                    {/*    onChange={handleChange('outCurrency')}*/}
                    {/*/>*/}
                    <TextField
                        margin="dense"
                        label="Out Amount"
                        type="number"
                        fullWidth
                        value={trade.costAmount}
                        onChange={handleChange('costAmount', true)}
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
                        label={"In"}
                        initialSelect={initialData.inCurrency}
                        onChangeHandler={handleChange('inCurrency', false)}/>
                    <TextField
                        margin="dense"
                        label="In Amount"
                        type="number"
                        fullWidth
                        value={trade.inAmount}
                        onChange={handleChange('inAmount', true)}
                    />

                    <TextField
                        margin="dense"
                        label="Fee"
                        type="number"
                        fullWidth
                        value={trade.fee}
                        onChange={handleChange('fee', true)}
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
                        initialSelect={initialData.feeCoin}
                        onChangeHandler={handleChange('feeCoin', false)}/>

                </DialogContent>
                <DialogActions>
                    <Tooltip title="Add multiple">
                        <Switch
                            checked={switchState.addMultiple}
                            onChange={handleSwitchChange('addMultiple')}
                            value="addMultiple"
                            inputProps={{'aria-label': 'secondary checkbox'}}
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
//
// AddTradeDialog.propTypes = {
//     addTradeHandler: PropTypes.func.isRequired,
// }
