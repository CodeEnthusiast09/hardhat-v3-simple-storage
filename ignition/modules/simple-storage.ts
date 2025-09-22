// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `yarn hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { network } from "hardhat";
import hre from "hardhat";
import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";

const { ethers } = await network.connect();
const connectedNetwork = await network.connect();

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    );

    console.log("Deploying contract...");

    const simpleStorage = await SimpleStorageFactory.deploy();
    // Wait for deployment to be mined
    await simpleStorage.waitForDeployment();

    // Get contract address using getAddress() method
    const contractAddress = await simpleStorage.getAddress();
    console.log("Simple Storage deployed to:", contractAddress);

    // We only verify on a testnet!
    if (
        connectedNetwork.networkConfig.chainId === 11155111 &&
        process.env.ETHERSCAN_API_KEY
    ) {
        console.log("Waiting for block confirmations...");

        // Wait for 6 block confirmations before verifying
        const deploymentTx = simpleStorage.deploymentTransaction();

        if (deploymentTx) {
            await deploymentTx.wait(6);
        }

        await verify(contractAddress, []);
    }

    // Get the current value
    let currentValue = await simpleStorage.retrieve();
    console.log(`Current value: ${currentValue}`);

    // Update the value
    console.log("Updating contract...");
    let transactionResponse = await simpleStorage.store(7);

    await transactionResponse.wait(); // returns transaction receipt

    currentValue = await simpleStorage.retrieve();
    console.log(`Current value: ${currentValue}`);
}

const verify = async (contractAddress: string, args: any[]) => {
    console.log("Verifying contract...");
    try {
        await verifyContract(
            {
                address: contractAddress,
                constructorArgs: args,
            },
            hre
        );
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(e);
        }
    }
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
