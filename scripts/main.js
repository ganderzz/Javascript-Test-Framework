

 /* Array of challenge criteria to test input against
 * Valid keys are: 
 * 		type:      The code statement we are testing for
 *		criteria: "contains|missing" - Test if the specified type is either exists or is missing
 *		DOM:       Corresponding DOM element to show the user feedback if the challege has been completed
 *		children:  Additional challeges that fall in the current scope
 */
var challengeList = [{
	type: "VariableDeclaration",
	criteria: "contains",
	DOM: ".rule__one"
}, 
{
	type: "WhileStatement",
	criteria: "missing",
	DOM: ".rule__two"
}, 
{
	type: "ForStatement",
	criteria: "contains",
	DOM: ".rule__three",
	children: [{
		type: "IfStatement",
		criteria: "contains"
	}]
}];

/*
 * Wait for page load before running front-end dependent code
 */
window.onload = function() {
	/* Global caching of DOM objects */
	var parsingTextAreaDOM = document.querySelector(".parser__textarea");
	var errorDOM           = document.querySelector(".error__log");
	var completeDOM        = document.querySelector(".complete");

	/* 
	* Initialize CodeMirror for better JavaScript styling
	*/
	var codemirror = CodeMirror.fromTextArea(parsingTextAreaDOM, {
		lineNumbers: true,
		mode: "javascript"
	});

	/*
	* Operation to run when CodeMirror input has been changed
	* Parse and check if input matches the challenge criteria
	*
	* @var input - CodeMirror object that contains challenge input
	*/
	codemirror.on("change", function(input) {
		errorDOM.innerHTML = ""; // Clear errors

		try {
			var syntax = esprima.parse(input.getValue());
			
			var hasFailedChallenge = testAST(syntax.body, challengeList, function(isComplete, challenge) {
				var elementDOM = document.querySelector(challenge.DOM);

				if(isComplete) {
					elementDOM.classList.add("is--complete");
				} else {
					elementDOM.classList.remove("is--complete");
				}
			});

			// If all challenges have been passed, show feedback to the user
			if(!hasFailedChallenge) {
				completeDOM.classList.remove("is--hidden");
			} else {
				completeDOM.classList.add("is--hidden");
			}
		} catch(exception) {
			if(typeof exception === "object" && exception.hasOwnProperty("lineNumber")) {
				// If the input is not a valid JavaScript progam, do not parse it. Instead, show first found error.
				var error = document.createElement("li");
				error.className = "error-log__item";
				error.innerHTML = exception.lineNumber + ": " + exception.description;

				errorDOM.appendChild(error);

				// Remove completion if user has syntax errors
				completeDOM.classList.add("is--hidden");
			}
		}
	});
};