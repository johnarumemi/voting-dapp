import { BankrunProvider, startAnchor } from "anchor-bankrun";
// use import from solana-nakrun to get docstrings in IDE correctly
// import { startAnchor } from "solana-bankrun";
import { BN, Program } from "@coral-xyz/anchor";
import * as anchor from '@coral-xyz/anchor'
// import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from "@solana/web3.js";


// Our Program type
import { Votingdapp } from '../target/types/votingdapp'

// You can consider the IDL as defining the ABI for our program,
// and containing information for how to call our Solana program.
const IDL = require('../target/idl/votingdapp.json')

const PROGRAM_ID = new PublicKey("6ShErK8BErTwj4Wut88kkJVxBiSAXdSmUh3qhFAPzaiZ")

// Can now create the context and provider that allows us to interact with our
// smart contract.
//
// see https://github.com/kevinheavey/anchor-bankrun for how to use this
// testing framework to test our smart contracts.
describe('Voting', () => {

    let context;
    let signerKeypair: Keypair;

    // a BankrunProvider is used for testing
    let provider: BankrunProvider;
    let votingProgram: Program<Votingdapp>;


    // This will run before all tests in this suite (once only)
    beforeAll(async () => {

        // NOTE: name must match the Program name. See Anchor.toml file for valid names.
        //
        // Method: startAnchor— Initializes a bank server and client. Arguments include:
        // * Program name (must match the `.so` file in `fixtures`),
        // * Program ID, and
        // * Accounts, including the desired lamports for each.
        // context: Encapsulates the initialized Bankrun instance

        // console.log("Starting Anchor")
        // context = await startAnchor("", [{ name: "votingdapp", programId: PROGRAM_ID }], []);
        // console.log("Started Anchor")

        // signerKeypair = context.payer;

        // console.log("Signer Public Key: ", signerKeypair.publicKey)

        // // Use the BankrunProvider to interact with the program
        // provider = new BankrunProvider(context);

        // // Override the default provider to use the BankrunProvider
        // anchor.setProvider(provider);

        // votingProgram = new Program<Votingdapp>(
        //     IDL,
        //     provider,
        // );

        // NOTE: to use tests to setup local validator, 
        // comment out all previous code and uncomment below.
        anchor.setProvider(anchor.AnchorProvider.env())
        votingProgram = anchor.workspace.Votingdapp as Program<Votingdapp>;
    })

    it('Initialises Poll', async () => {

        const description = "What is your favourite peanut butter?"

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
            // .accounts([{ signer: signerKeypair.publicKey }])
            // .signers([signerKeypair])

            // Will call the initialisePoll method on the smart contract
            .rpc();

        const [poll_address] = PublicKey.findProgramAddressSync(
            [new BN(pollId).toArrayLike(Buffer, "le", 8)],
            PROGRAM_ID
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

        const candidate_name_1 = "crunchy".toLowerCase()
        const candidate_name_2 = "smooth".toLowerCase()

        const pollId = 1

        const tx1 = await votingProgram.methods.initialiseCandidate(
            candidate_name_1,
            new BN(pollId)
        )
            // .accounts([{ signer: signerKeypair.publicKey }])
            .rpc();

        const tx2 = await votingProgram.methods.initialiseCandidate(
            candidate_name_2,
            new BN(pollId)
        )

            // .accounts([{ signer: signerKeypair.publicKey }])
            .rpc();

        // derive addresses
        const [candidate_address_1] = PublicKey.findProgramAddressSync(
            [new BN(pollId).toArrayLike(Buffer, "le", 8), Buffer.from(candidate_name_1)],
            PROGRAM_ID
        )

        const [candidate_address_2] = PublicKey.findProgramAddressSync(
            [new BN(pollId).toArrayLike(Buffer, "le", 8), Buffer.from(candidate_name_2)],
            PROGRAM_ID
        )

        const [poll_address] = PublicKey.findProgramAddressSync(
            [new BN(pollId).toArrayLike(Buffer, "le", 8)],
            PROGRAM_ID
        )

        // fetch accounts
        const candidate_1 = await votingProgram.account.candidate.fetch(candidate_address_1)


        const candidate_2 = await votingProgram.account.candidate.fetch(candidate_address_2)


        const poll = await votingProgram.account.poll.fetch(poll_address)

        console.log(`Your transaction signature for candidate1 ${tx1}`);
        console.log(candidate_1)

        console.log(`Your transaction signature for candidate2 ${tx2}`);
        console.log(candidate_2)

        expect(candidate_1.candidateVotes.toNumber()).toEqual(0)
        expect(candidate_2.candidateVotes.toNumber()).toEqual(0)
        expect(poll.candidateAmount.toNumber()).toEqual(2)

    }, 15000)

    it("votes", async () => {

        const candidate_name_1 = "crunchy".toLowerCase()
        const candidate_name_2 = "smooth".toLowerCase()

        const pollId = 1

        // vote for candidate 1
        const tx1 = await votingProgram.methods.vote(

            candidate_name_1,
            new BN(pollId)
        )
            // .accounts([{ signer: signerKeypair.publicKey }])
            .rpc();

        // derive the candidate address
        const [candidate_address_1] = PublicKey.findProgramAddressSync(
            [new BN(pollId).toArrayLike(Buffer, "le", 8), Buffer.from(candidate_name_1)],
            PROGRAM_ID

        )

        const [candidate_address_2] = PublicKey.findProgramAddressSync(
            [new BN(pollId).toArrayLike(Buffer, "le", 8), Buffer.from(candidate_name_2)],
            PROGRAM_ID)

        // fetch the candidate account info from the program
        const candidate_1 = await votingProgram.account.candidate.fetch(candidate_address_1);


        const candidate_2 = await votingProgram.account.candidate.fetch(candidate_address_2)

        console.log(`Your transaction signature for candidate1 ${tx1}`);
        console.log(candidate_1)

        console.log("Candidate 2");
        console.log(candidate_2)

        expect(candidate_1.candidateVotes.toNumber()).toEqual(1)
        expect(candidate_2.candidateVotes.toNumber()).toEqual(0)

    }, 15000)

})
