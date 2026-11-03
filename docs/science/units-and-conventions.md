# Units, Quantities and Conventions

## General rules
- Use SI units by default where appropriate; include commonly taught laboratory units when pedagogically useful.
- Always display units with numerical values.
- Never add, compare or combine incompatible dimensions.
- Store canonical numeric values with explicit unit metadata; convert for display through tested conversion functions.
- Avoid ambiguous abbreviations. Define symbols and subscripts.
- State temperature, pressure, concentration and other conditions when they affect a model.

## Numeric presentation
- Apply significant figures and rounding based on the educational context and measurement precision.
- Keep internal precision separate from displayed precision.
- Do not imply precision beyond the model or input data.
- Represent uncertainty where it is relevant and supported.
- Handle division by zero, invalid logarithm domains, overflow and non-finite values explicitly.

## Conventions
Document conventions per experiment, including:
- Temperature scale.
- Pressure reference and units.
- Concentration definition (e.g. molarity, molality, mass fraction).
- Standard-state assumptions.
- Sign conventions for thermodynamic/electrochemical quantities.
- pH model assumptions and applicable concentration/activity limitations.

## Testing
Unit conversion tests must include round trips, known reference values, invalid units and dimensional mismatch cases.
