import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

// ガバナンスコントラクトのアドレス
const vote = sdk.getContract("0x97841708fbE0AfA402751E3AD888d9625Bd4916C", "vote");

// ERC-20コントラクト（ミントするガバナンストークン）
const token = sdk.getContract("0xc135521c659892eEfd0B75b32aB6FEFC2DCa1c88", "token");

(async () => {
  try {
    // トレジャリーに420,000のトークンを新しく鋳造する提案を作成
    const amount = 420_000;
    const description = "Should the DAO mint an additional " + amount + " tokens into the treasury?";
    const executions = [
      {
        // mintを実行するトークンのコントラクトアドレスを設定
        toAddress: (await token).getAddress(),
        // DAOのネイティブトークンがETHなので，プロポーザル作成時に送信したいETHの量を設定
        nativeTokenValue: 0,
        // ガバナンスコントラクトのアドレスにmintするために金額を正しい形式（wei）に変換
        transactionData: (await token).encoder.encode(
          "mintTo", [
            (await vote).getAddress(),
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
      }
    ];

    await (await vote).propose(description, executions);

    console.log("✅ Successfully created proposal to mint tokens")
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    // 6,900トークンを自分たちに譲渡する提案を作成
    const amount = 6_900;
    const description = "Should the DAO transfer " + amount + " tokens from the treasury to " + process.env.WALLET_ADDRESS + " for being awesome?";
    const executions = [
      {
        nativeTokenValue: 0,
        transactionData: (await token).encoder.encode(
          // トレジャリーからウォレットに送金
          "transfer",
          [
            process.env.WALLET_ADDRESS!,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: (await token).getAddress(),
      },
    ];

    await (await vote).propose(description, executions);

    console.log("✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!")
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
})();