// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./FamilyLucrRewards.sol";

/**
 * @title FamilyGovernance
 * @dev On-chain governance voting module for Munisible Task Force & Family First initiatives.
 */
contract FamilyGovernance is Ownable {

    FamilyLucrRewards public lucrToken;

    enum ProposalStatus { Active, Passed, Rejected, Executed }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
    }

    uint256 public proposalCount;
    uint256 public votingDuration = 3 days;
    uint256 public proposalThreshold = 100 * 10**18; // 100 LUCR required to create a proposal

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Events
    event ProposalCreated(uint256 indexed id, address indexed proposer, string title, uint256 deadline);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _lucrTokenAddress, address initialOwner) Ownable(initialOwner) {
        lucrToken = FamilyLucrRewards(_lucrTokenAddress);
    }

    /**
     * @notice Create a new governance proposal for Task Force or Family initiatives.
     */
    function createProposal(string memory _title, string memory _description) external returns (uint256) {
        require(lucrToken.balanceOf(msg.sender) >= proposalThreshold, "Insufficient LUCR balance to propose");

        proposalCount++;
        uint256 newId = proposalCount;

        proposals[newId] = Proposal({
            id: newId,
            proposer: msg.sender,
            title: _title,
            description: _description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + votingDuration,
            executed: false
        });

        emit ProposalCreated(newId, msg.sender, _title, block.timestamp + votingDuration);
        return newId;
    }

    /**
     * @notice Cast a vote on an active proposal using LUCR token weight.
     */
    function castVote(uint256 _proposalId, bool _support) external {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp < proposal.deadline, "Voting period has ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");

        uint256 voterWeight = lucrToken.balanceOf(msg.sender);
        require(voterWeight > 0, "Must hold LUCR tokens to vote");

        hasVoted[_proposalId][msg.sender] = true;

        if (_support) {
            proposal.votesFor += voterWeight;
        } else {
            proposal.votesAgainst += voterWeight;
        }

        emit Voted(_proposalId, msg.sender, _support, voterWeight);
    }

    /**
     * @notice Execute a passed proposal after the deadline.
     */
    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp >= proposal.deadline, "Voting period is still active");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");

        proposal.executed = true;

        emit ProposalExecuted(_proposalId);
    }
}
