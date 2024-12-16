import { prepareContractCall, ThirdwebContract } from "thirdweb";
import { TransactionButton } from "thirdweb/react";

type Tier = {
    name: string;
    amount: bigint;
    funders: bigint;
};

type TierProps = {
    tier: Tier;
    index: number;
    contract: ThirdwebContract;
};

export default function Tier( {tier, index, contract}: TierProps ){
    return(
        <div className="max-w-sm flex flex-col justify-between p-6 bg-white border border-slate-100 rounded-lg shadow">
            <div>
                <div className="flex flex-row justify-between items-center">
                    <p className="text-2xl font-semibold">{tier.name}</p>
                    <p className="text-2xl font-semibold">${tier.amount.toString()}</p>
                </div>
            </div>
            <div className="flex flex-row justify-between items-end">
                <p className="text-xs font-semibold">Total funders: {tier.funders.toString()}</p>
                <TransactionButton 
                    transaction={() => prepareContractCall({
                        contract,
                        method: "function fund(uint256 tierIndex) payable",
                        params: [BigInt(index)],
                        value: tier.amount
                    })}
                    onTransactionConfirmed={async () => alert("Transaction confirmed!")}
                    style={{
                        marginTop: "1rem",
                        backgroundColor: "#2563EB",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.3rem",
                        cursor: "pointer"
                    }}
                >Select
                </TransactionButton>
            </div>
        </div>
    )
}