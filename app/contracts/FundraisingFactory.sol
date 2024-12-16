// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Fundraising} from "./Fundraising.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FundraisingFactory is Ownable{

    bool public isPaused;

    struct Campaign{
        address campaignAddress;
        address owner;
        string name;
        uint256 creationTime;
    }

    Campaign[] public campaigns;

    mapping(address => Campaign[]) public userCampaigns; 

    modifier notPaused(){
        require(!isPaused, "!The campaign is paused!");
        _;
    }

    // constructor() Ownable(msg.sender){}

    function createCampaign(string memory _name, string memory _description, uint256 _goal, uint256 _durationInDays) external notPaused  {
        Fundraising newFRCampaign = new Fundraising(msg.sender, _name, _description, _goal, _durationInDays);
        address campaignAddress = address(newFRCampaign);

        Campaign memory campaign = Campaign(campaignAddress, msg.sender, _name, block.timestamp);
        campaigns.push(campaign);
        userCampaigns[msg.sender].push(campaign);
    }

    function getUserCampaign(address _user) external view returns(Campaign[] memory){
        return userCampaigns[_user];
    }

    function getAllCampaigns() external view returns(Campaign[] memory){
        return campaigns;
    }

    function togglePause() external onlyOwner{
        isPaused = !isPaused;
    }
}