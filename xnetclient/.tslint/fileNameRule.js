"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Lint = require("tslint");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var options = this.getOptions();
        var reg = options && options[0] ? new RegExp(options[0]) : Rule.REG;
        var i = sourceFile.fileName.lastIndexOf('/');
        var fileName = sourceFile.fileName.slice(i + 1);
        if (!reg.test(fileName)) {
            return [new Lint.RuleFailure(sourceFile, 0, sourceFile.end, Rule.FAILURE_STRING + " " + reg.source, 'file-name')];
        }
        else if (fileName === 'index.ts') {
            // 除src/index.ts外, 其他文件不应以index.ts命名
            return [new Lint.RuleFailure(sourceFile, 0, sourceFile.end, "Filename can't be 'index.ts'", 'file-name')];
        }
        return [];
    };
    Rule.REG = /^[a-z0-9_.]*[a-z0-9]$/;
    Rule.FAILURE_STRING = 'Filename must match';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
