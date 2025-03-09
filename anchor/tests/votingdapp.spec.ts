import { BankrunProvider } from "anchor-bankrun";
// use import from solana-nakrun to get docstrings in IDE correctly
import { startAnchor } from "solana-bankrun";
import { BN, Program } from "@coral-xyz/anchor";
import * as anchor from '@coral-xyz/anchor'
// import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from "@solana/web3.js";

// Our Program type
import { Votingdapp } from '../target/types/votingdapp'

// You can consider the IDL as defining the ABI for our program,
// and containing information for how to call our Solana program.
const IDL = require('../target/idl/votingdapp.json')

const votingAddress = new PublicKey("6ShErK8BErTwj4Wut88kkJVxBiSAXdSmUh3qhFAPzaiZ")

// Can now create the context and provider that allows us to interact with our
// smart contract.
//
// see https://github.com/kevinheavey/anchor-bankrun for how to use this
// testing framework to test our smart contracts.
describe('Voting', () => {

    it('Initialise Poll', async () => {

        // name must match the Program name. See Anchor.toml file for valid names.
        const context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);

        const provider = new BankrunProvider(context);

        const votingProgram = new Program<Votingdapp>(
            IDL,
            provider,
        );

        // represent a u65 using BN (Big Number)
        const tx = await votingProgram.methods.initialisePoll(
            new BN(1),
            new BN(0),
            new BN(1841543877),
            "What is your favourte colour?",
        )
            // Will call the initialisePoll method on the smart contract
            .rpc();

        console.log('Your transaction signature', tx);
    }, 15000) // 15 seconds

})
