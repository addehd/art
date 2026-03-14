#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Bump patch version in app.json
const appJsonPath = './app.json';
const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
const current = appJson.expo.version;
const [major, minor, patch] = current.split('.').map(Number);
const next = `${major}.${minor}.${patch + 1}`;

appJson.expo.version = next;
writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
console.log(`\n🚀 Version bumped: ${current} → ${next}\n`);

// Build
execSync('eas build --platform ios --profile production', { stdio: 'inherit' });

// Submit
execSync('eas submit --platform ios --latest --profile production', { stdio: 'inherit' });
