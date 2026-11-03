# Privacy Principles

## Default approach
Collect the minimum data required for the feature. Prefer local-first learning for early releases. Do not add analytics, accounts or tracking by default.

## If accounts are introduced
Before implementation, document:
- Purpose and lawful basis appropriate to target jurisdictions.
- Exact data fields and why each is needed.
- Data retention and deletion process.
- Access controls and encryption requirements.
- Account recovery and abuse handling.
- Export and deletion workflows.
- Third-party processors and data transfer implications.
- Age-appropriate design and safeguarding requirements for school-age users.

## Student data
Treat student records as sensitive. Avoid collecting full names, school identifiers, precise location or unnecessary demographic data. Do not expose notebook records in logs or public issue reports.

## AI features
If an AI tutor or content generator is added later, document what data is sent to the model provider, retention, training settings, safety limits and human review. Do not send private student records without a clear, approved purpose and safeguards.
