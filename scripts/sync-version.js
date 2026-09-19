#!/usr/bin/env node

/**
 * Version Synchronization Script
 *
 * Ensures version consistency across:
 * - src-tauri/tauri.conf.json (source of truth)
 * - package.json
 * - src-tauri/Cargo.toml
 *
 * Usage:
 *   bun scripts/sync-version.js
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

function readJsonFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    process.exit(1);
  }
}

function writeJsonFile(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2) + "\n";
    writeFileSync(filePath, content, "utf-8");
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    process.exit(1);
  }
}

function updateCargoToml(filePath, version) {
  try {
    let content = readFileSync(filePath, "utf-8");
    const versionRegex = /^(\s*version\s*=\s*")[^"]+(".*)$/m;

    if (versionRegex.test(content)) {
      content = content.replace(versionRegex, `$1${version}$2`);
      writeFileSync(filePath, content, "utf-8");
      console.log(`✓ Updated Cargo.toml version to ${version}`);
    } else {
      console.warn(`⚠ Could not find version line in Cargo.toml`);
    }
  } catch (error) {
    console.error(`Error updating Cargo.toml:`, error.message);
    process.exit(1);
  }
}

function updatePackageJson(filePath, version) {
  try {
    const packageJson = readJsonFile(filePath);

    if (packageJson.version !== version) {
      packageJson.version = version;
      writeJsonFile(filePath, packageJson);
      console.log(`✓ Updated package.json version to ${version}`);
    } else {
      console.log(`✓ package.json already has version ${version}`);
    }
  } catch (error) {
    console.error(`Error updating package.json:`, error.message);
    process.exit(1);
  }
}

function syncVersion() {
  console.log("🔄 Syncing version across configuration files...\n");

  const tauriConfPath = join(projectRoot, "src-tauri", "tauri.conf.json");
  const tauriConf = readJsonFile(tauriConfPath);
  const version = tauriConf.version;

  if (!version) {
    console.error("❌ No version found in tauri.conf.json");
    process.exit(1);
  }

  console.log(`📦 Source version from tauri.conf.json: ${version}\n`);

  const packageJsonPath = join(projectRoot, "package.json");
  updatePackageJson(packageJsonPath, version);

  const cargoTomlPath = join(projectRoot, "src-tauri", "Cargo.toml");
  updateCargoToml(cargoTomlPath, version);

  console.log("\n✅ Version synchronization complete!");
  console.log(`   All files now use version: ${version}\n`);
}

syncVersion();
