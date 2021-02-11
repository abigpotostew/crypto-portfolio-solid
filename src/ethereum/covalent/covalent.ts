export interface RESTService {
    //https://www.covalenthq.com/docs/api/#get-/v1/{chainId}/address/{address}/balances_v2/

    getTokenAddressBalances(chainId: number, address: Address): Promise<GetTokenAddressBalancesResponse>

    getERC20TokenTransfers(address: Address, contractAddress: Address, paginationOpts: PaginationOptions): Promise<GetERC20TokenTransfersResponse>

    getEtherTransfers(address: Address, paginationOpts: PaginationOptions): Promise<GetTransactionsResponse>

}

export type Address = string

export interface PaginationOptions {
    pageNumber?: number //int32
    pageSize?: number  //int32
}

export interface GetTokenAddressBalancesResponse {
    address: Address

    updated_at: Date
    next_update_at: Date
    quote_currency: string

    items: TokenBalance[]
}

export interface TokenBalance {
    contract_decimals: number //int32
    contract_name: string
    contract_ticker_symbol: string
    contract_address: Address
    logo_url: string
    type: string
    balance: number//int
    quote_rate: number//float
    quote: number//float
    //nft omitted
}

export interface CovalentTransactionCollectionResponse<T> {
    address: Address
    updated_at: Date
    next_update_at: Date
    quote_currency: string
    chain_id: number//int32
    items: T[]
    pagination: PaginationResponse
}

export interface GetTransactionsResponse extends CovalentTransactionCollectionResponse<CovalentTransactionWithLogs> {
}

export interface GetERC20TokenTransfersResponse extends CovalentTransactionCollectionResponse<ERC20TokenTransfersItem> {
}


export interface CovalentTransaction {
    block_signed_at: Date
    tx_hash: string
    tx_offset: number//int32
    successful: boolean
    from_address: string
    from_address_label: string | null
    to_address: string
    to_address_label: string | null
    value: string//The value attached to this tx.
    value_quote: number//float //The value attached in quote-currency to this tx.
    gas_offered: number//int64//The gas offered for this tx.
    gas_spent: number//int64//The gas spent for this tx.
    gas_price: number///int64//The gas price at the time of this tx.
    gas_quote: number//float//The gas spent in quote-currency denomination.
    gas_quote_rate: number//float//Historical ETH price at the time of tx.
}

export interface ERC20TokenTransfersItem extends CovalentTransaction {
    transfers: ERC20TokenTransfersItemTransfers[]
}

export interface CovalentTransactionWithLogs extends CovalentTransaction {
    log_events?: TransactionLogEvent[]
}

export interface TransactionLogEvent {
    block_signed_at: Date
    block_height: number//int64
    tx_hash: string
    log_offset: number//int64
    tx_offset: number//int64
    raw_log_topics?: string
    sender_address: string
    sender_address_label: string
    raw_log_data: string
    decoded: DecodedItem
}

export interface DecodedItem {
    name: string
    signature: string
    params: DecodedParameter[]
}

export interface DecodedParameter {
    name: string
    type: string
    indexed: boolean
    decoded: boolean
    value: any //parameter value, typically a string
}

export interface PaginationResponse {
    has_more: boolean
    page_number: number//int32
    page_size: number//int32
    total_count: number//int32
}

export interface ERC20TokenTransfersItemTransfers {
    block_signed_at: Date
    tx_hash: string
    from_address: Address
    from_address_label: string
    to_address: Address
    to_address_label: string
    contract_decimals: number//int32
    contract_name: string
    contract_ticker_symbol: string
    contract_address: Address
    logo_url: string
    transfer_type: string
    delta: number//number
    balance: number//number
    quote_rate: number//float
    delta_quote: number//float
    balance_quote: number//float
}