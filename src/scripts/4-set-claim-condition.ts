import sdk from "./1-initialize-sdk.js";
import { MaxUint256 } from "@ethersproject/constants";

// editionDropのERC-1155コントラクト
const editionDrop = sdk.getContract("0x2039a99D258F11Cf045b2607E40f09427510A243", "edition-drop");

(async () => {
  try {
    // NFTの請求条件を設定
    const claimConditions = [
      {
        // NFTをミントできるようになる時間時間
        startTime: new Date(),
        // 最大供給量
        maxQuantity: 50_000,
        // 価格
        price: 0,
        // 1回のトランザクションでミントできるNFTの数
        quantityLimitPerTransaction: 1,
        // トランザクション間の待ち時間（MaxUint256に設定し1人1回に設定）
        waitInSeconds: MaxUint256,
      },
    ];
    // オンチェーン上のコントラクトとやりとりして条件を調整
    await (await editionDrop).claimConditions.set("0", claimConditions);
    console.log("✅ Succefully set claim condition!");
  } catch (error) {
    console.error("failed to set claim consition", error);
  }
})();