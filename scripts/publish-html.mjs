import { execFileSync } from "node:child_process";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
// Publish the committed site tree with Git's built-in plumbing; no worktree or force push.
execFileSync("git", ["diff", "--exit-code", "HEAD", "--", "site"], {
  stdio: "inherit",
});
if (git("ls-files", "--others", "--exclude-standard", "--", "site"))
  throw new Error("Commit the HTML export before publishing.");
const tree = git("rev-parse", "HEAD:site");
const remote = git("ls-remote", "--heads", "origin", "gh-pages");
const args = [
  "commit-tree",
  tree,
  "-m",
  "Publish Hop Viec static HTML preview",
];
if (remote) {
  const parent = remote.split(/\s+/)[0];
  execFileSync("git", ["fetch", "origin", "gh-pages"], { stdio: "inherit" });
  if (git("cat-file", "-t", parent) !== "commit")
    throw new Error("Cannot verify current gh-pages commit.");
  args.push("-p", parent);
}
const commit = git(...args);
execFileSync("git", ["push", "origin", `${commit}:refs/heads/gh-pages`], {
  stdio: "inherit",
});
execFileSync("git", ["update-ref", "refs/heads/gh-pages", commit], {
  stdio: "inherit",
});
console.log(
  `Published committed static HTML to gh-pages (${commit.slice(0, 7)}). Enable GitHub Pages from this branch's root if needed.`,
);
