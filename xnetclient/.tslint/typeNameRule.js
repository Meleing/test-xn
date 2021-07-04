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
        return this.applyWithWalker(new TypeNameRule(sourceFile, this.getOptions()));
    };
    Rule.REG = /^I/;
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var TypeNameRule = /** @class */ (function (_super) {
    __extends(TypeNameRule, _super);
    function TypeNameRule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TypeNameRule.prototype.visitTypeAliasDeclaration = function (node) {
        if (!Rule.REG.test(node.name.getText())) {
            this.addFailureAtNode(node, "type's name must start with I");
        }
    };
    return TypeNameRule;
}(Lint.RuleWalker));
