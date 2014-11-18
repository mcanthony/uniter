/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'vendor/esparse/estraverse',
    'js/util'
], function (
    estraverse,
    util
) {
    'use strict';

    var DECLARATIONS = 'declarations',
        ID = 'id',
        INIT = 'init',
        NAME = 'name',
        Syntax = estraverse.Syntax;

    function VariableDeclarationTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(VariableDeclarationTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.VariableDeclaration;
        },

        transpile: function (node, functionContext, blockContext) {
            var expressions = [],
                transpiler = this;

            util.each(node[DECLARATIONS], function (declaration) {
                functionContext.addVariable(declaration[ID][NAME]);

                if (declaration[INIT] !== null) {
                    expressions.push({
                        'type': Syntax.AssignmentExpression,
                        'operator': '=',
                        'left': declaration[ID],
                        'right': transpiler.expressionTranspiler.transpile(
                            declaration[INIT],
                            functionContext,
                            blockContext
                        )
                    });
                }
            });

            blockContext.prepareStatement().assign({
                'type': Syntax.ExpressionStatement,
                'expression': {
                    'type': Syntax.SequenceExpression,
                    'expressions': expressions
                }
            });
        }
    });

    return VariableDeclarationTranspiler;
});
