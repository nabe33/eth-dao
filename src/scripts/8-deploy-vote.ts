import sdk from "./1-initialize-sdk.js";

(async () => {
  try {
    const voteContractAddress = await sdk.deployer.deployVote({
      // ガバナンス用コントラクトの名前
      name: "nabe's amazing DAO",

      // ERC-20コントラクト（ミントするガバナンストークン）
      voting_token_address: "0xc135521c659892eEfd0B75b32aB6FEFC2DCa1c88",

      // 提案作成後にメンバーがすぐに投票できるよう0ブロックに設定
      voting_delay_in_blocks: 0,

      // 提案作成後にメンバーが投票できる期間を1日（6570block x 13－14秒のブロックタイム）
      voting_period_in_blocks: 6570,

      // 提案の投票期間が終了後，提案が有効となるために投票する必要があるトークンの総供給量の最小値を0%に設定
      voting_quorum_fraction: 0,

      // ユーザが提案するために必要なトークンの最小値を0に設定．ガバナンストークンを持っていなくても投票できる．
      proposal_token_threshold: 0,
    });

    console.log(
      "✅ Successfully deployed vote contract, address:",
      voteContractAddress,
    );
  } catch(error) {
    console.error("Failed to deploy vote contract", error);
  }
})();

