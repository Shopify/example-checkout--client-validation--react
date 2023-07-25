import {
  reactExtension,
  TextField,
  useExtensionCapability,
  useBuyerJourneyIntercept,
} from "@shopify/ui-extensions-react/checkout";
import React, { useState } from "react";
// [START client-validation.extension-point]
// Set the entry point for the extension
export default reactExtension("purchase.checkout.contact.render-after", () => <App />);
// [END client-validation.extension-point]

function App() {
  // Set the target age that a buyer must be to complete an order
  const ageTarget = 18;

  // Set up the app state
  const [age, setAge] = useState("");
  const [validationError, setValidationError] = useState("");
  // [START client-validation.subscribe-block-progress]
  // Merchants can toggle the `block_progress` capability behavior within the checkout editor
  const canBlockProgress = useExtensionCapability("block_progress");
  // [END client-validation.subscribe-block-progress]
   // [START client-validation.field-required]
  const label = canBlockProgress ? "Your age" : "Your age (optional)";
  // [END client-validation.field-required]
  // [START client-validation.buyer-journey-intercept]
  // Use the `buyerJourney` intercept to conditionally block checkout progress
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // [START client-validation.block-progress]
    // Validate that the age of the buyer is known, and that they're old enough to complete the purchase
    if (canBlockProgress && !isAgeSet()) {
      return {
        behavior: "block",
        reason: "Age is required",
        // [START client-validation.field-validation-error]
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          if (result.behavior === "block") {
            setValidationError("Enter your age");
          }
        },
        // [END client-validation.field-validation-error]
      };
    }
    // [END client-validation.buyer-journey-intercept]

    if (canBlockProgress && !isAgeValid()) {
      return {
        behavior: "block",
        reason: `Age is less than ${ageTarget}.`,
        // [START client-validation.checkout-validation-error]
        errors: [
          {
            // Show a validation error on the page
            message:
              "You're not legally old enough to buy some of the items in your cart.",
          },
        ],
        // [END client-validation.checkout-validation-error]
      };
    }
    // [END client-validation.block-progress]
    // [START client-validation.allow-progress]

    return {
      behavior: "allow",
      perform: () => {
        // Ensure any errors are hidden
        clearValidationErrors();
      },
    };
  });
  // [END client-validation.allow-progress]
  function isAgeSet() {
    return age !== "";
  }

  function isAgeValid() {
    return Number(age) >= ageTarget;
  }

  function clearValidationErrors() {
    setValidationError("");
  }
  // [START client-validation.render-extension]
  // Render the extension
  return (
    <TextField
      label={label}
      type="number"
      value={age}
      onChange={setAge}
      onInput={clearValidationErrors}
      // [START client-validation.field-required]
      required={canBlockProgress}
      // [END client-validation.field-required]
      error={validationError}
    />
  );
  // [END client-validation.render-extension]
}
