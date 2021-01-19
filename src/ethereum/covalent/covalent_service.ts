import {
    Address,
    GetERC20TokenTransfersResponse,
    GetTokenAddressBalancesResponse,
    PaginationOptions,
    RESTService
} from "./covalent";
import superagent from "superagent"

// const host = process.env.NEXT_PUBLIC_COVALENT_HOST
// const key = process.env.NEXT_PUBLIC_COVALENT_API_KEY

interface APIResponse {

    data: object,
    error: boolean,
    error_message: string,
    error_code: string

}

export class CovalentService implements RESTService {

    host: string
    key: string

    constructor(host: string, key: string) {
        this.host = host;
        this.key = key;
    }

    async getTokenAddressBalances(chainId: number, address: Address): Promise<GetTokenAddressBalancesResponse> {
        //GET /v1/{chainId}/address/{address}/balances_v2/
        const url = new URL(this.host)
        url.pathname = `/v1/${chainId}/address/${address}/balances_v2/`
        const json = await this.getJson(url)
        return json as GetTokenAddressBalancesResponse
    }

    async getERC20TokenTransfers(address: Address, contractAddress: Address, paginationOpts: PaginationOptions): Promise<GetERC20TokenTransfersResponse> {
        // GET /v1/1/address/{address}/transfers_v2/

        const url = new URL(this.host);
        url.pathname = `/v1/1/address/${address}/transfers_v2/`
        url.searchParams.append("contract-address", contractAddress)

        const json = await this.getJson(url)
        return json as GetERC20TokenTransfersResponse
    }

    //todo how to get eth??


    private async getJson(url: URL): Promise<object> {
        return new Promise((resolve, reject) => {
            try {
                url.searchParams.append("key", this.key)
                superagent.get(url.href)
                    .set("Accept", "application/json")
                    .end((err, res) => {
                        if (err) {
                            return reject(err)
                        }

                        const jsonRes = res.body as APIResponse

                        if (res.status !== 200) {
                            return reject(new Error("response status is " + res.status + " because " + jsonRes))
                        }

                        return resolve(jsonRes.data)
                    })

            } catch (err) {
                reject(err)
            }
        })
    }
}

