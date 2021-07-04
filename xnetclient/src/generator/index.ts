/* eslint-disable */
// const fetch = require('node-fetch');

// import config from '../config/generatorconfig';
import * as Blubird from 'bluebird';

import * as _ from 'lodash';

import { generatorConfig } from '../config/generatorconfig';

import { getServiceTags } from './getservices';
import Axios from 'axios';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
// const _ = require('lodash');

const codegen = require('./codegen');
// const config = require('../config/generatorconfig');

module.exports = class extends Generator {
    public prompting() {
        // Have Yeoman greet the user.
        this.log(yosay(`Welcome to the swagger 2 typescript ${chalk.red('generator-swagger-2-ts')} generator!`));

        const prompts: any = [];

        return this.prompt(prompts).then((props: any) => {
            (this as any).props = props;
        });
    }

    public async write() {
        console.log('开始生成...');
        const indexClassNames: any = [];
        const tags = (await getServiceTags()).concat(generatorConfig.urls);
        await Blubird.map(tags, ({ tag, url }) => this.build(tag, url, indexClassNames));

        this.buildIndex(_.map(tags, ({ tag }) => tag));
        // this.buildTags(_.map(generatorConfig.urls, ({ tag }) => tag));
    }

    public async build(tag: string, url: string, indexClassNames: any) {
        if (!tag || !url) {
            // console.error('error swagger config!');
            return;
        }
        console.log(`正在生成${tag}...`);
        this.destinationRoot(path.join(__dirname, '../.generated'));
        const swaggerurl = url;
        return Axios.get(swaggerurl)
            .then((res) => res.data)
            .then((swagger) => {
                const swaggerData = codegen.getViewForSwagger(
                    {
                        swagger,
                        className: 'clsName',
                    },
                    'typescript'
                );
                swaggerData._ = _;
                this.fs.copyTpl(this.templatePath('types.ejs'), this.destinationPath(`./${tag}/types.ts`), swaggerData);

                this.fs.copyTpl(this.templatePath('types_camel.ejs'), this.destinationPath(`./${tag}/types_camel.ts`), swaggerData);

                this.fs.copyTpl(this.templatePath('enums.ejs'), this.destinationPath(`./${tag}/enums.ts`), swaggerData);

                const classNames = _.chain(swaggerData.methods)
                    .groupBy((method: any) => _.split(method.methodName, '_')[0])
                    .entries()
                    // .take(1)
                    .value();
                classNames.forEach(([className, methods]) => {
                    this.fs.copyTpl(this.templatePath('clientproxy.ejs'), this.destinationPath(`./${tag}/${_.toLower(className)}.ts`), {
                        tag,
                        className,
                        methods,
                    });
                });

                this.fs.copyTpl(this.templatePath('index.ejs'), this.destinationPath(`./${tag}/index.ts`), {
                    classNames: _.map(classNames, ([className]) => ({
                        className,
                        lowerName: _.toLower(className),
                    })),
                });

                this.fs.copyTpl(this.templatePath('services.ejs'), this.destinationPath(`../${tag}.ts`), {
                    classNames: _.map(classNames, ([className]) => ({
                        tag,
                        className,
                        lowerName: _.toLower(className),
                    })),
                });

                indexClassNames.push(
                    ..._.map(classNames, ([className]) => ({
                        tag,
                        className,
                        lowerName: _.toLower(className),
                    }))
                );
            });
    }

    public buildIndex(tags: string[]) {
        if (!tags) {
            return;
        }
        this.fs.copyTpl(this.templatePath('outindex.ejs'), this.destinationPath('index.ts'), {
            classNames: tags,
        });
        // this.fs.copyTpl(
        //     this.templatePath('enumindex.ejs'),
        //     this.destinationPath('enums.ts'), {
        //         classNames: tags
        //     }
        // );
    }
};
