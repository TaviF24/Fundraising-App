'use client'
import { getContract } from "thirdweb";
import { client } from "./client";
import { sepolia } from "thirdweb/chains";
import { FUNDRAISING_FACTORY } from "./constants/contracts";
import { useReadContract } from "thirdweb/react";
import Campaign from "./components/campaign";

export default function Home() {
  const contract = getContract({
    client: client,
    chain: sepolia,
    address: FUNDRAISING_FACTORY
  })

  const { data: campaings, isLoading } = useReadContract({
    contract,
    method:
      "function getAllCampaigns() view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
    params: [],
  });

  const { data: price, isPending: isPendingPrice } = useReadContract({
    contract,
    method:
      "function getCurrentPrice() view returns (int256)",
    params: [],
  });
  // console.log(campaings);


  return (
    <main className="mx-auto max-w-7xl px-4 mt-4 sm:px-6 lg:px-8">
      <div className="py-10">
        <div className="flex justify-between">
          <h1 className="text-4xl font-bold mb-4">Campaigns:</h1>
          <div className="bg-stone-700 text-white rounded-md px-3 h-8 flex items-center justify-center">
            {!isPendingPrice? (
            <h2>ETH/USD Price: {Number(price)/1e8} USD</h2>
            ) : (<h2>Loading price...</h2>)}
          </div>
          
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {!isLoading && campaings && (
            campaings.length > 0 ?(
              campaings.map((campaing) => (
                <Campaign
                  key={campaing.campaignAddress}
                  campaignAddress={campaing.campaignAddress}
                />
            ))
            ) : (
              <p>No campaigns were found</p>
            )
          )}
        </div>
      </div>
    </main>
  );
}
