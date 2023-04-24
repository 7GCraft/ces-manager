const formulas = require('./formulas.json')

const TOKEN_TYPE = {
    Number: Symbol("number"),
    Variable: Symbol("variable"),
    Function: Symbol("function"),
    Operator: Symbol("operator")
};

const FUNCTION_TOKENS = [
    "MIN",
    "MAX",
    "ROUND"
];

const TOKEN = {
    SPACE: ' ',
    OPEN_PARENTHESIS: '(',
    CLOSE_PARENTHESIS: ')',
    COMMA: ',',
    MIN: "MIN",
    MAX: "MAX",
    ROUND: "ROUND"
};

const INVALID_FORMULA_FORMAT_ERR = "Invalid Formula Format";

function getFormulaByKey(key) {
    return formulas[key];
}

function parse(formulaObj) {
    let parseStack = [];
    let resultStack = iterateFormula(formulaObj, parseStack);

    while (parseStack.length > 0) {
        let operator = parseStack.pop();
        pushOperator(resultStack, operator);
    }

    return resultStack;
}

function iterateFormula(formulaObj, parseStack) {
    const constants = formulaObj.constants;
    let tokens = formulaObj.formula.split('');

    let resultStack = [];

    for (let i = 0; i < tokens.length; i++) {
        if (isRedundantToken(tokens[i]))
            continue;
        
        if (isNumberToken(tokens[i])) {
            i += parseNumberToken(tokens.slice(i), resultStack);
        }

        else if (isValidNonNumberToken(tokens[i])) {
            i += parseVariableToken(tokens.slice(i), constants, parseStack, resultStack);
        }

        else if (isParenthesisToken(tokens[i])) {
            parseGroupExpression(tokens[i], parseStack, resultStack);
        }

        else {
            parseOperatorTokens(tokens[i], parseStack, resultStack);
        }
    }

    return resultStack;
}

function parseNumberToken(tokens, resultStack) {
    let number = "";
    let currIdx = 0;
    while (currIdx < tokens.length && isNumberToken(tokens[currIdx])) {
        number += tokens[currIdx];
        currIdx++;
    }
    resultStack.push({ token: parseInt(number), type: TOKEN_TYPE.Number });
    return currIdx - 1;
}

function parseVariableToken(tokens, constants, parseStack, resultStack) {
    let tempToken = "";
    let currIdx = 0;
    while (currIdx < tokens.length &&
        (isValidNonNumberToken(tokens[currIdx]) || isNumberToken(tokens[currIdx]))) 
    {
        tempToken += tokens[currIdx];
        currIdx++;
    }
    if (constants.hasOwnProperty(tempToken)) {
        resultStack.push({ token: constants[tempToken], type: TOKEN_TYPE.Number });
    } else if (FUNCTION_TOKENS.includes(tempToken.toUpperCase())) {
        parseStack.push(tempToken.toUpperCase());
    } else {
        resultStack.push({ token: tempToken, type: TOKEN_TYPE.Variable });
    }
    return currIdx - 1;
}

function parseGroupExpression(currentToken, parseStack, resultStack) {
    if (currentToken == TOKEN.OPEN_PARENTHESIS) {
        parseStack.push(currentToken);
    }
    else if (currentToken == TOKEN.CLOSE_PARENTHESIS) {
        for (let char = parseStack.pop(); char != TOKEN.OPEN_PARENTHESIS; char = parseStack.pop()) {
            if (char === undefined) {
                throw `${INVALID_FORMULA_FORMAT_ERR}. Missing Open Parenthesis`;
            }
            pushOperator(resultStack, char);
        }
        if (FUNCTION_TOKENS.includes(parseStack[parseStack.length - 1])) {
            pushOperator(resultStack, parseStack.pop());
        }
    }
}

function parseOperatorTokens(currentToken, parseStack, resultStack) {
    while (parseStack.length > 0 &&
        precedence(currentToken) <= precedence(parseStack[parseStack.length - 1])
    ) {
        pushOperator(resultStack, parseStack.pop());
    }
    parseStack.push(currentToken);
}

function isRedundantToken(char) {
    const redundantTokens = [
        TOKEN.SPACE,
        TOKEN.COMMA
    ];
    return redundantTokens.includes(char);
}

function isValidNonNumberToken(char) {
    return (
        (char >= 'a' && char <= 'z') || 
        (char >= 'A' && char <= 'Z') ||
        (char == '_')
    );
}

function isNumberToken(char) {
    return (char >= '0' && char <= '9');
}

function isParenthesisToken(char) {
    return (char == TOKEN.OPEN_PARENTHESIS || char == TOKEN.CLOSE_PARENTHESIS);
}

function precedence(operator) {
    if (operator == '^') {
        return 3;
    } else if (operator == '*' || operator == '/') {
        return 2;
    } else if (operator == '+' || operator == '-') {
        return 1;
    }
    return 0;
}

function pushOperator(resultStack, operator) {
    // No need to return the array because array is passed by reference
    if (FUNCTION_TOKENS.includes(operator)) {
        resultStack.push({ token: operator, type: TOKEN_TYPE.Function });
    } else {
        resultStack.push({ token: operator, type: TOKEN_TYPE.Operator });
    }
}

function evaluate(evalStack, vars) {
    if (vars == null) {
        throw `Missing variables`;
    }

    let resultStack = [];
    for (let i = 0; i < evalStack.length; i++) {
        const tokenObj = evalStack[i];

        let processArgs = [
            tokenObj.token,
            resultStack
        ];

        if (tokenObj.type == TOKEN_TYPE.Variable) {
            processArgs.push(vars);
            processVariableToken(...processArgs);
        } else if (tokenObj.type == TOKEN_TYPE.Operator) {
            processOperatorToken(...processArgs);
        } else if (tokenObj.type == TOKEN_TYPE.Function) {
            processFunctionToken(...processArgs);
        } else {
            processNumberToken(...processArgs);
        }
    }
    return resultStack.pop();
}

function processVariableToken(token, resultStack, vars) {
    if (!vars.hasOwnProperty(token)) {
        throw `Missing variable ${token}`;
    }
    let varValue = vars[token];
    resultStack.push(varValue);
}

function processOperatorToken(token, resultStack) {
    let num1 = resultStack.pop();
    let num2 = resultStack.pop();
    resultStack.push(applyOperator(token, num1, num2));
}

function processFunctionToken(token, resultStack) {
    let tempArgs = [];
    while (resultStack.length > 0) {
        tempArgs.push(resultStack.pop());
    }
    resultStack.push(applyFunction(token, tempArgs));
}

function processNumberToken(token, resultStack) {
    resultStack.push(token);
}

function applyOperator(operator, num1, num2) {
    switch (operator) {
        case '^':
            return Math.pow(num2, num1);
        case '*':
            return num2 * num1;
        case '/':
            return num2 / num1;
        case '+':
            return num2 + num1;
        case '-':
            return num2 - num1;
    }
    return 0;
}

function applyFunction(funcName, args) {
    if (!FUNCTION_TOKENS.includes(funcName)) {
        throw "Function does not exist";
    }

    if (funcName == TOKEN.MIN) {
        return Math.min(...args);
    } else if (funcName == TOKEN.MAX) {
        return Math.max(...args);
    } else if (funcName == TOKEN.ROUND) {
        return Math.round(...args);
    }
    return 0;
}

module.exports = {
    getFormulaByKey,
    parse,
    evaluate
}