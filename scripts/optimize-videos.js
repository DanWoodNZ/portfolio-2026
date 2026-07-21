#!/usr/bin/env node
/**
 * optimize-videos.js
 * 
 * Optimizes .mp4 video files for web playback by moving the moov atom to the front
 * (-movflags faststart). This allows videos to start playing instantly on mobile
 * and desktop devices before the entire file finishes downloading.
 * 
 * Usage:
 *   node scripts/optimize-videos.js [directory-path] [--in-place]
 * 
 * Examples:
 *   node scripts/optimize-videos.js ./public/assets/videos
 *   node scripts/optimize-videos.js ./my-raw-videos --in-place
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Check if ffmpeg is installed
try {
  execSync("ffmpeg -version", { stdio: "ignore" });
} catch (error) {
  console.error("❌ Error: 'ffmpeg' is not installed or not found in PATH.");
  console.error("Please install ffmpeg (e.g., 'brew install ffmpeg' on macOS or via your package manager) and try again.");
  process.exit(1);
}

const args = process.argv.slice(2);
const inPlace = args.includes("--in-place");
const targetDirArg = args.find((arg) => !arg.startsWith("--")) || "./public/assets";
const targetDir = path.resolve(process.cwd(), targetDirArg);

if (!fs.existsSync(targetDir)) {
  console.error(`❌ Error: Target directory does not exist: ${targetDir}`);
  process.exit(1);
}

console.log(`🎬 Scanning for .mp4 files in: ${targetDir}`);
console.log(`Mode: ${inPlace ? "In-place optimization (overwriting originals)" : "Creating optimized copies (*.optimized.mp4)"}\n`);

/**
 * Recursively find all .mp4 files in a directory
 */
function findMp4Files(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findMp4Files(fullPath, fileList);
    } else if (
      stat.isFile() &&
      path.extname(file).toLowerCase() === ".mp4" &&
      !file.endsWith(".optimized.mp4") &&
      !file.endsWith(".tmp.mp4")
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const mp4Files = findMp4Files(targetDir);

if (mp4Files.length === 0) {
  console.log("ℹ️ No .mp4 files found to optimize.");
  process.exit(0);
}

console.log(`Found ${mp4Files.length} .mp4 file(s) to optimize.\n`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < mp4Files.length; i++) {
  const inputFile = mp4Files[i];
  const relativePath = path.relative(process.cwd(), inputFile);
  const ext = path.extname(inputFile);
  const baseName = path.basename(inputFile, ext);
  const dirName = path.dirname(inputFile);

  const tempOutputFile = path.join(dirName, `${baseName}.tmp.mp4`);
  const finalOutputFile = inPlace
    ? inputFile
    : path.join(dirName, `${baseName}.optimized.mp4`);

  console.log(`[${i + 1}/${mp4Files.length}] Optimizing: ${relativePath}...`);

  try {
    // -codec copy preserves original video/audio tracks while moving the moov header to the start
    const cmd = `ffmpeg -y -i "${inputFile}" -codec copy -movflags faststart "${tempOutputFile}"`;
    execSync(cmd, { stdio: "pipe" });

    if (inPlace) {
      fs.renameSync(tempOutputFile, inputFile);
      console.log(`   ✅ Optimized in-place: ${relativePath}`);
    } else {
      fs.renameSync(tempOutputFile, finalOutputFile);
      console.log(`   ✅ Optimized copy created: ${path.relative(process.cwd(), finalOutputFile)}`);
    }
    successCount++;
  } catch (err) {
    console.error(`   ❌ Failed to optimize ${relativePath}`);
    if (fs.existsSync(tempOutputFile)) {
      fs.unlinkSync(tempOutputFile);
    }
    failCount++;
  }
}

console.log("\n==========================================");
console.log(`Optimization Complete: ${successCount} succeeded, ${failCount} failed.`);
console.log("==========================================");
