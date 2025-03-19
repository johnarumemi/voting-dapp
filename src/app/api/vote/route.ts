import { BN, Program } from "@coral-xyz/anchor";
import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, CreatePostResponseError, createPostResponse } from "@solana/actions"
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

// Our Program type
import { Votingdapp } from '../../../../anchor/target/types/votingdapp'

// You can consider the IDL as defining the ABI for our program,
// and containing information for how to call our Solana program.
const IDL = require('../../../../anchor/target/idl/votingdapp.json')
// const IDL = require('@/../anchor/target/idl/votingdapp.json')

// Program ID / Program Address
const votingAddress = new PublicKey("6ShErK8BErTwj4Wut88kkJVxBiSAXdSmUh3qhFAPzaiZ")


// For full End-to-end for progressing an action to the POST, we need an OPTIONS endpoint
export const OPTIONS = GET;

// Get available actions
export async function GET(request: Request) {
    const actionMetadata: ActionGetResponse = {
        icon: "https://m.media-amazon.com/images/I/51E1AxqZueL._AC_SR38,50_AA50_.jpg",
        title: "Vote for your favorite peanut butter",
        description: "Vote between upto 2 candidates",
        // button label for use with the "Blink",
        // not displayed if link.actions is present
        label: "vote for a candidate",
        links: {
            actions: [
                {
                    // Type of action to determine client side handling
                    // It is a post action, so client will know how to use remainder of fields
                    // to continue the action. 
                    type: "post",
                    // triggering this action will call the /api/vote endpoint
                    // with the query parameter candidate=smooth
                    href: "/api/vote?candidate=smooth",
                    // button label
                    label: "Vote for smooth"
                },
                {
                    // action type
                    type: "post",
                    // triggering this action will call the /api/vote endpoint
                    // with the query parameter candidate=crunchy
                    href: "/api/vote?candidate=crunchy",
                    // button label
                    label: "Vote for crunchy"
                },
            ]
        }
    }
    return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(request: Request) {

    // Get URL query params
    const url = new URL(request.url)
    const candidate = url.searchParams.get("candidate") ?? ''

    console.debug(`Candidate voted for: ${candidate}`)

    if (candidate != 'crunchy' && candidate != 'smooth') {
        // NOTE: this is not a valid action response...
        const body: CreatePostResponseError = {
            name: "CreatePostResponseError",
            message: "Invalid candidate"
        };
        return Response.json(body, { status: 400, headers: ACTIONS_CORS_HEADERS })

    }
    // Create a transaction via using following:
    // 1. A Blockhash
    // 2. The message / instruction to add to the transactionn
    // 3. Any signatures that need to be added to the transaction
    // local test validator
    //
    // commitment_status: 
    // Tell us how certain they are of a transaction making it on a cluster.
    // - process level: I found but it's not yet ocnfir
    // - confirmed level: confirmed by 66% of cluster
    // - finialised level: confirmed by 66% and there have been 31 blocks
    // afterwards that were also confirmed. This takes a lot longer than
    // confirmed and confirmed is usually good enough.
    //
    // NOTE: we are not signing on the server side, just adding the signer
    //
    // The incoming request has a payload that includes the users pubkey / address.

    // Connection is used as provider to the Program now, rather than the Bankrun used in tests
    // This is a connection to our local solana-test-validator
    const connection = new Connection("http://127.0.0.1:8899", "confirmed")
    const program: Program<Votingdapp> = new Program(IDL, { connection })

    const body: ActionPostRequest = await request.json()

    let voter: PublicKey;

    // use PublicKey to confirm it's a valid address as well.
    try {
        voter = new PublicKey(body.account);
    } catch (error) {
        console.error(`invalid account address passed to server: ${body.account}`)
        return new Response("Invalid account", { status: 400, headers: ACTIONS_CORS_HEADERS })
    }
    console.log(`Voter: ${voter.toBase58()}`)

    // candidate address is derived from poll_id and candidate_id.
    // At the moment, the string name is case sensitive.

    // Rather than making a rpc to the cluster, we will instead just extract the instruction first.
    // This will be added to the transaction.
    const instruction = await program.methods.vote(
        candidate,
        new BN(1), // poll_id
    )
        // Inform the instruction that it is not the server signing it, but it will be signed somewhere else.
        // We require it to verify that the signer equals the user that passed in the original request via the blink.
        .accounts({
            signer: voter
        })
        .instruction();

    // Tell us when the blockhash expires (after ~ 150 confirmed blocks)
    // If your trying to use it and it's too late, it's gone.
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

    console.debug(`Blockhash: ${blockhash}, Last Valid Block Height: ${lastValidBlockHeight}`)
    // Create a new transaction. A transaction can contain 1 or more instructions.
    // We need to specify what the transaction is expecting.
    const tx = new Transaction({
        feePayer: voter,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
    }).add(instruction)

    // Return transaction back to user on the blink for them to sign
    const response = await createPostResponse({
        fields: {
            // Action type so that the client knows how to handle the response.
            type: "transaction",
            transaction: tx
        },
    })

    return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}
