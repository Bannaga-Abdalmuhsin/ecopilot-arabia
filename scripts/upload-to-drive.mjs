/**
 * Upload EcoPilot Arabia source code and assets to Google Drive
 * Uses @replit/connectors-sdk with the connected Google Drive account
 */
import { ReplitConnectors } from "@replit/connectors-sdk";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, dirname } from "path";

const connectors = new ReplitConnectors();

// Proxy size limit — skip files larger than this
const PROXY_MAX_BYTES = 4 * 1024 * 1024; // 4 MB

async function createFolder(name, parentId = null) {
  const meta = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    ...(parentId ? { parents: [parentId] } : {}),
  };
  // Use metadata-only endpoint (no uploadType param) for folder creation
  const res = await connectors.proxy("google-drive", "/drive/v3/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(meta),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`createFolder "${name}" failed ${res.status}: ${t}`);
  }
  const data = await res.json();
  console.log(`  📁 Folder: ${name} → ${data.id}`);
  return data.id;
}

async function uploadSmallFile(localPath, driveName, parentId) {
  const fileBuffer = readFileSync(localPath);
  const ext = driveName.split(".").pop().toLowerCase();
  const mimeMap = {
    ts: "text/plain", tsx: "text/plain", js: "text/plain", jsx: "text/plain",
    mjs: "text/plain", cjs: "text/plain",
    json: "application/json", md: "text/markdown", css: "text/css",
    html: "text/html", toml: "text/plain", yaml: "text/plain", yml: "text/plain",
    env: "text/plain", sql: "text/plain", sh: "text/plain", txt: "text/plain",
    svg: "image/svg+xml", png: "image/png",
    jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
    mp3: "audio/mpeg", gz: "application/gzip",
  };
  const mimeType = mimeMap[ext] || "application/octet-stream";

  const boundary = "gdrive_" + Math.random().toString(36).slice(2);
  const meta = JSON.stringify({ name: driveName, parents: [parentId] });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const res = await connectors.proxy(
    "google-drive",
    "/upload/drive/v3/files?uploadType=multipart&fields=id,name",
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Upload "${driveName}" failed ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.id;
}

const IGNORED_DIRS  = new Set(["node_modules", "dist", ".git", ".pnpm-store", "__pycache__", "tmp", ".replit-artifact", ".cache"]);
const IGNORED_FILES = new Set([".DS_Store", "Thumbs.db"]);
const IGNORED_EXTS  = new Set(["lock", "map"]);
// Never upload secret-bearing files regardless of location
const SENSITIVE_PATTERNS = [/^\.env/, /\.pem$/, /\.key$/, /\.p12$/, /\.pfx$/, /credentials\.json$/i];

function isSensitive(name) {
  return SENSITIVE_PATTERNS.some(p => p.test(name));
}

function collectFiles(dir, baseDir = dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry) || IGNORED_FILES.has(entry)) continue;
    if (isSensitive(entry)) { console.log(`  🔒 Skipping sensitive: ${relative(baseDir, join(dir, entry))}`); continue; }
    const ext = entry.includes(".") ? entry.split(".").pop().toLowerCase() : "";
    if (IGNORED_EXTS.has(ext)) continue;

    const fullPath = join(dir, entry);
    let stat;
    try { stat = statSync(fullPath); } catch { continue; }

    if (stat.isDirectory()) {
      results.push(...collectFiles(fullPath, baseDir));
    } else {
      results.push({ fullPath, relPath: relative(baseDir, fullPath), size: stat.size });
    }
  }
  return results;
}

async function uploadDirectory(localDir, driveParentId) {
  const files = collectFiles(localDir);
  const skipped = files.filter(f => f.size > PROXY_MAX_BYTES);
  const toUpload = files.filter(f => f.size <= PROXY_MAX_BYTES);

  if (skipped.length) {
    console.log(`  ⏩ Skipping ${skipped.length} large files (>${(PROXY_MAX_BYTES/1024/1024).toFixed(0)}MB): ${skipped.map(f=>f.relPath).join(", ")}`);
  }

  const folderCache = {};
  let uploaded = 0, failed = 0;

  for (const { fullPath, relPath, size } of toUpload) {
    const parts = relPath.split("/");
    const fileName = parts.pop();

    // Create parent folder chain
    let currentParent = driveParentId;
    let pathSoFar = "";
    for (const part of parts) {
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;
      if (!folderCache[pathSoFar]) {
        folderCache[pathSoFar] = await createFolder(part, currentParent);
      }
      currentParent = folderCache[pathSoFar];
    }

    try {
      await uploadSmallFile(fullPath, fileName, currentParent);
      uploaded++;
      if (uploaded % 20 === 0) process.stdout.write(`    ✅ ${uploaded}/${toUpload.length} uploaded\n`);
    } catch (err) {
      failed++;
      console.error(`    ❌ ${relPath}: ${err.message.slice(0, 120)}`);
    }
  }
  console.log(`  ✅ ${uploaded} uploaded, ${failed} failed, ${skipped.length} skipped (too large)`);
  return uploaded;
}

