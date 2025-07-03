import { AppConstants } from "@/lib/app_constants"

export default function Page(){
    const vaultAddress = AppConstants.ARBITER_PUBKEY.toBase58()
    return (
        <div>
            <div>Address</div>
            <div>{vaultAddress}</div>
        </div>
    )
}