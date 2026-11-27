You are a senior Python developer and AI engineer helping me implement my existing project, Dhandho.

Your task is to integrate Agentic AI into my existing application according to the architecture and requirements below.

IMPORTANT: Keep the implementation beginner-friendly. I am a final-year CSE student, and I need to understand and explain every important part of the code during technical interviews.

Do not overengineer anything.

# 1. FIRST: INSPECT MY EXISTING PROJECT

Before modifying any files:

1. Inspect the complete existing project structure.
2. Identify the React frontend, FastAPI backend, PostgreSQL database integration, authentication, existing CRUD operations, and current configuration.
3. Identify the database models, API routes, schemas, and existing service functions.
4. Identify whether LangChain, LangGraph, or an LLM provider is already configured.
5. Identify which existing functions can be reused for AI tools.
6. Check how the application currently runs and how its database is connected.

Do not assume my folder names, database models, or API routes.

Do not replace working code with newly generated alternatives.

After inspecting the project, briefly explain the existing architecture and give me a simple implementation plan.

Then start implementing the features in the order specified below.

# 2. PROJECT ARCHITECTURE

My application uses:

* Frontend: React
* Backend: Python FastAPI
* Database: PostgreSQL
* AI workflow: LangGraph
* LLM: Use the existing configured provider if available. Otherwise, recommend the simplest suitable option that fits my current configuration.
* Database access: Existing backend database layer and controlled Python functions.

Follow this architecture:

React Chat UI
|
v
FastAPI AI Endpoint
|
v
LangGraph Workflow
|
+---- LLM: Understand the request
|
+---- Follow-up Questions
|
+---- Read-Only Business Tools
|
+---- Prepare Proposed Changes
|
+---- Human Approval Checkpoint
|
+---- Validate and Execute Approved Changes
|
v
Existing FastAPI Database Layer
|
v
PostgreSQL

The LLM must never receive unrestricted database access or execute arbitrary SQL.

Reuse the existing application architecture wherever possible.

# 3. FEATURE IMPLEMENTATION ORDER

Implement the application in the following phases.

Complete and test each phase before proceeding to the next.

## PHASE 1: SIMPLE TEXT-BASED AI ASSISTANT

First, integrate a basic text-based AI assistant into the existing application.

Requirements:

1. Create a simple LangGraph workflow.
2. Accept a user's text message through FastAPI.
3. Use the LLM to understand the user's intent.
4. Support a small set of controlled, read-only business tools.
5. Retrieve actual information using existing backend functions.
6. Return a clear, friendly response to React.

Start with these use cases:

* List my products.
* Show my inventory.
* Show my sales information.
* Calculate revenue for a specified period, if the existing database contains the required information.

Important:

* Reuse existing CRUD functions and database models.
* Do not invent database fields or tables.
* If a metric cannot be calculated from the current schema, explain what is missing rather than inventing a result.
* Do not implement database-changing AI operations yet.
* Do not build voice functionality yet.

Create the simplest possible working implementation.

## PHASE 2: CONVERSATION STATE AND FOLLOW-UP QUESTIONS

After Phase 1 works, add conversation state using LangGraph.

Example:

User: Add a product.

AI: What is the product name?

User: Parle-G.

AI: What is the price?

User: 10 rupees.

AI: How many units are in stock?

User: 50.

AI: I have the product name, price, and quantity. Would you like me to prepare the proposed addition?

Requirements:

1. Remember previous messages in the same conversation.
2. Store the current intent and collected information.
3. Track which required fields are missing.
4. Ask for missing information one question at a time.
5. Update the state when the user responds.
6. Avoid asking again for information already provided.
7. Keep conversation state separate for different users and conversations.
8. Use simple state definitions and understandable functions.

Use LangGraph checkpointing where appropriate.

Do not add a separate agent for each task.

## PHASE 3: HUMAN APPROVAL BEFORE DATABASE CHANGES

This is the most important feature.

Before creating, updating, deleting, or recording any business data, the system must prepare and display the exact proposed change.

Example:

AI: Please review this proposed change.

Product: Parle-G
Price: ₹10
Quantity: 50

[Approve] [Reject]

Only explicit approval for that exact proposal can authorize execution.

Requirements:

1. Implement preview and commit as separate operations.
2. Preview must never modify the database.
3. Use a LangGraph approval checkpoint to pause the workflow.
4. Persist the pending workflow state using a suitable checkpointing mechanism.
5. Add approval and rejection endpoints to FastAPI.
6. Add simple Approve and Reject controls to the existing React UI.
7. On rejection, cancel the proposal without writing anything.
8. On approval, resume the workflow and revalidate the operation.
9. Execute the operation using the existing backend database layer.
10. Return a confirmation only after successful database execution.

SECURITY RULES:

