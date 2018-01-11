# counted

The missing analytics feature for GitHub Releases.

## Why?

The GitHub Releases API provides only a point-in-time snapshot
of the `download_count` property for each asset.

## What?

This repository contains a script to fetch the `download_count` value
for all release assets in a given repository and store that data
in a number of per-release JSON files in that same repository.

By default it will store these files in its own `counted` directory on a `counted` branch.

```sh
$ cd myrepo
$ git pull
$ git checkout counted
$ ls -1 counted
release-1234567.json
release-1234568.json
release-1234569.json
...
$ cat release-1234567.json
{
  "7654321": {
    "2018-01-01T00:00:24Z": 7,
    "2018-01-02T00:00:41Z": 12,
    "2018-01-03T00:00:44Z": 23,
...
```

In this example `1234567` is the release `id` and `7654321` is the asset `id`.

This script can be run at *any* desired frequency, typically daily.
The more often it is run, the more accurate data interpolation can be.

## How?

First you'll need to create a `counted` branch on your repository.

![Create a branch on GitHub](https://raw.githubusercontent.com/lovell/counted/master/image/github-branch.png)

Then Heroku Scheduler can be used to run this script for free.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/lovell/counted)

1. Click the `Deploy to Heroku` button above.
2. Enter a unique-to-Heroku `App name`.
3. Choose a region, one of US or Europe.
4. Fill in the `Config Variables` with the values for your GitHub repository.
    * `GITHUB_OWNER`: GitHub username that owns the repository, e.g. `lovell`.
    * `GITHUB_REPO`: Name of the repository, e.g. `counted`.
    * `GITHUB_AUTH_TOKEN`: GitHub [Personal Access Token](https://github.com/settings/tokens/new) granted `public_repo` scope access.
    * `REPO_BRANCH`: Git branch to use for commits, default value is `counted`.
    * `REPO_DIRECTORY`: Directory to use to store data, default value is `counted`.
    * `COMMITTER_NAME`: Git `user.name` for this task to commit as, default value is `counted`.
    * `COMMITTER_EMAIL`: Git `user.email` for this task to commit as, default value is `counted@users.noreply.github.com`.
5. Click `Deploy app` and wait for the `Your app was successfully deployed` message.
6. Click `Manage App`.
7. Click `Heroku Scheduler` under `Add-ons`.
8. Click `Add new job` and enter the following details: ![Heroku Scheduler](https://raw.githubusercontent.com/lovell/counted/master/image/heroku-scheduler.png)
    * $: `npm start`
    * Frequency: Daily
    * Next due: 00:00
9. Click `Save`.

## TODO

* Interpolation of timestamped `download_count` values
* Pretty reports

## Licence

Copyright 2018 Lovell Fuller.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
