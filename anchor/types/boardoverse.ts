/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/boardo_contract.json`.
 */
export type BoardoContract = {
  "address": "AJsNVAr3m5wGLwY9bALRDsX9zeg9VvDJNCAHnpgUwpoc",
  "metadata": {
    "name": "boardoContract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createGame",
      "discriminator": [
        124,
        69,
        75,
        66,
        184,
        220,
        72,
        206
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  66,
                  79,
                  65,
                  82,
                  68,
                  79,
                  86,
                  69,
                  82,
                  83,
                  69
                ]
              },
              {
                "kind": "arg",
                "path": "gameId"
              }
            ]
          }
        },
        {
          "name": "player1",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        },
        {
          "name": "betAmount",
          "type": "u64"
        },
        {
          "name": "arbiter",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "declareWinner",
      "discriminator": [
        140,
        135,
        197,
        50,
        9,
        23,
        4,
        80
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  66,
                  79,
                  65,
                  82,
                  68,
                  79,
                  86,
                  69,
                  82,
                  83,
                  69
                ]
              },
              {
                "kind": "arg",
                "path": "gameId"
              }
            ]
          }
        },
        {
          "name": "arbiter",
          "writable": true,
          "signer": true
        },
        {
          "name": "player1",
          "writable": true
        },
        {
          "name": "player2",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": "pubkey"
        },
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    },
    {
      "name": "joinGame",
      "discriminator": [
        107,
        112,
        18,
        38,
        56,
        173,
        60,
        128
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  66,
                  79,
                  65,
                  82,
                  68,
                  79,
                  86,
                  69,
                  82,
                  83,
                  69
                ]
              },
              {
                "kind": "arg",
                "path": "gameId"
              }
            ]
          }
        },
        {
          "name": "player2",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    },
    {
      "name": "stopGame",
      "discriminator": [
        221,
        21,
        45,
        30,
        166,
        61,
        130,
        127
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  66,
                  79,
                  65,
                  82,
                  68,
                  79,
                  86,
                  69,
                  82,
                  83,
                  69
                ]
              },
              {
                "kind": "arg",
                "path": "gameId"
              }
            ]
          }
        },
        {
          "name": "arbiter",
          "writable": true,
          "signer": true
        },
        {
          "name": "player1",
          "writable": true
        },
        {
          "name": "player2",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientFunds",
      "msg": "Insufficient funds in token account"
    },
    {
      "code": 6001,
      "name": "invalidBetAmount",
      "msg": "Invalid bet amount"
    },
    {
      "code": 6002,
      "name": "gameNotWaitingForPlayer2",
      "msg": "Game is not waiting for player 2"
    },
    {
      "code": 6003,
      "name": "gameAlreadyFull",
      "msg": "Game is already full"
    },
    {
      "code": 6004,
      "name": "cannotPlayAgainstSelf",
      "msg": "Cannot play against yourself"
    },
    {
      "code": 6005,
      "name": "unauthorizedArbiter",
      "msg": "Unauthorized arbiter"
    },
    {
      "code": 6006,
      "name": "gameNotInProgress",
      "msg": "Game is not in progress"
    },
    {
      "code": 6007,
      "name": "invalidWinner",
      "msg": "Invalid winner"
    },
    {
      "code": 6008,
      "name": "unauthorizedPlayer",
      "msg": "Unauthorized player"
    },
    {
      "code": 6009,
      "name": "cannotStopInProgressGame",
      "msg": "Cannot stop game that is in progress"
    },
    {
      "code": 6010,
      "name": "gameAlreadyFinished",
      "msg": "Game is already finished"
    }
  ],
  "types": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "string"
          },
          {
            "name": "player1",
            "type": "pubkey"
          },
          {
            "name": "player2",
            "type": "pubkey"
          },
          {
            "name": "arbiter",
            "type": "pubkey"
          },
          {
            "name": "betAmount",
            "type": "u64"
          },
          {
            "name": "totalPot",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "gameStatus"
              }
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "waitingForPlayer2"
          },
          {
            "name": "inProgress"
          },
          {
            "name": "finished"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    }
  ]
};
