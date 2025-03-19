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

    pub fn initialise_candidate(
        ctx: Context<InitialiseCandidate>,
        candidate_name: String,
        // not used directly
        _poll_id: u64,
    ) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        candidate.candidate_name = candidate_name;
        candidate.candidate_votes = 0;

        let poll = &mut ctx.accounts.poll;
        poll.candidate_amount += 1;
        Ok(())
    }
    pub fn vote(ctx: Context<Vote>, _candidate_name: String, _poll_id: u64) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;

        msg!(
            "Voting for candidate: {} with {} votes atm",
            candidate.candidate_name,
            candidate.candidate_votes
        );

        candidate.candidate_votes += 1;

        msg!(
            "Voted for candidate: {} with {} votes now held",
            candidate.candidate_name,
            candidate.candidate_votes
        );
        Ok(())
    }

    /// List of accounts required when voting
    #[derive(Accounts)]
    #[instruction(candidate_name: String, poll_id: u64)]
    pub struct Vote<'info> {
        /// The signer
        ///
        /// Person who is signing the transaction and asking to vote,
        /// should be the signer of the transaction.
        pub signer: Signer<'info>,

        /// Access candidate account
        ///
        /// We need to access the candidate so that we can increment their number of votes
        #[account(
            mut, // we are mutating this account, so we need to specify this attribute
            seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
            bump // required field
        )]
        pub candidate: Account<'info, Candidate>,
        // NOTE: no accounts are being created, so the system program is not needed.
        //
        // pub system_program: Program<'info, System>,
    }

    /// List of accounts required when initialising a candidate
    #[derive(Accounts)]
    // NOTE: These must be in the same order as function signature
    #[instruction(candidate_name: String, poll_id: u64 )]
    pub struct InitialiseCandidate<'info> {
        /// The signer
        /// Accessed via `ctx.accounts.signer`
        #[account(mut)] // we are getting money from the singer
        pub signer: Signer<'info>,

        /// Accesss to the Poll account
        ///
        /// This is needed to increment the amount of
        /// candidates that are within the Poll.
        ///
        /// accessed via ctx.accounts.poll
        ///
        /// NOTE: we don't need `init` and `space`, since we are not
        /// creating the Poll, just referencing it.
        #[account(
            mut,
            seeds = [poll_id.to_le_bytes().as_ref()],
            bump // required field
        )]
        pub poll: Account<'info, Poll>,

        /// The candidate account
        ///
        /// accessed via ctx.accounts.candidate
        #[account(
            init_if_needed,
            payer = signer,
            space = ANCHOR_DISCRIMINATOR + Candidate::INIT_SPACE,
            seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.to_lowercase().as_bytes()],
            bump // required field
        )]
        pub candidate: Account<'info, Candidate>,

        /// NOTE: This is a required field when accounts are being created
        pub system_program: Program<'info, System>, // a program of type System.
    }

    #[account]
    #[derive(InitSpace)]
    pub struct Candidate {
        #[max_len(32)]
        pub candidate_name: String,
        pub candidate_votes: u64,
    }
    /// List of accounts required when initialising a poll
    #[derive(Accounts)]
    #[instruction(poll_id: u64)] // pull in the paramer for use in seed
    pub struct InitialisePoll<'info> {
        /// The signer of the transaction
        ///
        /// Accessed via `ctx.accounts.signer`
        #[account(mut)] // we are getting money from the singer
        pub signer: Signer<'info>,

        /// An account for the poll
        ///
        /// Accessed via `ctx.accounts.poll`
        #[account(
            init_if_needed,
            payer = signer,
            space = ANCHOR_DISCRIMINATOR + Poll::INIT_SPACE,
            seeds = [poll_id.to_le_bytes().as_ref()],
            bump // NOTE: always required
        )]
        pub poll: Account<'info, Poll>,

        /// NOTE: This is a required field when accounts are being created
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
