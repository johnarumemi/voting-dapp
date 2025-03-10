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

        const description = "What is your favourte colour?"

        let startTime = performance.now();
        // name must match the Program name. See Anchor.toml file for valid names.
        const context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);
        let duration = performance.now() - startTime;

        console.log(`Created context in ${duration} milliseconds`)

        startTime = performance.now();
        const provider = new BankrunProvider(context);
        duration = performance.now() - startTime;
        console.log(`Created provider in ${duration} milliseconds`)

        startTime = performance.now();
        const votingProgram = new Program<Votingdapp>(
            IDL,
            provider,
        );
        duration = performance.now() - startTime;
        console.log(`Created voting_app in ${duration} milliseconds`)

        // represent a u65 using BN (Big Number)
        startTime = performance.now();
        const tx = await votingProgram.methods.initialisePoll(
            new BN(1),
            new BN(0),
            new BN(1841543877),
            "What is your favourte colour?",
        )
            // Will call the initialisePoll method on the smart contract
            .rpc();

        duration = performance.now() - startTime;
        console.log(`poll initialised in ${duration} milliseconds`)

        const [poll_address] = PublicKey.findProgramAddressSync(
            [new BN(1).toArrayLike(Buffer, "le", 8)],
            votingAddress
        );

        // fetch the poll account from this address
        const poll = await votingProgram.account.poll.fetch(poll_address);
        console.log(poll)

        // get poll address from the program derived address
        console.log('Your transaction signature', tx);

        expect(poll.pollId.toNumber()).toEqual(1)
        expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
    }, 15000) // 15 seconds

})
