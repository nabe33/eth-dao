import { useState, useEffect, useMemo } from "react";
import type { NextPage } from "next";
import { ConnectWallet, ChainId, useNetwork, useAddress, useContract } from "@thirdweb-dev/react";
import { Proposal } from "@thirdweb-dev/sdk";
import { AddressZero } from "@ethersproject/constants";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const address = useAddress();
  console.log("👋Wallet Address: ", address);

  const [network, switchNetwork] = useNetwork();

  // EditionDropのERC-1155コントラクトを初期化
  const editionDrop = useContract("0x2039a99D258F11Cf045b2607E40f09427510A243", "edition-drop").contract;

  // ERC-20コントラクト（ミントするガバナンストークン）を初期化
  const token = useContract("0xc135521c659892eEfd0B75b32aB6FEFC2DCa1c88", "token").contract;

  // 投票コントラクトの初期化
  // ガバナンスコントラクトのアドレス
  const vote = useContract("0x97841708fbE0AfA402751E3AD888d9625Bd4916C", "vote").contract;

  // ユーザがメンバーシップNFTを持っているかを知るためのstateを定義
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // NFTをミントしている間を表すstateを定義
  const [isClaiming, setIsClaiming] = useState(false);

  // *******************************************************
  // メンバーごとの保有トークン数をstateとして宣言
  const [memberTokenAmounts, setMemberTokenAmounts] = useState<any>([]);

  // DAOメンバーのアドレスをstateで宣言
  const [memberAddresses, setMemberAddresses] = useState<string[] | undefined>([]);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // アドレスの長さを省略してくれる便利な関数を定義
  const shortenAddress = (str: string) => {
    return str.substring(0,6) + "..." + str.substring(str.length - 4);
  };

  // コントラクトから既存の提案をすべて取得
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // vote!.getAll()を使用して提案を取得
    const getAllProposals = async () => {
      try {
        const proposals = await vote!.getAll();
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      } catch (error) {
        console.error("failed to get proposals", error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  // ユーザが既に投票したかどうか確認
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // 提案を取得し終えない限り，ユーザが投票したかどうか確認できない
    if (!proposals.length) {
      return;
    }

    const checkIfUsersHasVoted = async () => {
      try {
        const hasVoted = await vote!.hasVoted(proposals[0].proposalId.toString(), address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        } else {
          console.log("🙂 User has not voted yet");
        }
      } catch (error) {
        console.error("failed to check if wallet has voted", error);
      }
    };
    checkIfUsersHasVoted();
  }, [hasClaimedNFT, proposals, address, vote]);

  // メンバーシップを保持しているメンバーの全アドレスを取得
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // エアドロップしたユーザを取得（発行されたNFTのtokenIDが0のメンバーシップNFT）
    const getAllAddresses = async() => {
      try {
        const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(
          0
        );
        setMemberAddresses(memberAddresses);
        console.log("🚀 Members addresses", memberAddresses);
      } catch(error) {
        console.error("failed to get member list", error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop?.history]);

  // 各メンバーが保持するトークン数を取得
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token?.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("👜 Amounts", amounts);
      } catch(error) {
        console.error("failed to get member balances", error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token?.history]);

  // memberAddresses と menberTokenAmounts を1つの配列に結合
  const memberList = useMemo(() => {
    return memberAddresses?.map((address) => {
      // memberTokenAmounts配列でアドレスが見つかっているか確認．
      // 見つかればユーザが持っているトークン量を返す．それ以外は0を返す．
      const member = memberTokenAmounts?.find(({holder}: {holder: string}) => holder === address);

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  // **************************************************************

  useEffect(() => {
    // ウォレットに接続されていなかったら処理をしない
    if (!address) {
      return;
    }
    // ユーザがメンバーシップNFTを持っているか確認する関数
    const checkBalance = async () => {
      try {
        const balance = await editionDrop!.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch(error) {
        setHasClaimedNFT(false);
        console.error("Failed to get balance", error);
      }
    };

    // 関数を実行
    checkBalance();
  }, [address, editionDrop]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop!.claim("0", 1);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop!.getAddress()}/0`
      );
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };


  // ウォレットと接続していなかったら接続を促す
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
  // テストネットがGoerliでなかったら警告を表示
  else if ( address && network && network?.data?.chain?.id !== ChainId.Goerli ) {
    console.log("wallet address: ", address);
    console.log("network: ", network?.data?.chain?.id);

    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Goerliに切り替えてください！</h1>
          <p>このdAppはGoerliテストネットのみで動作します．</p>
          <p>接続中のネットワークをウォレットで切り替えてください．</p>
        </main>
      </div>
    );
  } 
  // DAOダッシュボード画面を表示
  else if (hasClaimedNFT) {
    return (
      <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>🍪DAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>■ Member List</h2>
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
            <h2>■ Active Proposals</h2>
            <form 
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              // ダブルクリックを防ぐためにボタンを無効化
              setIsVoting(true);

              // フォームから値を取得
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

              // ユーザが自分のトークンを投票に委ねることを確認する必要がある
              try {
                // 投票前にウォレットがトークンを委譲する必要があるか確認
                const delegation = await token!.getDelegationOf(address);
                // トークンを委譲していない場合は投票前に委譲
                if (delegation === AddressZero) {
                  await token!.delegateTo(address);
                }
                // 提案に対する投票を実施
                try {
                  await Promise.all(
                    votes.map(async ({ proposalId, vote: _vote}) => {
                      // 提案に投票可能かどうか確認 
                      const proposal = await vote!.get(proposalId);
                      // 提案が投票を受け付けているかどうか確認
                      if (proposal.state === 1) {
                        return vote!.vote(proposalId.toString(), _vote);
                      }
                      return;
                    })
                  );
                  try { 
                    // 提案が実行可能であれば実行
                    await Promise.all(
                      votes.map(async ({ proposalId }) => {
                        const proposal = await vote!.get(proposalId);

                        // stateが4の場合は実行可能と判断 
                        if (proposal.state === 4) {
                          return vote!.execute(proposalId.toString());
                        }
                      })
                    );
                    // 投票成功と判定
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
                          // デフォルトで棄権票をチェック
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
  // ウォレットと接続されていたらMintボタンを表示
  else {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Mint your free 🍪DAO Membership NFT</h1>
          <button disabled={isClaiming} onClick={mintNft}>
            {isClaiming ? "Minting..." : "Mint your NFT (free)"}
          </button>
        </main>
      </div>
    );
  }
};

export default Home;