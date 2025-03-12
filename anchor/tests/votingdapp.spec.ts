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

    let context;
    let provider: BankrunProvider;
    let votingProgram: Program<Votingdapp>;

    // This will run before all tests in this suite (once only)
    beforeAll(async () => {

        // NOTE: name must match the Program name. See Anchor.toml file for valid names.
        context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);

        provider = new BankrunProvider(context);

        votingProgram = new Program<Votingdapp>(
            IDL,
            provider,
        );

    })

    it('Initialises Poll', async () => {

        const description = "What is your favourte colour?"

        const pollId = 1
        const pollStart = 0
        const pollEnd = 1841543877

        // represent a u64 using BN (Big Number)
        const tx = await votingProgram.methods.initialisePoll(
            new BN(pollId),
            new BN(pollStart),
            new BN(pollEnd),
            description,
        )
            // Will call the initialisePoll method on the smart contract
            .rpc();

        const [poll_address] = PublicKey.findProgramAddressSync(
            [new BN(pollId).toArrayLike(Buffer, "le", 8)],
            votingAddress
        );

        // fetch the poll account from this address
        const poll = await votingProgram.account.poll.fetch(poll_address);
        console.log(poll)

        // get poll address from the program derived address
        console.log('Your transaction signature', tx);

        expect(poll.pollId.toNumber()).toEqual(pollId)
        expect(poll.pollStart.toNumber()).toEqual(pollStart)
        expect(poll.pollEnd.toNumber()).toEqual(pollEnd)
        expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
        expect(poll.description).toEqual(description)
    }, 15000) // 15 seconds

    it("Initialises Candidate", async () => {

        const candidate_name_1 = "Candidate-1"
        const candidate_name_2 = "Candidate-2"

        const pollId = 1

        const tx1 = await votingProgram.methods.initialiseCandidate(
            candidate_name_1,
            new BN(pollId)
        ).rpc();

        const tx2 = await votingProgram.methods.initialiseCandidate(
            candidate_name_2,
            new BN(pollId)
        ).rpc();

        const [candidate_address_1] = PublicKey.findProgramAddressSync(
            [new BN(pollId).toArrayLike(Buffer, "le", 8), Buffer.from(candidate_name_1)],
            votingAddress

        )

        const candidate_1 = await votingProgram.account.candidate.fetch(candidate_address_1)

        const [candidate_address_2] = PublicKey.findProgramAddressSync(
            [new BN(pollId).toArrayLike(Buffer, "le", 8), Buffer.from(candidate_name_2)],
            votingAddress

        )

        const candidate_2 = await votingProgram.account.candidate.fetch(candidate_address_2)

        expect

        console.log(`Your transaction signature for candidate1 ${tx1}`);
        console.log(candidate_1)

        console.log(`Your transaction signature for candidate2 ${tx2}`);
        console.log(candidate_2)

    }, 15000)

})
