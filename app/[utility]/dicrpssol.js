// sendPrize.js
import { ethers } from "ethers";

// Contract details
const CONTRACT_ADDRESS = "0x8D7aDc07999DD446703b6221b05a681D6CFfd0B5";
const ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tier",
				"type": "uint256"
			}
		],
		"name": "joinGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "PlayerJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "prize",
				"type": "uint256"
			}
		],
		"name": "PlayerWon",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "winner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "sendPrize",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ENTRY_PRICE_1",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ENTRY_PRICE_2",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ENTRY_PRICE_3",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Provider (RPC endpoint)
const provider = new ethers.JsonRpcProvider("https://dream-rpc.somnia.network");

// Owner wallet (must be deployer of the contract)
const privateKey = process.env.PRIVATE_KEY || "0xa393bb4110a15845af63020d7687985e3d68dceb62a621915676886f4f5fb42c";
const wallet = new ethers.Wallet(privateKey, provider);

// Contract instance with signer
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// Exported function
export async function sendPrizeToWinner(winnerAddress, amountInEth) {
  try {
    // Validate inputs
    if (!winnerAddress || !ethers.isAddress(winnerAddress)) {
      throw new Error("Invalid winner address");
    }
    
    if (!amountInEth || amountInEth <= 0) {
      throw new Error("Invalid amount");
    }

    console.log(`🎯 Sending ${amountInEth} ETH to ${winnerAddress}`);
    
    // Check contract balance first
    const contractBalance = await contract.getBalance();
    const amountWei = ethers.parseEther(amountInEth.toString());
    
    console.log(`Contract balance: ${ethers.formatEther(contractBalance)} ETH`);
    console.log(`Amount to send: ${amountInEth} ETH`);
    
    if (contractBalance < amountWei) {
      throw new Error("Insufficient contract balance");
    }

    // Set gas limit and gas price explicitly to avoid estimation issues
    const gasLimit = 100000; // Adjust based on your contract's needs
    const gasPrice = await provider.getFeeData();
    
    const tx = await contract.sendPrize(winnerAddress, amountWei, {
      gasLimit: gasLimit,
      gasPrice: gasPrice.gasPrice
    });
    
    console.log(`📤 Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`✅ Prize sent successfully!`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Winner: ${winnerAddress}`);
      console.log(`   Amount: ${amountInEth} ETH`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      return tx.hash;
    } else {
      throw new Error("Transaction failed");
    }
    
  } catch (error) {
    console.error("❌ Error sending prize:", error.message);
    
    // More detailed error handling
    if (error.code === "INSUFFICIENT_FUNDS") {
      console.error("❌ Insufficient funds in wallet");
    } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
      console.error("❌ Gas estimation failed - contract may revert");
    } else if (error.reason) {
      console.error("❌ Contract revert reason:", error.reason);
    }
    
    throw error;
  }
}

// Helper function to check contract balance
export async function getContractBalance() {
  try {
    const balance = await contract.getBalance();
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("❌ Error getting contract balance:", error);
    throw error;
  }
}

// Helper function to validate if address is the contract owner
export async function isOwner(address) {
  try {
    const owner = await contract.owner();
    return owner.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error("❌ Error checking owner:", error);
    throw error;
  }
}