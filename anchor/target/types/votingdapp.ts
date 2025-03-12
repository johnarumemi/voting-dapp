/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/votingdapp.json`.
 */
export type Votingdapp = {
  "address": "6ShErK8BErTwj4Wut88kkJVxBiSAXdSmUh3qhFAPzaiZ",
  "metadata": {
    "name": "votingdapp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initialiseCandidate",
      "discriminator": [
        74,
        22,
        12,
        191,
        166,
        245,
        85,
        189
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The signer",
            "Accessed via `ctx.accounts.signer`"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "poll",
          "docs": [
            "Accesss to the Poll account",
            "",
            "This is needed to increment the amount of",
            "candidates that are within the Poll.",
            "",
            "accessed via ctx.accounts.poll",
            "",
            "NOTE: we don't need `init` and `space`, since we are not",
            "creating the Poll, just referencing it."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        },
        {
          "name": "candidate",
          "docs": [
            "The candidate account",
            "",
            "accessed via ctx.accounts.candidate"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              },
              {
                "kind": "arg",
                "path": "candidateName"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "NOTE: This is a required field"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "candidateName",
          "type": "string"
        },
        {
          "name": "pollId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialisePoll",
      "discriminator": [
        24,
        62,
        111,
        85,
        129,
        106,
        131,
        175
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The signer of the transaction",
            "",
            "Accessed via `ctx.accounts.signer`"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "poll",
          "docs": [
            "An account for the poll",
            "",
            "Accessed via `ctx.accounts.poll`"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "NOTE: This is a required field"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u64"
        },
        {
          "name": "pollStart",
          "type": "u64"
        },
        {
          "name": "pollEnd",
          "type": "u64"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "candidate",
      "discriminator": [
        86,
        69,
        250,
        96,
        193,
        10,
        222,
        123
      ]
    },
    {
      "name": "poll",
      "discriminator": [
        110,
        234,
        167,
        188,
        231,
        136,
        153,
        111
      ]
    }
  ],
  "types": [
    {
      "name": "candidate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "candidateName",
            "type": "string"
          },
          {
            "name": "candidateVotes",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "poll",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pollId",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "pollStart",
            "docs": [
              "unix timestamp"
            ],
            "type": "u64"
          },
          {
            "name": "pollEnd",
            "type": "u64"
          },
          {
            "name": "candidateAmount",
            "docs": [
              "Number of candidates for this poll"
            ],
            "type": "u64"
          }
        ]
      }
    }
  ]
};
