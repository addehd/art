#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Release: bump expo.version, production iOS EAS build, then submit to App Store Connect.
// Path is cwd-sensitive (run from repo root, e.g. via package.json "deploy" script).
const appJsonPath = './app.json';
const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
const current = appJson.expo.version;
const [major, minor, patch] = current.split('.').map(Number);
// Patch only; change major/minor in app.json before deploy, or edit this script.
const next = `${major}.${minor}.${patch + 1}`;

appJson.expo.version = next;
writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
console.log(`\n🚀 Version bumped: ${current} → ${next}\n`);

// Cloud build: profile matches eas.json "build.production" + EAS project.
execSync('eas build --platform ios --profile production', { stdio: 'inherit' });

// --latest: the build we just created; stdio: inherit for interactive auth / progress.
execSync('eas submit --platform ios --latest --profile production', { stdio: 'inherit' });
