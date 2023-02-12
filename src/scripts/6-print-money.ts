import sdk from "./1-initialize-sdk.js";

// ERC-20コントラクト
const token = sdk.getContract("0xc135521c659892eEfd0B75b32aB6FEFC2DCa1c88", "token");

(async () => {
  try {
    // 最大供給量
    const amount = 1000000;
    // デプロイされたERC-20コントラクトを通してトークンをミント
    await (await token).mint(amount);
    const totalSupply = await (await token).totalSupply();

    // 現在のトークン量
    console.log(
      "✅ There now is",
      totalSupply.displayValue,
      "$NAB in circulation"
    );
  } catch(error) {
    console.error("Failed to print money", error);
  }
})();