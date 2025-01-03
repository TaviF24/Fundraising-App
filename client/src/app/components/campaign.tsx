import { getContract } from "thirdweb";
import { client } from "../client";
import { sepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import Link from "next/link";

type CampaignProps = {
    campaignAddress: string;  
};

export default function Campaign({campaignAddress}: CampaignProps){
    const contract = getContract({
        client: client,
        chain: sepolia,
        address: campaignAddress
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
    let balancePercentage = parseFloat((parseInt(totalBalance as string) / parseInt(totalGoal as string) * 100).toFixed(2));

    if(balancePercentage > 100){
        balancePercentage = 100;
    }

    return(
        <div className="flex flex-col justify-between max-w-sm p-6 bg-stone-300 border border-slate-200 rounded-lg shadow">
            <div>
                {!isPendingBalance && !isPendingGoal && (
                    <div className="mb-4">
                        <div className="relative w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
                            <div className="h-6 bg-green-900 rounded-full dark:bg-green-800 text-right" style={{width: `${balancePercentage?.toString()}%`}}>
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
                <h5 className="mb-5 text-2xl font-bold tracking-tight">{campaignName}</h5>
                <p className="mb-3 font-normal text-slate-600 dark:text-slate-600">{description}</p>
            </div>
            <Link href={`/campaign/${campaignAddress}`} passHref={true}> 
                    <p className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-800 rounded-lg hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green-800 dark:hover:bg-green-900 dark:focus:ring-green-800">
                        View Campaign
                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </p>
            </Link>
        </div>
    )    
}