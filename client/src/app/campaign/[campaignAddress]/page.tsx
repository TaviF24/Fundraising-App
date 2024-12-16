'use client'
import { client } from "@/app/client";
import Tier from "@/app/components/tier";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount, useReadContract } from "thirdweb/react";

export default function CampaignPage(){
    const account = useActiveAccount();
    const {campaignAddress} = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModal] = useState(false);

    const contract = getContract({
        client: client,
        chain: sepolia,
        address: campaignAddress as string
    });

    const { data: campaignName, isPending: isPendingName } = useReadContract({
        contract,
        method: "function campaignName() view returns (string)",
        params: [],
    });

    const { data: description, isPending: isPendingDesc } = useReadContract({
        contract,
        method: "function description() view returns (string)",
        params: [],
    });

    const { data: deadline, isPending: isPendingDeadline } = useReadContract({
        contract,
        method: "function deadline() view returns (uint256)",
        params: [],
    });

    const deadlineDate = new Date(parseInt(deadline?.toString() as string) * 1000);
    const deadlineDatePassed = deadlineDate < new Date();

    const { data: goal, isPending: isPendingGoal } = useReadContract({
        contract,
        method: "function goal() view returns (uint256)",
        params: [],
    });

    const { data: balance, isPending: isPendingBalance } = useReadContract({
        contract,
        method:
          "function getContractBalance() view returns (uint256)",
        params: [],
    });


    const totalBalance = balance?.toString();
    const totalGoal = goal?.toString();
    let balancePercentage = (parseInt(totalBalance as string) / parseInt(totalGoal as string)) * 100;

    if(balancePercentage > 100){
        balancePercentage = 100;
    }


    const { data: tiers, isPending: isPendingTiers } = useReadContract({
        contract,
        method:
          "function getTiers() view returns ((string name, uint256 amount, uint256 uses)[])",
        params: [],
    });

    const { data: owner, isPending: isPendingOwner } = useReadContract({
        contract,
        method: "function owner() view returns (address)",
        params: [],
    });

    const { data: campaignState, isPending: isPendingState } = useReadContract({
        contract,
        method: "function campaignState() view returns (uint8)",
        params: [],
    });

    return (
        <div className="mx-auto max-w-7xl px-2 mt-4 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center">
                {!isPendingName && (
                    <p className="text-4xl font-semibold">{campaignName}</p>
                )}
                {owner === account?.address && (
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? "Done" : "Edit"}
                    </button>
                )}
            </div>
            <div className="my-4">
                {!isPendingDesc && (
                    <div>
                        <p className="text-lg font-semibold">Description:</p>
                        <p>{description}</p>
                    </div>
                )}
            </div>
            <div className="mb-4">
                <p className="text-lg font-semibold">Deadline</p>
                {!isPendingDeadline && (
                    <p>{deadlineDate.toDateString()}</p>
                )}
            </div>
            {!isPendingBalance && !isPendingGoal && (
                    <div className="mb-4">
                        <p className="text-lg font-semibold">Campaign goal: ${goal?.toString()}</p>
                        <div className="relative w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
                            <div className="h-6 bg-blue-600 rounded-full dark:bg-blue-500 text-right" style={{width: `${balancePercentage?.toString()}%`}}>
                                <p className="text-white dark:text-white text-xs p-1">
                                    ${balance?.toString()}
                                </p>
                            </div>
                            <p className="absolute top-0 right-0 text-white dark:text-white text-xs p-1">
                                {balancePercentage >= 100 ? "" : `${balancePercentage.toString()}%`}
                            </p>
                        </div>
                    </div>
            )}
            <div>
                <p className="text-lg font-semibold">Tiers:</p>
                <div className="grid grid-cols-3 gap-4">
                    {isPendingTiers ?(
                        <p>Loading...</p>
                    ) : (
                        tiers && tiers.length > 0 ? (
                            tiers.map((tier, index) => {
                                const formattedTier = {
                                    name: tier.name,
                                    amount: tier.amount,
                                    funders: tier.uses,
                                };
                                return (
                                    <Tier
                                        key={index}
                                        tier={formattedTier}
                                        index={index}
                                        contract={contract}
                                    />
                                );
                            })
                        ) : ( 
                        <p>No tiers</p>
                        )
                    )}
                </div>
            </div>
        </div>

    )
}