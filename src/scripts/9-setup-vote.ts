import sdk from "./1-initialize-sdk.js";

// ガバナンスコントラクトのアドレス
const vote = sdk.getContract("0x97841708fbE0AfA402751E3AD888d9625Bd4916C", "vote");

// ERC-20コントラクト（ミントするガバナンストークン）
const token = sdk.getContract("0xc135521c659892eEfd0B75b32aB6FEFC2DCa1c88", "token");

(async () => {
  try {
    // 必要に応じて追加のトークンを作成する機能をトレジャリー（金庫）に付与
    await (await token).roles.grant("minter", (await vote).getAddress());
    console.log("Succefully gave vote contract permission to act on token contract");
  } catch  (error) {
    console.error("failed to grant vote contract permission on token contract", error);
    process.exit(1);
  }

  try {
    // ウォレットのトークン残高を取得
    const owendTokenBalance = await (await token).balanceOf(
      process.env.WALLET_ADDRESS!
    );

    // 保有する供給量の90％を取得
    const ownedAmount = owendTokenBalance.displayValue;
    const percent90 = Number(ownedAmount) / 100 * 90;

    // 供給量の90％をガバナンスコントラクトに移動
    await (await token).transfer(
      (await vote).getAddress(),
      percent90
    );

    console.log("✅ Successfully transferred " + percent90 + " tokens to vote contract");
  } catch (error) {
    console.error("failed totransfer tokens to vote contract", error);
  }
})();
