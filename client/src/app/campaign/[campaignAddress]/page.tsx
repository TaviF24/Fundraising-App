'use client'
import { client } from "@/app/client";
import Tier from "@/app/components/tier";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getContract, prepareContractCall, ThirdwebContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { lightTheme, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { ContractEvent, ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";

async function getEvents(address: string){
    try{
        const sdk = new ThirdwebSDK("sepolia");
        const contractSdk = await sdk.getContract(address);
        const events = await contractSdk.events.getAllEvents();
        return events;
    } catch(error){
        console.error(error);
        return [];
    }    
}

async function getGasPrice(address: string) {
    try{
        const sdk = new ThirdwebSDK("sepolia");
        const contractSdk = await sdk.getContract(address);
        const gasPrice = contractSdk.estimator.currentGasPriceInGwei();
        return parseFloat(await gasPrice) ;
    } catch(error){
        console.error(error);
        return 0;
    }   
}

export default function CampaignPage(){
    const account = useActiveAccount();
    const {campaignAddress} = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    var deadlineDate = new Date(parseInt(deadline?.toString() as string) * 1000);

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

    const { data: status, isPending: isPendingStatus } = useReadContract({
        contract,
        method:
          "function getCampaignStatus() view returns (uint8)",
        params: [],
      });

    var campaignStatus = "";
    switch(status){
        case 0:
            var campaignStatus = "Active";
            break;
        case 1:
            var campaignStatus = "Successful";
            break;
        case 2:
            var campaignStatus = "Unsuccessful";
            break;
    }

    const [allEvents, setAllEvents] = useState<ContractEvent<Record<string, any>>[] | null>(null);

    useEffect(() => {
        async function fetchEvents() {
          if (campaignAddress) {
            try {
              const events = await getEvents(campaignAddress as string);
              setAllEvents(events);
            } catch (error) {
              console.error("Error fetching events:", error);
            }
          }
        }
    
        fetchEvents();
    }, [campaignAddress]);

    
    const [gasPrice, setGasPrice] = useState<number | null>(null);

    useEffect(() => {
        async function fetchGasPrice() {
          if (campaignAddress) {
            try {
              const price = await getGasPrice(campaignAddress as string);
              setGasPrice(price);
            } catch (error) {
              console.error("Error fetching gas price:", error);
            }
          }
        }
      
        fetchGasPrice();
      }, [campaignAddress]); // refetch if the campaign address changes

    
    const gasPriceInEth = (gasPrice === null ? gasPrice : (gasPrice * 1e-9).toFixed(8));
    return (
        <div className="mx-auto max-w-7xl px-2 mt-4 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center">
                {!isPendingName && (
                    <p className="text-4xl font-semibold">{campaignName}</p>
                )}
                {!isPendingStatus && (
                    <div className={status==0 ? "bg-stone-700 text-white rounded-md" : status==1 ? "bg-green-600  text-white rounded-md" : "bg-red-950  text-white rounded-md"}>
                        <p className="mx-5 my-2">{campaignStatus}</p>
                    </div>
                )}
                <div>
                    {goal && balance && goal <= balance && owner === account?.address && (
                        <TransactionButton 
                            transaction={() => prepareContractCall({
                                contract,
                                method: "function withdraw()",
                                params: [],
                            })}
                            onTransactionConfirmed={async () => alert("Withdraw confirmed!")}
                            style={{
                                backgroundColor: "#14532d",
                                paddingLeft: "0.5rem",
                                paddingRight: "0.5rem",
                                marginRight: "1.25rem",
                                color: "white",
                                borderRadius: "0.375rem",
                                cursor: "pointer"
                            }}
                        >Withdraw</TransactionButton>
                    )}
                    {deadlineDate < new Date() && status == 0 && owner === account?.address && (
                        <TransactionButton 
                            transaction={() => prepareContractCall({
                                contract,
                                method: "function updateStateOfCampaign()",
                                params: [],
                            })}
                            onTransactionConfirmed={async () => alert("Campaign stopped!")}
                            style={{
                                backgroundColor: "#14532d",
                                paddingLeft: "0.5rem",
                                paddingRight: "0.5rem",
                                marginRight: "1.25rem",
                                color: "white",
                                borderRadius: "0.375rem",
                                cursor: "pointer"
                            }}
                        >Stop campaign</TransactionButton>
                    )}
                    {owner === account?.address && (
                        <button 
                            className="px-4 py-2 bg-green-900 text-white rounded-md" 
                            onClick={() => setIsEditing(!isEditing)}
                        >{isEditing ? "Done" : "Edit"}</button>
                    )}
                </div>
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
                {!isPendingDeadline && (
                    <div>
                        <p className="text-lg font-semibold">Deadline:</p>
                        <p>{deadlineDate.toDateString()}</p>
                    </div>
                )}
            </div>
            {!isPendingBalance && !isPendingGoal && (
                    <div className="mb-4">
                        <p className="text-lg font-semibold">Campaign goal: ${goal?.toString()}</p>
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
            <div>
                {!isPendingTiers && (<p className="text-lg font-semibold">Tiers:</p>)}
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
                                        isEditing={isEditing}
                                        gasCost={gasPrice!==null ? gasPrice : 0}
                                    />
                                );
                            })
                        ) : (
                            !isEditing && (
                                <p>No tiers</p>
                            )
                            
                        )
                    )}
                    {isEditing && (
                        <button 
                            className="max-w-sm flex flex-col text-center justify-center items-center font-semibold p-6 bg-green-900 text-white rounded-lg"
                            onClick={() => setIsModalOpen(true)}
                        >+ Add Tier
                        </button>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <CreateModal
                    setIsModalOpen={setIsModalOpen}
                    contract={contract}
                />
            )}
            {!isPendingTiers && (
                <div className="flex justify-between">
                    <p className="text-lg font-semibold mt-4">Estimated gas price in ETH: {gasPriceInEth}</p>
                    <p className="text-lg font-semibold mt-4">Estimated gas price in gwei: {gasPrice}</p>
                </div>
            )}
            {!isPendingTiers && (
                <div>
                    <p className="text-lg font-semibold mt-4">Events:</p>
                    <div className="bg-gray-500 mx-10 h-auto rounded-lg py-3 px-5">
                        {allEvents && allEvents.filter((ev) => ev.eventName=="HasFunded").map((ev,index)=>(
                            <div key={index} className="bg-slate-300 rounded-sm mb-4">
                                <p>{ev.data["funder"]} {ev.data["message"]}</p>
                            </div>
                        ))}
                        {allEvents && allEvents.filter((ev) => ev.eventName=="WithdrawAvailable").map((ev,index)=>(
                            <div key={index} className="bg-green-400 rounded-sm mb-4">
                                <p>{ev.data["message"]} for campaign {ev.data["campaignAddress"]}</p>
                            </div>
                        ))}
                        {allEvents && allEvents.filter((ev) => ev.eventName=="RefundAvailable").map((ev,index)=>(
                            <div key={index} className="bg-red-400 rounded-sm mb-4">
                                <p>{ev.data["message"]}. Campaign: {ev.data["campaignName"]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

type CreateModalProps = {
    setIsModalOpen: (value: boolean) => void;
    contract: ThirdwebContract;

};

const CreateModal = ({
    setIsModalOpen,
    contract,
}: CreateModalProps) => {
    const [tierName, setTierName] = useState<string>("");
    const [tierAmount, setTierAmount] = useState<bigint>(1n);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
            <div className="w-1/2 bg-slate-100 p-6 rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold">Create a funding tier</p>
                    <button 
                        className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
                        onClick={() => setIsModalOpen(false)}
                    >Close</button>
                </div>
                <div className="flex flex-col">
                <label>Tier name:</label>
                <input
                    type="text"
                    value={tierName}
                    onChange={(e) => setTierName(e.target.value)}
                    placeholder="Tier name"
                    className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
                />

                <label>Tier cost:</label>
                <input
                    type="number"
                    value={parseInt(tierAmount.toString())}
                    onChange={(e) => setTierAmount(BigInt(e.target.value))}
                    placeholder="Tier name"
                    className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
                />
                <TransactionButton
                    transaction={() => prepareContractCall({
                        contract,
                        method:
                          "function addTier(string _name, uint256 _amount)",
                        params: [tierName, tierAmount],
                      })}
                    onTransactionConfirmed={async () => {
                        alert("Tier added successfully!")
                        setIsModalOpen(false)
                    }}
                    theme={lightTheme()}
                >Add tier</TransactionButton>
                </div>
            </div> 
        </div>
    )
}