* Never trust the LLM to enforce approval.
* Never let the frontend alone authorize a database write.
* Authenticate and authorize every relevant API request.
* Derive the user's shop or tenant identity from trusted server-side authentication context, not from LLM-generated arguments.
* Validate all fields before writing.
* Tie approval to the exact proposed action and its unique identifier.
* Prevent approval replay and duplicate execution using a persistent, reliable mechanism.
* Reject expired or stale proposals and require a fresh confirmation.
* Use appropriate database transactions.
* Ensure rejection, missing approval, invalid approval, or failed validation never results in a database change.

Do not invent a new authentication system if my project already has one. Extend the existing system.

If the current project lacks tenant isolation, identify that limitation and implement the simplest safe solution consistent with the existing database schema.

Do not expose secrets or API keys in frontend code.

## PHASE 4: BUSINESS ANALYTICS

After approval works correctly, add read-only analytics tools.

Support these questions where the existing database schema permits:

* What is my revenue this month?
* Compare this month with last month.
* Which products sell the most?
* Which products have low stock?

Requirements:

1. Use controlled Python functions and parameterized database queries.
2. Calculate metrics from actual database records.
3. Pass the results to the LLM for explanation.
4. Never ask the LLM to invent or estimate actual sales figures.
5. Handle empty data and missing information gracefully.
6. Explain any assumptions used in calculations.

Reuse existing tables and relationships.

Do not create unnecessary tables or advanced analytics infrastructure.

## PHASE 5: VOICE INTERACTION

Implement voice only after the text-based assistant, conversation state, and approval workflow work correctly.

Requirements:

1. Add a microphone button to React.
2. Convert speech to text using a suitable speech-recognition service.
3. Send the resulting text through the same FastAPI endpoint and LangGraph workflow used by typed messages.
4. Convert assistant responses to speech using a suitable text-to-speech service.
5. Play the response in React.
6. Keep voice input/output separate from the core agent workflow.

Use a straightforward implementation and existing provider configuration where possible.

Do not build a separate voice agent.

Voice-based approval must follow the same authorization and approval rules as text-based approval. Unclear speech must not be treated as consent.

# 4. CODE SIMPLICITY REQUIREMENTS

These rules are mandatory.

1. Write straightforward Python code that a beginner can understand.
2. Use meaningful variable and function names.
3. Keep functions small and focused.
4. Prefer a few clear LangGraph nodes over many unnecessary nodes.
5. Avoid complicated inheritance, abstract factories, excessive classes, and unnecessary design patterns.
6. Do not introduce microservices, Kafka, Kubernetes, Redis, or other infrastructure unless the existing project genuinely requires it.
7. Do not add unnecessary dependencies.
8. Avoid duplicate database models, API endpoints, or business logic.
9. Reuse the existing database session and transaction patterns.
10. Follow the existing project's coding conventions.
11. Add comments only where they explain important or non-obvious logic.
12. Never put API keys, passwords, or database credentials in source code.
13. Keep frontend code simple and consistent with the existing UI.

If a simpler implementation is equally safe and correct, choose the simpler implementation.

# 5. DEVELOPMENT RULES

* Inspect before editing.
* Preserve existing functionality.
* Do not delete or rewrite existing files unnecessarily.
* Do not replace the existing database schema without a clear requirement.
* Do not run destructive database operations.
* Do not reset the database.
* Do not modify production data during testing.
* Do not silently change environment variables or credentials.
* Use the project's existing package manager and conventions.
* If a dependency is required, explain why it is needed.
* Do not claim a feature is complete until it has been implemented and tested.

Before making substantial changes, explain which files you intend to modify.

Implement changes in small, understandable steps.

# 6. TESTING

After implementing each phase:

1. Run the relevant backend tests.
2. Run the frontend checks or build where applicable.
3. Test the main success path.
4. Test failure cases.
5. Fix errors caused by your changes.
6. Explain how I can manually test the feature.

For the approval system, explicitly verify:

* A proposed change does not modify the database.
* Rejection does not modify the database.
* Approval executes the intended operation exactly once.
* Duplicate approval requests do not execute it twice.
* Invalid or expired approvals are rejected.
* One user cannot access another user's business data.
* Invalid prices and quantities are rejected.

Use a test database or isolated test data where appropriate.

# 7. FINAL DELIVERABLES

Keep the existing project structure wherever possible.

When implementation is complete, provide:

1. A summary of the files created or modified.
2. A simple explanation of how the architecture works.
3. Any new dependencies and why they were added.
4. Environment variables that I must configure, without exposing their values.
5. Commands to run the frontend and backend.
6. Steps to test each implemented feature.
7. Tests performed and their actual results.
8. Any remaining limitations or features not implemented.

Clearly distinguish completed features from unfinished features.

Do not generate a separate interview-question document.

# FINAL INSTRUCTION

Start by inspecting my existing project.

Then implement the architecture incrementally, beginning with Phase 1.

Keep the code easy to read, easy to debug, and easy for me to explain in a technical interview.

Correctness and simplicity are more important than the number of features.

Do not skip phases, and do not claim future phases are complete until they have actually been implemented and tested.
