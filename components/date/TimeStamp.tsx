import {Currency} from "../../src/marketdata/provider";
import moment from "moment"

interface TimeStampProps {
    date: Date
}

export default function TimeStamp({date}: TimeStampProps) {

    return (
        <span> {moment(date).format()}</span>
    )
}