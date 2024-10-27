import {Addressable, AddressLike, ethers} from "ethers";
import {getJsonRpcProvider} from "./utils";

const contractAddress = '0x000000000000000000000000000000000000080a';
const abi = [
    // ABI for the "nonces" function
    "function nonces(address owner) view returns (uint256)"
];


export async function getNonce(forAddress: AddressLike) {
    const contract = new ethers.Contract(contractAddress, abi, getJsonRpcProvider());
    try {
        const nonce = await contract.nonces(forAddress);
        console.log("Nonce for address:", forAddress, "is", nonce.toString());
        return nonce;
    } catch (error) {
        console.error("Error fetching nonce:", error);
    }
}