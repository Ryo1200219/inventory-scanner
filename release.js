const fs = require('fs');
const { execSync } = require('child_process');

// 実行時の引数を取得 (例: npm run release -- minor)
const type = process.argv[2] || 'patch';

const versionFile = './version.js';
const content = fs.readFileSync(versionFile, 'utf8');
const versionMatch = content.match(/APP_VERSION = "v(\d+)\.(\d+)\.(\d+)"/);

if (!versionMatch) {
    console.error("バージョンが見つかりませんでした。");
    process.exit(1);
}

let [full, major, minor, patch] = versionMatch.map((v, i) => i > 0 ? parseInt(v) : v);

// どの数字を上げるか判定
if (type === 'major') {
    major++;
    minor = 0;
    patch = 0;
} else if (type === 'minor') {
    minor++;
    patch = 0;
} else {
    patch++; // デフォルトはパッチ
}

const nextVersion = `v${major}.${minor}.${patch}`;
const nextContent = content.replace(full, `APP_VERSION = "${nextVersion}"`);

fs.writeFileSync(versionFile, nextContent);
console.log(`Bumping ${type}...`);
console.log(`Version updated: ${full.split('"')[1]} -> ${nextVersion}`);

// Git操作 (変更なし)
try {
    execSync(`git add ${versionFile}`);
    execSync(`git commit -m "chore: bump version to ${nextVersion}"`);
    execSync(`git tag ${nextVersion}`);
    execSync(`git push origin main`);
    execSync(`git push origin ${nextVersion}`);
    console.log(`Successfully pushed ${nextVersion} to GitHub!`);
} catch (error) {
    console.error("Git操作エラー:", error.message);
}