async function makePublic(folderId) {
  const res = await connectors.proxy(
    "google-drive",
    `/drive/v3/files/${folderId}/permissions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );
  return res.ok;
}

async function main() {
  console.log("🚀 Uploading EcoPilot Arabia to Google Drive...\n");

  // Root project folder
  const rootId = await createFolder("EcoPilot Arabia — Hackathon Submission");
  const srcId  = await createFolder("Source Code", rootId);
  const assetsId = await createFolder("Assets", rootId);

  console.log(`\nRoot folder ID: ${rootId}`);
  console.log(`Link: https://drive.google.com/drive/folders/${rootId}\n`);

  // ── Artifacts ──────────────────────────────────────────────
  const artifacts = [
    ["energy-advisor (React Frontend)", "/home/runner/workspace/artifacts/energy-advisor"],
    ["api-server (Node.js Backend)",    "/home/runner/workspace/artifacts/api-server"],
    ["ecopilot-video (Demo Video App)", "/home/runner/workspace/artifacts/ecopilot-video"],
  ];

  for (const [label, dir] of artifacts) {
    if (!existsSync(dir)) { console.log(`⏩ Skipping ${label} (not found)`); continue; }
    console.log(`\n📦 ${label}`);
    const folderId = await createFolder(label, srcId);
    await uploadDirectory(dir, folderId);
  }

  // ── Shared lib ─────────────────────────────────────────────
  const libDir = "/home/runner/workspace/lib";
  if (existsSync(libDir)) {
    console.log("\n📦 lib (shared library)");
    const libId = await createFolder("lib", srcId);
    await uploadDirectory(libDir, libId);
  }

  // ── Root workspace config files ─────────────────────────────
  console.log("\n📋 Root config files");
  const rootFiles = [
    "/home/runner/workspace/package.json",
    "/home/runner/workspace/pnpm-workspace.yaml",
    "/home/runner/workspace/replit.md",
  ];
  for (const fp of rootFiles) {
    if (!existsSync(fp)) continue;
    const name = fp.split("/").pop();
    try {
      await uploadSmallFile(fp, name, srcId);
      console.log(`  ✅ ${name}`);
    } catch (e) { console.error(`  ❌ ${name}: ${e.message.slice(0,100)}`); }
  }

  // ── Assets ──────────────────────────────────────────────────
  console.log("\n🎨 Assets");
  const assetFiles = [
    ["/home/runner/workspace/attached_assets/hackathon-submission.md", "hackathon-submission.md"],
    ["/home/runner/workspace/attached_assets/hero-image.jpg",           "hero-image.jpg"],
  ];
  for (const [fp, name] of assetFiles) {
    if (!existsSync(fp)) continue;
    const stat = statSync(fp);
    if (stat.size > PROXY_MAX_BYTES) {
      console.log(`  ⏩ ${name} too large (${(stat.size/1024/1024).toFixed(1)}MB)`);
      continue;
    }
    try {
      await uploadSmallFile(fp, name, assetsId);
      console.log(`  ✅ ${name}`);
    } catch (e) { console.error(`  ❌ ${name}: ${e.message.slice(0,100)}`); }
  }

  // ── Make folder public (anyone with link can view) ──────────
  console.log("\n🔓 Making folder public...");
  const ok = await makePublic(rootId);
  console.log(ok ? "  ✅ Folder is now publicly viewable" : "  ⚠️  Could not set public permission");

  console.log(`\n🎉 Done!`);
  console.log(`📂 Google Drive: https://drive.google.com/drive/folders/${rootId}`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
