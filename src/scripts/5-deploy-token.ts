import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";

(async () => {
  try {
    // 標準的なERC-20のコントラクトをデプロイ
    const tokenAddress = await sdk.deployer.deployToken({
      // トークン名
      name: "nabeDAO Governance Token",
      // トークンのシンボル
      symbol: "NAB",
      // トークンを売却する場合の受取り先．今回は設定しない
      primary_sale_recipient: AddressZero,
    });
    console.log("✅ Successfully deployed token module, address:", tokenAddress);
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();