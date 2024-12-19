import { EndpointId } from '@layerzerolabs/lz-definitions'

//Defining which contract will be use in Sepolia
const sepoliaContract = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'Sender',
}

//Defining which contract will be used in Solana
const solanaContract = {
    eid: EndpointId.SOLANA_V2_TESTNET,
    contractName: 'Receiver',
}

export default {

    // Define the contracts to be deployed on each network
    // Each contract is associated with a specific blockchain.
    contracts: [
        {
            contract: sepoliaContract,
            
        },
        {
            contract: solanaContract,
        },
        
    ],

    // Define the pathway between each contract.
    // This allows for cross-chain communication using LayerZero.
    connections: [
        {
            from: sepoliaContract,
            to: solanaContract,
            //config: {}
            
        },
        {
            from: solanaContract,
            to: sepoliaContract,
            //config: {}
        },
    ],
     
}

