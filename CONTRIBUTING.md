# Contributing
### Getting started locally
- Fork the project
- Clone your fork locally
```bash
git clone https://github.com/<your-username>/blog-post-workflow
cd blog-post-workflow
```
- Create a new branch
```bash
git checkout -b new-feature
```
- Install the dependencies
```bash
yarn
```
- To test the workflow locally run
```bash
yarn local-run
```
- Do required changes and make sure that the tests are passing by running:
```bash
yarn test
```

Please run `export TEST_MODE=true` before running the [blog-post-workflow.js](src/blog-post-workflow.js) directly, to prevent accidental 
automated committing and pushing to your fork.

Please note we have a [code of conduct](CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

## Pull Request Requirements

1. Update the README.md with details of changes to the API if you made those changes. Add an example as well
2. Add proper comments to the code you have added. You should use the `yarn lint` to check linting of the code, 
make sure that you dont add/remove any linting rules. Discuss with the maintainer if you require any of such changes.
3. Do not run `yarn build`, It will be done by the maintainer's bot when he release a new version. Revert the changes if you had
accidentally done it.
4. Add descriptive title and description to the PRs
