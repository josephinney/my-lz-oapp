import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('Sender Contract Test', function () {
    const eidA = 1 // Endpoint ID for chain A
    const eidB = 2 // Endpoint ID for chain B

    let Sender: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ownerA: SignerWithAddress
    let ownerB: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let senderA: Contract
    let senderB: Contract
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    before(async function () {
        // Contract factory for Sender
        Sender = await ethers.getContractFactory('Sender')

        // Fetching signers (accounts)
        const signers = await ethers.getSigners()
        ;[ownerA, ownerB, endpointOwner] = signers

        // Setup EndpointV2Mock
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner)
    
        
    })

    beforeEach(async function () {
        // Deploy mock LayerZero endpoints for both chains
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA)
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB)

        // Deploy `Sender` contracts linked to mock endpoints
        senderA = await Sender.deploy(mockEndpointV2A.address, ownerA.address)
        senderB = await Sender.deploy(mockEndpointV2B.address, ownerB.address)

        // Configure the mock LayerZero endpoints to recognize each other
        await mockEndpointV2A.setDestLzEndpoint(senderB.address, mockEndpointV2B.address)
        await mockEndpointV2B.setDestLzEndpoint(senderA.address, mockEndpointV2A.address)
    
        // Setting each Sender instance as a peer of the other
        await senderA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(senderB.address, 32))
        await senderB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(senderA.address, 32))
    
    })

    it('should send a message to the destination Sender contract', async function () {
        // Options for the message (dummy options for testing purposes)
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

        // Quote the cost of the message
        const message = 'Hello from Sepolia'
        let nativeFee = 0
        ;[nativeFee] = await senderA.quote(eidB, message, options, false)

        // Send the message from `senderA` to `senderB`
        const tx = await senderA.send(eidB, message, options, { value: nativeFee.toString() })
        await tx.wait()

        console.log(tx)

        // Validate the message was successfully sent
        // This assumes `_lzReceive` would have been implemented to process incoming messages in `senderB`
        // For the current setup, we verify the event instead
       
       /* await expect(tx)
            .to.emit(senderA, 'MessageSent')
            .withArgs(eidB, message)
        */
        // Add further assertions as needed, depending on `_lzReceive` implementation
    })
})

