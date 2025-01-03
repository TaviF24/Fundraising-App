'use client'
import { client } from "@/app/client";
import Campaign from "@/app/components/campaign";
import { FUNDRAISING_FACTORY } from "@/app/constants/contracts";
import { useState } from "react";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { deployContract, deployPublishedContract } from "thirdweb/deploys";
import { useActiveAccount, useReadContract } from "thirdweb/react";

export default function DashboardPage(){
    const account = useActiveAccount();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const contract = getContract({
        client: client, 
        chain: sepolia, 
        address: FUNDRAISING_FACTORY,
    })
    
    const { data, isPending } = useReadContract({
        contract,
        method:
          "function getUserCampaign(address _user) view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
        params: [account?.address as string],
      });
    return(
        <div className="mx-auto max-w-7xl px-4 mt-16 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center mb-8">
                <p className="text-4xl font-semibold">Dashboard</p>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md" 
                    onClick={() =>setIsModalOpen(true)}
                >Create Campaign</button>
            </div>
            <p className="text-2xl font-semibold mb-4">My campaigns:</p>
            <div className="grid grid-cols-3 gap-4">
                {!isPending && data && (
                    data && data.length > 0 ? (
                        data.map((campaign, index) => (
                            <Campaign
                                key={index}
                                campaignAddress={campaign.campaignAddress}
                            />
                        ))
                    ) : (
                        <p>No campaigns found</p>
                    )
                )}
            </div>
            {isModalOpen && (
                <CreateCampaignModal
                    setIsModalOpen={setIsModalOpen}
                />
            )}
        </div>
    )
}

type CreateCampaignModalProps = {
    setIsModalOpen: (value: boolean) => void;
};

const CreateCampaignModal = ({setIsModalOpen} : CreateCampaignModalProps) => {
    const account = useActiveAccount();
    const [campaignName, setCampaignName] = useState<string>("");
    const [campaignDescription, setCampaignDescription] = useState<string>("");
    const [campaignGoal, setCampaignGoal] = useState<number>(1);
    const [campaignDeadline, setCampaignDeadline] = useState<number>(1);
    const [isDeployingContract, setIsDeployingContract] = useState<boolean>(false);

    const handleDeployContract = async () => {
        setIsDeployingContract(true);
        try {
            const contractAddress = await deployPublishedContract({
                client: client,
                chain: sepolia,
                account: account!,
                contractId: "Fundraising",
                contractParams: {
                    name: campaignName,
                    description: campaignDescription,
                    goal: campaignGoal,
                    _durationInDays: campaignDeadline
                },
                publisher: "0x3e1C4B51Fe75F4C1028C17C65092081d6cC59dc3",
                version: "1.0.6"
            });
            alert("Campaign created successfully")
        } catch(error){
            console.error(error);
        } finally{
            setIsDeployingContract(false);
            setIsModalOpen(false);
        }
    };

    const handleCampaignGoal = (value: number) => {
        if(value < 1){
            setCampaignGoal(1);
        }else{
            setCampaignGoal(value);
        }
    }

    const handleCampaignLength = (value: number) => {
        if(value < 1){
            setCampaignDeadline(1);
        }else{
            setCampaignDeadline(value);
        }
    }

    return(
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
            <div className="w-1/2 bg-slate-100 p-6 rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold">Create a Campaign</p>
                    <button
                        className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
                        onClick={() => setIsModalOpen(false)}
                    >Close</button>
                </div>
                <div className="flex flex-col">
                <label>Campaign name:</label>
                    <input 
                        type="text" 
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Campaign name"
                        className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
                    />
                    <label>Campaign description:</label>
                    <textarea
                        value={campaignDescription}
                        onChange={(e) => setCampaignDescription(e.target.value)}
                        placeholder="Campaign description"
                        className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
                    ></textarea>
                    <label>Campaign goal:</label>
                    <input 
                        type="number"
                        value={campaignGoal}
                        onChange={(e) => handleCampaignGoal(parseInt(e.target.value))}
                        className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
                    />
                    <label>{`Campaign length (days)`}</label>
                    <div className="flex space-x-4">
                        <input 
                            type="number"
                            value={campaignDeadline}
                            onChange={(e) => handleCampaignLength(parseInt(e.target.value))}
                            className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
                        />
                    </div>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                        onClick={handleDeployContract}
                        disabled={isDeployingContract}
                    >{
                        isDeployingContract ? "Creating campaign..." : "Create campaign"
                    }</button>
                </div>
            </div>
        </div>
    )

};

