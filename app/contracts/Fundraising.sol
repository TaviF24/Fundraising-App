// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Fundraising{
    
    string public campaignName;
    string public description;
    uint256 public goal;
    uint256 public deadline;
    address public owner;
    bool public isPaused;

    enum CampaignState{
        Active,
        Successful,
        Failed
    }

    CampaignState public campaignState;

    struct Tier{
        string name;
        uint256 amount;
        uint256 uses; // how many people used this tier
    }

    struct Funder{
        uint256 contribution;
        mapping(uint256 => bool) fundedTiers;
    }

    Tier[] public tiers;
    mapping(address => Funder) public funders;

    modifier onlyOwner(){
        require(msg.sender == owner, "!Not the owner!");
        _;
    }

    modifier campaignOpen(){
        require(campaignState == CampaignState.Active, "!Campaign is not active!");
        _;
    }

    modifier notPaused(){
        require(!isPaused, "!The campaign is paused!");
        _;
    }

    event HasFunded(address indexed campaignAddress, address funder, string message);

    event WithdrawAvailable(address indexed campaignAddress, string message);

    event RefundAvailable(address indexed campaignAddress, string campaignName, string message);

    constructor(address _owner, string memory _campaignName, string memory _description, uint256  _goal, uint256  _nrOfDays){
        campaignName = _campaignName;
        description = _description;
        goal = _goal;
        deadline = block.timestamp + (_nrOfDays * 1 days);
        owner = _owner;
        campaignState = CampaignState.Active;
    }

    function checkCampaignState() private view returns (bool) {
        return campaignState == CampaignState.Active;
    }

    function updateCampaignState() internal /*campaignOpen*/{
        if(checkCampaignState()){
            if(deadline > block.timestamp){     // the deadline is not over
                if(goal <= getContractBalance()){    // the goal has been reached
                    campaignState = CampaignState.Successful;
                    emit WithdrawAvailable(address(this), "Withdrawal available");
                }
                else{
                    campaignState = CampaignState.Active;
                }
            }else{                          // the deadline is over
                if(goal <= getContractBalance()){    // the goal has been reached
                    campaignState = CampaignState.Successful;
                    emit WithdrawAvailable(address(this), "Withdrawal available");
                }
                else{                               
                    campaignState = CampaignState.Failed;
                    emit RefundAvailable(address(this), campaignName, "Refund available, campaign not successful");
                }
            }
        }
    }

    function fund(uint256 tierIndex) public payable campaignOpen notPaused{
        validIndex(tierIndex);
        require(msg.value == tiers[tierIndex].amount, "!Please select one of the options for amount!");  
        tiers[tierIndex].uses++;
        funders[msg.sender].contribution += msg.value;
        funders[msg.sender].fundedTiers[tierIndex] = true;
        emit HasFunded(address(this), msg.sender, "Funded");
        updateCampaignState();
    }

    function withdraw() public onlyOwner{
        updateCampaignState();
        require(campaignState == CampaignState.Successful, "!Campaign is not successful (yet)!");

        uint256 balance = address(this).balance;
        require(balance > 0, "!No balance!");

        payable(owner).transfer(balance);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function validIndex(uint256 tierIndex) internal view {
        require(tierIndex>=0 && tierIndex < tiers.length, "!Invalid index!");
    }

    function addTier(string memory _name, uint256 _amount) public onlyOwner campaignOpen(){
        require(_amount > 0, "!The amount must be greater than zero!");
        tiers.push(Tier(_name, _amount, 0));
    }

    function removeTier(uint256 index) public onlyOwner{
        validIndex(index);
        tiers[index] = tiers[tiers.length-1];
        tiers.pop();    
    }

    function refund() public {
        updateCampaignState();
        require(campaignState == CampaignState.Failed, "!No refunds!");
        uint256 amount = funders[msg.sender].contribution;
        require(amount > 0, "!Nothing to refund!");

        payable(msg.sender).transfer(amount);
        funders[msg.sender].contribution = 0;
    }

    function isFunder(address user, uint256 tierIndex) public view returns (bool) {
        return funders[user].fundedTiers[tierIndex];
    }

    function getTiers() public view returns(Tier[] memory){
        return tiers;
    }

    function togglePause() public onlyOwner{
        isPaused = !isPaused;
    }

    function getCampaignStatus() public view returns (CampaignState) {
        return campaignState;
    }

    function addDays(uint256 daysToAdd) private pure returns(uint256 _deadline){
        _deadline += daysToAdd * 1 days;
    }

    function extendDeadline(uint256 daysToAdd) public onlyOwner campaignOpen{
        deadline = addDays(daysToAdd);
    }
}