/* 
 * Imports
 */
var expect = require("chai").expect;
var framework = require("../scripts/challengeFramework.js");

/*
 * Challenges to test against
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
 * Tests
 */
describe("Challenge Framework", function() {
	it("testAST() with no input", function() {
		var hasFailed = framework.testAST([], challengeList);

		expect(hasFailed).to.equal(true);
	});

	it("testAST() has input that passes challenge", function() {
		var challenge = [challengeList[0]];
		var AST = [{ type: "VariableDeclaration" }]

		var hasFailed = framework.testAST(AST, challenge);

		expect(hasFailed).to.equal(false);
	});

	it("testAST() has one input that passes, and fails other tests.", function() {
		var AST = [{ type: "VariableDeclaration" }];

		var hasFailed = framework.testAST(AST, challengeList);

		expect(hasFailed).to.equal(true);
	});

	it("parseBodyByType() check VariableDeclaration.", function() {
		var node = { type: "VariableDeclaration", declarations: "Found" };

		var response = framework.parseBodyByType(node);

		expect(response).to.equal("Found");
	});

	it("parseBodyByType() check VariableDeclarator with function.", function() {
		var node = { type: "VariableDeclarator", init: { type: "FunctionDeclaration", body: { body: "Found" } }};

		var response = framework.parseBodyByType(node);

		expect(response).to.equal("Found");
	});

	it("parseBodyByType() check ForStatement.", function() {
		var node = { type: "ForStatement", body: { body: "Found" }};

		var response = framework.parseBodyByType(node);

		expect(response).to.equal("Found");
	});

	it("passesCriteria() check 'contains'", function() {
		var node = { type: "VariableDeclaration" };

		var hasPassed = framework.passesCriteria(node, challengeList[0]);

		expect(hasPassed).to.equal(true);
	});

	it("passesCriteria() check 'missing'", function() {
		var node = { type: "WhileStatement" };

		var hasPassed = framework.passesCriteria(node, challengeList[1]);

		expect(hasPassed).to.equal(false);
	});

	it("isChallengeComplete() passes", function() {
		var AST = [{ type: "VariableDeclaration" }];

		var isComplete = framework.isChallengeComplete(AST, challengeList[0]);

		expect(isComplete).to.equal(true);
	});

	it("isChallengeComplete() fails", function() {
		var AST = [{ type: "VariableDeclaration" }];

		var isComplete = framework.isChallengeComplete(AST, challengeList[1]);

		expect(isComplete).to.equal(false);
	});
});