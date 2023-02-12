import sdk from "./1-initialize-sdk.js";

// ERC-20コントラクト（ミントするガバナンストークン）
const token = sdk.getContract("0xc135521c659892eEfd0B75b32aB6FEFC2DCa1c88", "token");

(async () => {
  try {
    // 現在のロールを記録
    const allRoles = await (await token).roles.getAll();

    console.log("👀 Roles that exist right now:", allRoles);

    // ERC20のコントラクトに対してあなたのウォレットが持っている権限をすべて削除
    await (await token).roles.setAll({ admin: [], minter: [] });
    console.log(
      "🎉 Roles after revoking ourselves",
      await (await token).roles.getAll()
    );
    console.log("✅ Successfully revoked our superpowers from the ERC-20 contract");
  } catch(error) {
    console.error("failed to revoke ourselves from the DAO treasury", error);
  }
})();