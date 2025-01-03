'use client';
import donationIcon from "@public/donation.png"
import Image from "next/image";
import Link from "next/link";
import { ConnectButton, lightTheme, useActiveAccount } from "thirdweb/react";
import { client } from "../client";
const Navbar = () => {
    const account = useActiveAccount();

    return (
        <nav className="bg-stone-300 border-b-2 border-b-slate-300">
            <div className="mx-10 px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="flex w-full items-center justify-between">
                        <div className="flex flex-shrink-0 items-center">
                            <Link href={'/'}>
                                <Image 
                                    src={donationIcon} alt="icon" width={50} height={50} 
                                    style={{filter:"drop-shadow(0px 0px 24px #C7B8B1)"}}
                                />
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-24">
                                <Link href={'/'}>
                                    <p className="rounded-md px-3 py02 text-lg font-semibold text-slate-700">Campaigns</p>
                                </Link>
                                {account && (
                                    <Link href={`/dashboard/${account?.address}`}>
                                        <p className="rounded-md px-3 py02 text-lg font-semibold text-slate-700">Dashboard</p>
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            <ConnectButton client={client} theme={lightTheme()} detailsButton={{style: {maxHeight: "50px"}}} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
};

export default Navbar;