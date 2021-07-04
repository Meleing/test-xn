exports.default = {
    mode: 'lib',
    publishConfig: {
        gitUrl: 'git@116.62.100.239:jtl3d-platform/xnetclient.git',
        jobName: 'xnetclient',
    },
    scripts: {
        build: 'ts-node --project tsconfig.generator.json generate.ts',
    },
};
