import sdk from "./1-initialize-sdk.js";

// EditionDropのERC-1155コントラクト(メンバーシップのNFT)
const editionDrop = sdk.getContract("0x2039a99D258F11Cf045b2607E40f09427510A243", "edition-drop");

// ERC-20コントラクト（ミントするガバナンストークン）
const token = sdk.getContract("0xc135521c659892eEfd0B75b32aB6FEFC2DCa1c88", "token");

(async () => {
  try {
    // メンバーシップNFTを所有している人のアドレスをすべて取得
    // tokenIdが0のメンバーシップNFT
    const walletAddresses = await (await editionDrop).history.getAllClaimerAddresses(0);

    if(walletAddresses.length === 0) {
      console.log("No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!");
      process.exit(0);
    }

    // アドレスの配列をループ
    const airdropTargets = walletAddresses.map((address) => {
      // 1000～10000のランダムな数
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

      // ターゲットを設定
      const airdropTarget = {
        toAddress: address,
        amount: randomAmount,
      };

      return airdropTarget;
    });

    // 全エアドロップ先でtransferBatchを呼び出す
    console.log("🌈 Starting airdrop...");
    await (await token).transferBatch(airdropTargets);
    console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
  } catch (error) {
    console.error("Failed to airdrop tokens", error);
  }
})();