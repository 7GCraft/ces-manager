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

function getFormulaByKey(key) {
    return formulas[key];
}

function parse(formulaObj) {
    const constants = formulaObj.constants;
    let tokens = formulaObj.formula.split('');

    let resultStack = [];
    let parseStack = [];

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] == ' ')
            continue;
        
        if (tokens[i] >= '0' && tokens[i] <= '9') {
            let number = "";
            while (i < tokens.length && tokens[i] >= '0' && tokens[i] <= '9') {
                number += tokens[i];
                i++;
            }
            resultStack.push({ token: parseInt(number), type: TOKEN_TYPE.Number });
            i--;
        }

        else if (isValidNonNumberToken(tokens[i])) {
            let tempToken = "";
            while (i < tokens.length &&
                (isValidNonNumberToken(tokens[i]) || (tokens[i] >= '0' && tokens[i] <= '9'))) 
            {
                tempToken += tokens[i];
                i++;
            }
            if (constants.hasOwnProperty(tempToken)) {
                resultStack.push({ token: constants[tempToken], type: TOKEN_TYPE.Number });
            } else if (FUNCTION_TOKENS.includes(tempToken.toUpperCase())) {
                parseStack.push(tempToken.toUpperCase());
            } else {
                resultStack.push({ token: tempToken, type: TOKEN_TYPE.Variable });
            }

            i--;
        }

        else if (tokens[i] == '(' || tokens[i] == ',') {
            parseStack.push(tokens[i]);
        }

        else if (tokens[i] == ')') {
            for (let char = parseStack.pop(); char != '('; char = parseStack.pop()) {
                pushOperator(resultStack, char);
            }
            if (FUNCTION_TOKENS.includes(parseStack[parseStack.length - 1])) {
                pushOperator(resultStack, parseStack.pop());
            }
        }

        else {
            while (parseStack.length > 0 &&
                precedence(tokens[i]) <= precedence(parseStack[parseStack.length - 1])
            ) {
                pushOperator(resultStack, parseStack.pop());
            }
            parseStack.push(tokens[i]);
        }
    }

    while (parseStack.length > 0) {
        let operator = parseStack.pop();
        pushOperator(resultStack, operator);
    }

    return resultStack;
}

function isValidNonNumberToken(char) {
    return (
        (char >= 'a' && char <= 'z') || 
        (char >= 'A' && char <= 'Z') ||
        (char == '_')
    );
}

function precedence(operator) {
    if (operator == '^') {
        return 3;
    } else if (operator == '*' || operator == '/' || operator == '÷') {
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
        console.log(resultStack);
        const tokenObj = evalStack[i];

        if (tokenObj.type == TOKEN_TYPE.Variable) {
            if (!vars.hasOwnProperty(tokenObj.token)) {
                throw `Missing variable ${tokenObj.token}`;
            }
            let varValue = vars[tokenObj.token];
            resultStack.push(varValue);
        } else if (tokenObj.type == TOKEN_TYPE.Operator) {
            let num1 = resultStack.pop();
            let num2 = resultStack.pop();
            resultStack.push(applyOperator(tokenObj.token, num1, num2));
        } else if (tokenObj.type == TOKEN_TYPE.Function) {
            let tempArgs = [];
            while (resultStack.length > 0) {
                tempArgs.push(resultStack.pop());
            }
            resultStack.push(applyFunction(tokenObj.token, tempArgs));
        } else {
            resultStack.push(tokenObj.token);
        }
    }
    return resultStack.pop();
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

    if (funcName == "MIN") {
        return Math.min(...args);
    } else if (funcName == "MAX") {
        return Math.max(...args);
    } else if (funcName == "ROUND") {
        return Math.round(...args);
    }
    return 0;
}

module.exports = {
    getFormulaByKey,
    parse,
    evaluate
}