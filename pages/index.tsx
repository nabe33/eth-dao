import { useState, useEffect, useMemo } from "react";
import type { NextPage } from "next";
import { ConnectWallet, ChainId, useNetwork, useAddress, useContract } from "@thirdweb-dev/react";
import { Proposal } from "@thirdweb-dev/sdk";
import { AddressZero } from "@ethersproject/constants";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const address = useAddress();
  console.log("ðWallet Address: ", address);

  const [network, switchNetwork] = useNetwork();

  // EditionDropã®ERC-1155ã³ã³ãã©ã¯ããåæå
  const editionDrop = useContract("0x2039a99D258F11Cf045b2607E40f09427510A243", "edition-drop").contract;

  // ERC-20ã³ã³ãã©ã¯ãï¼ãã³ãããã¬ããã³ã¹ãã¼ã¯ã³ï¼ãåæå
  const token = useContract("0xc135521c659892eEfd0B75b32aB6FEFC2DCa1c88", "token").contract;

  // æç¥¨ã³ã³ãã©ã¯ãã®åæå
  // ã¬ããã³ã¹ã³ã³ãã©ã¯ãã®ã¢ãã¬ã¹
  const vote = useContract("0x97841708fbE0AfA402751E3AD888d9625Bd4916C", "vote").contract;

  // ã¦ã¼ã¶ãã¡ã³ãã¼ã·ããNFTãæã£ã¦ããããç¥ãããã®stateãå®ç¾©
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // NFTããã³ããã¦ããéãè¡¨ãstateãå®ç¾©
  const [isClaiming, setIsClaiming] = useState(false);

  // *******************************************************
  // ã¡ã³ãã¼ãã¨ã®ä¿æãã¼ã¯ã³æ°ãstateã¨ãã¦å®£è¨
  const [memberTokenAmounts, setMemberTokenAmounts] = useState<any>([]);

  // DAOã¡ã³ãã¼ã®ã¢ãã¬ã¹ãstateã§å®£è¨
  const [memberAddresses, setMemberAddresses] = useState<string[] | undefined>([]);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // ã¢ãã¬ã¹ã®é·ããçç¥ãã¦ãããä¾¿å©ãªé¢æ°ãå®ç¾©
  const shortenAddress = (str: string) => {
    return str.substring(0,6) + "..." + str.substring(str.length - 4);
  };

  // ã³ã³ãã©ã¯ãããæ¢å­ã®ææ¡ããã¹ã¦åå¾
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // vote!.getAll()ãä½¿ç¨ãã¦ææ¡ãåå¾
    const getAllProposals = async () => {
      try {
        const proposals = await vote!.getAll();
        setProposals(proposals);
        console.log("ð Proposals:", proposals);
      } catch (error) {
        console.error("failed to get proposals", error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  // ã¦ã¼ã¶ãæ¢ã«æç¥¨ãããã©ããç¢ºèª
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // ææ¡ãåå¾ãçµããªãéãï¼ã¦ã¼ã¶ãæç¥¨ãããã©ããç¢ºèªã§ããªã
    if (!proposals.length) {
      return;
    }

    const checkIfUsersHasVoted = async () => {
      try {
        const hasVoted = await vote!.hasVoted(proposals[0].proposalId.toString(), address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("ð¥µ User has already voted");
        } else {
          console.log("ð User has not voted yet");
        }
      } catch (error) {
        console.error("failed to check if wallet has voted", error);
      }
    };
    checkIfUsersHasVoted();
  }, [hasClaimedNFT, proposals, address, vote]);

  // ã¡ã³ãã¼ã·ãããä¿æãã¦ããã¡ã³ãã¼ã®å¨ã¢ãã¬ã¹ãåå¾
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // ã¨ã¢ãã­ããããã¦ã¼ã¶ãåå¾ï¼çºè¡ãããNFTã®tokenIDã0ã®ã¡ã³ãã¼ã·ããNFTï¼
    const getAllAddresses = async() => {
      try {
        const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(
          0
        );
        setMemberAddresses(memberAddresses);
        console.log("ð Members addresses", memberAddresses);
      } catch(error) {
        console.error("failed to get member list", error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop?.history]);

  // åã¡ã³ãã¼ãä¿æãããã¼ã¯ã³æ°ãåå¾
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token?.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("ð Amounts", amounts);
      } catch(error) {
        console.error("failed to get member balances", error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token?.history]);

  // memberAddresses ã¨ menberTokenAmounts ã1ã¤ã®éåã«çµå
  const memberList = useMemo(() => {
    return memberAddresses?.map((address) => {
      // memberTokenAmountséåã§ã¢ãã¬ã¹ãè¦ã¤ãã£ã¦ãããç¢ºèªï¼
      // è¦ã¤ããã°ã¦ã¼ã¶ãæã£ã¦ãããã¼ã¯ã³éãè¿ãï¼ããä»¥å¤ã¯0ãè¿ãï¼
      const member = memberTokenAmounts?.find(({holder}: {holder: string}) => holder === address);

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  // **************************************************************

  useEffect(() => {
    // ã¦ã©ã¬ããã«æ¥ç¶ããã¦ããªãã£ããå¦çãããªã
    if (!address) {
      return;
    }
    // ã¦ã¼ã¶ãã¡ã³ãã¼ã·ããNFTãæã£ã¦ãããç¢ºèªããé¢æ°
    const checkBalance = async () => {
      try {
        const balance = await editionDrop!.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("ð this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("ð­ this user doesn't have a membership NFT.");
        }
      } catch(error) {
        setHasClaimedNFT(false);
        console.error("Failed to get balance", error);
      }
    };

    // é¢æ°ãå®è¡
    checkBalance();
  }, [address, editionDrop]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop!.claim("0", 1);
      console.log(
        `ð Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop!.getAddress()}/0`
      );
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };


  // ã¦ã©ã¬ããã¨æ¥ç¶ãã¦ããªãã£ããæ¥ç¶ãä¿ã
  if (!address) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Welcome to nabeDAO !!</h1>
          <div className={styles.connect}>
            <ConnectWallet />
          </div>
        </main>
      </div>
    );
  }
  // ãã¹ãããããGoerliã§ãªãã£ããè­¦åãè¡¨ç¤º
  else if ( address && network && network?.data?.chain?.id !== ChainId.Goerli ) {
    console.log("wallet address: ", address);
    console.log("network: ", network?.data?.chain?.id);

    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Goerliã«åãæ¿ãã¦ãã ããï¼</h1>
          <p>ãã®dAppã¯Goerliãã¹ããããã®ã¿ã§åä½ãã¾ãï¼</p>
          <p>æ¥ç¶ä¸­ã®ãããã¯ã¼ã¯ãã¦ã©ã¬ããã§åãæ¿ãã¦ãã ããï¼</p>
        </main>
      </div>
    );
  } 
  // DAOããã·ã¥ãã¼ãç»é¢ãè¡¨ç¤º
  else if (hasClaimedNFT) {
    return (
      <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>ðªDAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>â  Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList!.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2>â  Active Proposals</h2>
            <form 
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              // ããã«ã¯ãªãã¯ãé²ãããã«ãã¿ã³ãç¡å¹å
              setIsVoting(true);

              // ãã©ã¼ã ããå¤ãåå¾
              const votes = proposals.map((proposal) => {
                const voteResult = {
                  proposalId: proposal.proposalId,
                  vote: 2,
                };
                proposal.votes.forEach((vote) => {
                  const elem = document.getElementById(
                    proposal.proposalId + "-" + vote.type
                  ) as HTMLInputElement;

                  if (elem!.checked) {
                    voteResult.vote = vote.type;
                    return;
                  }
                });
                return voteResult;
              });

              // ã¦ã¼ã¶ãèªåã®ãã¼ã¯ã³ãæç¥¨ã«å§ã­ããã¨ãç¢ºèªããå¿è¦ããã
              try {
                // æç¥¨åã«ã¦ã©ã¬ããããã¼ã¯ã³ãå§è­²ããå¿è¦ããããç¢ºèª
                const delegation = await token!.getDelegationOf(address);
                // ãã¼ã¯ã³ãå§è­²ãã¦ããªãå ´åã¯æç¥¨åã«å§è­²
                if (delegation === AddressZero) {
                  await token!.delegateTo(address);
                }
                // ææ¡ã«å¯¾ããæç¥¨ãå®æ½
                try {
                  await Promise.all(
                    votes.map(async ({ proposalId, vote: _vote}) => {
                      // ææ¡ã«æç¥¨å¯è½ãã©ããç¢ºèª 
                      const proposal = await vote!.get(proposalId);
                      // ææ¡ãæç¥¨ãåãä»ãã¦ãããã©ããç¢ºèª
                      if (proposal.state === 1) {
                        return vote!.vote(proposalId.toString(), _vote);
                      }
                      return;
                    })
                  );
                  try { 
                    // ææ¡ãå®è¡å¯è½ã§ããã°å®è¡
                    await Promise.all(
                      votes.map(async ({ proposalId }) => {
                        const proposal = await vote!.get(proposalId);

                        // stateã4ã®å ´åã¯å®è¡å¯è½ã¨å¤æ­ 
                        if (proposal.state === 4) {
                          return vote!.execute(proposalId.toString());
                        }
                      })
                    );
                    // æç¥¨æåã¨å¤å®
                    setHasVoted(true);
                    console.log("Sucussfully voted");
                  } catch(error) {
                    console.error("failed to execute vote", error);
                  }
                } catch (error) {
                  console.error("failed to vote", error);
                }
              } catch (error) {
                console.error("failed to delegate tokens", error);
              } finally {
                setIsVoting(false);
              }
            }}
            >
              {proposals.map((proposal) => (
                <div key={proposal.proposalId.toString()} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map(({ type, label }) => (
                      <div key={type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + type}
                          name={proposal.proposalId.toString()}
                          value={type}
                          // ããã©ã«ãã§æ£æ¨©ç¥¨ããã§ãã¯
                          defaultChecked={type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + type}>
                          {label}
                        </label>
                      </div>  
                    ))}
                  </div>
                </div>
              ))}
              <p></p>
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Has Already Voted"
                    : "Submit Votes"}
              </button>
              <p></p>
              {!hasVoted && (
                <small>
                  This will trigger mutiple transactions that you will need to sign.
                </small>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
    );
  }
  // ã¦ã©ã¬ããã¨æ¥ç¶ããã¦ãããMintãã¿ã³ãè¡¨ç¤º
  else {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Mint your free ðªDAO Membership NFT</h1>
          <button disabled={isClaiming} onClick={mintNft}>
            {isClaiming ? "Minting..." : "Mint your NFT (free)"}
          </button>
        </main>
      </div>
    );
  }
};

export default Home;