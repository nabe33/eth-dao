import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

// editionDropのERC-1155コントラクト
const editionDrop = sdk.getContract("0x2039a99D258F11Cf045b2607E40f09427510A243", "edition-drop");

(async () => {
  try {
    await (await editionDrop).createBatch([     // NFT作成
      {
        name: "Limited Member's Card",
        description: "nabeDAOにアクセスできる限定アイテムです",
        image: readFileSync("src/scripts/assets/NFT.jpg"),
      },
    ]);
    console.log("✅ Successfully create a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();