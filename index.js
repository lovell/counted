const merge = require('deepmerge');
const { list } = require('ghreleases');
const { get } = require('jsonist');
const { client } = require('octonode');

const timestamp = new Date().toISOString().substr(0, 19) + 'Z';

const {
  COMMITTER_NAME = 'Release Stats Bot',
  COMMITTER_EMAIL = 'release-stats-bot@users.noreply.github.com',
  GITHUB_AUTH_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  REPO_BRANCH = 'release-stats',
  REPO_DIRECTORY = 'release-stats'
} = process.env;

const error = err => {
  console.error(err.message);
  process.exit(1);
};

const github = client(GITHUB_AUTH_TOKEN);

const repo = () => github.repo(`${GITHUB_OWNER}/${GITHUB_REPO}`);

list({ token: GITHUB_AUTH_TOKEN }, GITHUB_OWNER, GITHUB_REPO, async (err, releases) => {
  if (err) {
    error(err);
  } else {
    for (const release of releases) {
      const latestStats = {};
      release.assets.forEach(asset => {
        latestStats[asset.id] = {
          [timestamp]: Number(asset.download_count)
        };
      });
      const filename = `${REPO_DIRECTORY}/release-${release.id}.json`;
      await new Promise(resolve => {
        repo().contents(filename, REPO_BRANCH, (err, data) => {
          if (err) {
            if (err.statusCode === 404) {
              updateStats(filename, latestStats, undefined, resolve);
            } else {
              error(err);
            }
          } else {
            get(data.download_url, (err, existingStats) => {
              if (!err && existingStats) {
                updateStats(filename, merge(existingStats, latestStats), data.sha, resolve);
              } else {
                error(err);
              }
            });
          }
        });
      });
    }
  }
});

const updateStats = (filename, stats, sha, done) => {
  const message = `Latest release stats at ${timestamp}`;
  const content = JSON.stringify(stats, null, 2);
  const options = {
    branch: REPO_BRANCH,
    committer: {
      name: COMMITTER_NAME,
      email: COMMITTER_EMAIL
    },
    sha
  };
  repo().createContents(filename, message, content, options, err => {
    if (err && !err.message.includes('Repo createContents error')) {
      error(err);
    } else {
      done();
    }
  });
};
