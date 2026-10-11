import { spawnSync } from "node:child_process";

// `npm run preview` is a local-only tool for eyeballing the static export (and
// exercising the service worker lifecycle), not a real deployment — it doesn't
// need a real public domain, so default NEXT_PUBLIC_SITE_URL unless the caller
// already set one. Setting it here (rather than inline in package.json's script
// string) keeps this cross-platform: `VAR=value command` isn't valid on Windows'
// cmd.exe, which is what npm scripts run under by default there.
process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:4000";

// shell: true delegates to cmd.exe/sh to resolve "npm"/"npx" from PATH — spawning
// "npm.cmd" directly throws EINVAL in some Windows shell environments (e.g. Git
// Bash), so this is the more portable option, not just a Windows-only concern.
const spawnOpts = { stdio: "inherit", env: process.env, shell: true };

const build = spawnSync("npm", ["run", "build"], spawnOpts);
if (build.status !== 0) process.exit(build.status ?? 1);

const serve = spawnSync("npx", ["serve", "out", "-l", "4000"], spawnOpts);
process.exit(serve.status ?? 0);
