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
        return this.applyWithWalker(new EnumNameRule(sourceFile, this.getOptions()));
    };
    Rule.REG_ENUM = /^EN_[A-Z0-9_]*$/;
    Rule.REG_MEMBER = /^[A-Z0-9_]*$/;
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var EnumNameRule = /** @class */ (function (_super) {
    __extends(EnumNameRule, _super);
    function EnumNameRule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnumNameRule.prototype.visitEnumDeclaration = function (node) {
        if (!Rule.REG_ENUM.test(node.name.getText())) {
            this.addFailureAtNode(node, "Enum's name must match /" + Rule.REG_ENUM.source + "/");
        }
        for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
            var child = _a[_i];
            if (!Rule.REG_MEMBER.test(child.name.getText())) {
                this.addFailureAtNode(child, "Enum member's name must match /" + Rule.REG_MEMBER.source + "/");
            }
        }
    };
    return EnumNameRule;
}(Lint.RuleWalker));
