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
var ts = require("typescript");
var Lint = require("tslint");
var tsutils = require("tsutils");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new MemberNameRule(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var MEMBER_KIND = {
    'public': ts.SyntaxKind.PublicKeyword,
    'protected': ts.SyntaxKind.ProtectedKeyword,
    'private': ts.SyntaxKind.PrivateKeyword,
    'static': ts.SyntaxKind.StaticKeyword,
    'readonly': ts.SyntaxKind.ReadonlyKeyword
};
var MemberNameRule = /** @class */ (function (_super) {
    __extends(MemberNameRule, _super);
    function MemberNameRule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MemberNameRule.prototype.visitClassDeclaration = function (node) {
        if (this.getOptions()) {
            var options = this.getOptions()[0];
            if (options && options instanceof Object) {
                for (var key in options) {
                    if (MEMBER_KIND[key]) {
                        if (typeof (options[key]) === 'string') {
                            var reg = new RegExp(options[key]);
                            for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
                                var child = _a[_i];
                                if (child.name) {
                                    if (tsutils.hasModifier(child.modifiers, MEMBER_KIND[key])) {
                                        if (!reg.test(child.name.getText())) {
                                            this.addFailureAtNode(child, key + " member's name must match /" + options[key] + "/");
                                        }
                                    }
                                }
                            }
                        }
                        else if (options[key] instanceof Object) {
                            var regFunc = options[key]["function"] && new RegExp(options[key]["function"]);
                            var regProp = options[key].property && new RegExp(options[key].property);
                            for (var _b = 0, _c = node.members; _b < _c.length; _b++) {
                                var child = _c[_b];
                                if (child.name) {
                                    var isProp = tsutils.isPropertyDeclaration(child);
                                    var isFunc = tsutils.isFunctionDeclaration(child);
                                    if (tsutils.hasModifier(child.modifiers, MEMBER_KIND[key])) {
                                        if (isFunc && !isProp && regFunc && !regFunc.test(child.name.getText())) {
                                            this.addFailureAtNode(child, key + " function's name must match /" + options[key]["function"] + "/");
                                        }
                                        if (isProp && regProp && !regProp.test(child.name.getText())) {
                                            this.addFailureAtNode(child, key + " property's name must match /" + options[key].property + "/");
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    MemberNameRule.prototype.visitConstructorDeclaration = function (node) {
        if (this.getOptions()) {
            var options = this.getOptions()[0];
            if (options && options instanceof Object) {
                for (var key in options) {
                    if (MEMBER_KIND[key]) {
                        if (typeof (options[key]) === 'string') {
                            var reg = new RegExp(options[key]);
                            for (var _i = 0, _a = node.parameters; _i < _a.length; _i++) {
                                var child = _a[_i];
                                if (child.name) {
                                    if (tsutils.hasModifier(child.modifiers, MEMBER_KIND[key])) {
                                        if (!reg.test(child.name.getText())) {
                                            this.addFailureAtNode(child, key + " member's name must match /" + options[key] + "/");
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        _super.prototype.visitConstructorDeclaration.call(this, node);
    };
    return MemberNameRule;
}(Lint.RuleWalker));
