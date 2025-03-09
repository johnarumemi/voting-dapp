#![allow(clippy::result_large_err, unused, unexpected_cfgs)]

use anchor_lang::prelude::*;

// The public address of this program on the blockchain.
declare_id!("6ShErK8BErTwj4Wut88kkJVxBiSAXdSmUh3qhFAPzaiZ");

pub const ANCHOR_DISCRIMINATOR: usize = 8;

#[program]
pub mod votingdapp {
    use super::*;

    pub fn initialise_poll(
        ctx: Context<InitialisePoll>,
        poll_id: u64,
        poll_start: u64,
        poll_end: u64,
        description: String,
    ) -> anchor_lang::Result<()> {
        let poll = &mut ctx.accounts.poll;

        // We write out initial state to this poll account.
        poll.poll_id = poll_id;
        poll.poll_start = poll_start;
        poll.poll_end = poll_end;
        poll.description = description;
        poll.candidate_amount = 0;

        // instruction completed successfully
        Ok(())
    }

    /// List of accounts
    #[derive(Accounts)]
    #[instruction(poll_id: u64)] // pull in the paramer for use in seed
    pub struct InitialisePoll<'info> {
        // The signer
        // Accessed via `ctx.accounts.signer`
        #[account(mut)] // we are getting money from the singer
        pub signer: Signer<'info>,

        // An account for the poll
        //
        // Accessed via `ctx.accounts.poll`
        #[account(
            init_if_needed,
            payer = signer,
            space = ANCHOR_DISCRIMINATOR + Poll::INIT_SPACE,
            seeds = [poll_id.to_le_bytes().as_ref()],
            bump // NOTE: always required
        )]
        pub poll: Account<'info, Poll>,

        /// NOTE: This is a required field
        pub system_program: Program<'info, System>, // a program of type System.
    }

    #[account]
    #[derive(InitSpace)] // tell Anchor about size of struct
    pub struct Poll {
        pub poll_id: u64,
        #[max_len(280)]
        pub description: String,
        /// unix timestamp
        pub poll_start: u64,
        pub poll_end: u64,
        /// Number of candidates for this poll
        pub candidate_amount: u64,
    }
}
