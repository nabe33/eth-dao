import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

(async () => {
  try {
    const editionDropAddress = await sdk.deployer.deployEditionDrop({
      // コレクションの名前
      name: "nabeDao",
      // コレクションの説明
      description: "A DAO specially made for nabe3 community",
      // コレクションのアイコン画像
      image: readFileSync("src/scripts/assets/nabe.png"),
      // NFTの販売による収益を受け取るアドレス．ドロップに課金したい場合は自分のウォレットアドレス．
      // 今回は課金設定はないので，0x0に設定．
      primary_sale_recipient: AddressZero,
    });

    // 初期化して返ってきた editionDropコントラクトのアドレスからeditionDropを取得
    const editionDrop = sdk.getContract(editionDropAddress, "edition-drop");

    // メタデータを取得
    const metadata = await (await editionDrop).metadata.get();

    // editionDropコントラクトのアドレスを出力
    console.log(
      "✅ Successfully deployed editionDrop contract, address: ",
      editionDropAddress
    );

    // editionDropコントラクトのメタデータを出力
    console.log("✅ editionDrop metadata: ", metadata);
  } catch (error) {
    console.log("failed to deploy editionDrop contract", error);
  }
})();