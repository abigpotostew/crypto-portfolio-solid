import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import React, {useState} from "react";
import {alwaysIncludeCoins} from "../src/currencies";

export interface CurrencySelectProps {
    onChangeHandler: (event: any, index: number, value: string) => any,
    initialSelect: string,
    label: string
}

export default function CurrencySelect(props: CurrencySelectProps) {

    const {onChangeHandler, initialSelect, label} = props
    const currencies = alwaysIncludeCoins
    const initialValue = initialSelect || currencies[0].symbol

    const [value, setValue] = React.useState(initialValue)

    // const handleChangeWrapper = () => (event, index, value) => {
    //     setValue(event.target.value)
    //     // setValue({value}, () => { console.log('New Value ', this.state.value); });
    //     onChangeHandler && onChangeHandler(event,index,value)
    // }
    const handleChange = (event: any, index: number, value: string) => {
        setValue(event.target.value)
        // setValue({value}, () => { console.log('New Value ', this.state.value); });
        onChangeHandler && onChangeHandler(event, index, value)
        // this.setState({value}, () => { console.log('New Value ', this.state.value); });
    }

    return (
        <FormControl>
            <InputLabel id="demo-simple-select-label">{label}</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                // id="demo-simple-select"
                value={value}

                // @ts-ignore
                onChange={handleChange}
            >
                {currencies.map((v, idx) => (
                        <MenuItem key={idx} value={v.symbol}>{v.symbol}</MenuItem>
                    )
                )}
                {/*<MenuItem value={10}>Ten</MenuItem>*/}
                {/*<MenuItem value={20}>Twenty</MenuItem>*/}
                {/*<MenuItem value={30}>Thirty</MenuItem>*/}
            </Select>
        </FormControl>
    )
}

// CurrencySelect.propTypes = {
//     onChangeHandler: PropTypes.func,
// }
