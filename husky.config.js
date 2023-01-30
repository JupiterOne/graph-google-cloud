const huskyConfig = require('@jupiterone/integration-sdk-dev-tools/config/husky');

module.exports = {
  hooks: {
    ...huskyConfig.hooks,
    'pre-commit': `yarn document:permissions && git add docs/jupiterone.md && ${huskyConfig.hooks['pre-commit']}`,
  },
};
