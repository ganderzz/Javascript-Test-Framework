/*
 * Check if the input passes all the challenges. Provide a callback for front-end logic
 *
 * @var input - array of nodes from an AST
 * @var challengesList - A JSON array of challenges to test the input against
 * @var callback - Additional functionality after a test runs.
 *
 * @returns Boolean - Returns true if a single challenge has failed, and false if all challenges pass
 */
function testAST(input, challengesList, callback) {
	var hasFailedTests = false;

	challengesList.forEach(function(challenge) {
		var isComplete = isChallengeComplete(input, challenge);
		
		// isChallengeComplete returns false when type is correctly missing
		// flip it, because type is correctly missing
		if(challenge.criteria === "missing") {
			isComplete = !isComplete;
		}

		// If isComplete is false, we have one test that fails
		// testAST should return false when any test fails, but continue testing
		if(!isComplete) {
			hasFailedTests = true;
		}

		if(callback && typeof callback === "function") {
			callback(isComplete, challenge);
		}
	});

	return hasFailedTests;
}

/*
 * Get the next child, from an Esprima JSON node, in the AST tree
 *
 * @var node - A Node in the Aprima AST tree
 *
 * @returns Object[] - Array of children nodes
 */
function parseBodyByType(node) {
	switch(node.type) {
		case "IfStatement":
			return node.consequent.body;
		case "ForStatement":
		case "WhileStatement":
		case "FunctionDeclaration":
			 return node.body.body;
		case "ExpressionStatement":
			return node.expression.right.body.body;
		case "CallExpression":
			return node.arguments;
		case "VariableDeclaration":
			return node.declarations;
		case "VariableDeclarator":
			var expression = node.init;
			if(expression.type === "FunctionDeclaration") {
				return expression.body.body;
			}

			return expression;
		default:
			return node.body;
	}
}

/*
 * Test current node on passed in challenge criteria
 *
 * @var node - A Node in the Aprima AST tree
 * @var challenge - Current criteria to test node on
 *
 * @returns Boolean - If node passes challenge or not
 */
function passesCriteria(node, challenge) {
	switch(challenge.criteria) {
		case "contains":
			return node.type === challenge.type;
		case "missing":
			return node.type !== challenge.type;
		default:
			return false;
	}
}

/*
 * Check if current challenge is passed or not
 *
 * @var node - A Node in the Aprima AST tree
 * @var challenge - Current criteria to test node on
 *
 * @returns Boolean - If current challenge passes or not
 */
function isChallengeComplete(node, challenge) {
	var isComplete = false;

	// Loop through all top-level expressions
    for(var key in node) {
        if(node.hasOwnProperty(key)) {
            var element = node[key];

            if (typeof element === 'object' && element !== null) {
				// Check if parent element matches the current challenge criteria
				if(passesCriteria(element, challenge)) {
					isComplete = true;
				}

				if(!isComplete && challenge.criteria === "missing") {
					return true;
				}

				// Check if children of parent expression contain parts of the challenge
				if(!isComplete || isComplete && challenge.criteria === "missing" || challenge.hasOwnProperty("children") && challenge.children.length > 0) {
					var children = parseBodyByType(element);
					var challengeChildren = (isComplete && challenge.hasOwnProperty("children")) ? challenge.children : challenge;

					// If challengeChildren is an array, that means we are looking at sub-challenges
					// We already confirmed the parent passed, so we set isComplete to false again
					// 		to check the sub-challenges
					if(Array.isArray(challengeChildren)) {
						isComplete = false;

						for(var i = 0; i < challengeChildren.length && !isComplete; i++) {
							isComplete = isChallengeComplete(children, challengeChildren[i]);
						}
					} else {
						// We haven't found out challenge in the code yet so repeat the process
						isComplete = isChallengeComplete(children, challengeChildren);
					}
				}

				// If isComplete is true at this point, we found a match for the challenge
				// No reason to continue looping, let's get out of here
				if(isComplete) {
					break;
				}
            }
        }
    }

    return isComplete;
}

/* 
 * Export modules only for unit tests (nodejs)
 */
if(typeof window === "undefined") {
	module.exports = {
		testAST: testAST,
		parseBodyByType: parseBodyByType,
		passesCriteria: passesCriteria,
		isChallengeComplete: isChallengeComplete
	};
}