function validateEmail(email) {
    // Check if each email in the array matches the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function validateNoSpacesArray(inputs) {
    // console.table(inputs)
    for (let input of inputs) {
      if (input.trim().length === 0) {
        // console.log(input)
        return false; // Return false if any input contains only whitespace characters
      }
    }
    return true; // Return true if all inputs contain at least one non-whitespace character
  }
  function validateNoSpaces(input) {
    if (input.trim().length <= 0) {
      return false; // Return false if any input contains only whitespace characters
    }
    return true; // Return true if all inputs contain at least one non-whitespace character
  }
  
  function validateNumber(valueOrArray) {
    if (Array.isArray(valueOrArray)) {
      // console.log(valueOrArray)
      // Regular expression to allow only digits
      const phoneRegex = /^[0-9]+$/;
      for (let i = 0; i < valueOrArray.length; i++) {
        if (!phoneRegex.test(valueOrArray[i])) {
          return false; // Return false if any phone number fails the validation
        }
      }
      return true; // Return true if all phone numbers pass the validation
    } else {
      // Implement number validation logic for single value
      // For example, check if the value is an integer
      return Number.isInteger(valueOrArray);
    }
  }
  
  function validatorUUID(uuid) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(uuid);
  }
  
  function validateRequestBody(body, requiredFields) {
    console.log(body);
    // console.log(requiredFields);
    for (const field of requiredFields) {
      if (typeof body[field] === "string") {
        // Check if the field is a string
        if (!body[field] || body[field].trim() === "") {
          return false; // Return false if any required string field is missing or empty
        }
      } else if (typeof body[field] === "number") {
        // Check if the field is a number (integer)
        if (!validateNumber(body[field])) {
          return false; // Return false if the number validation fails
        }
      } else if (typeof body[field] === "object") {
        return true;
      } else if (typeof body[field] === "boolean") {
        return true;
      } else {
        // Invalid field type
        return false;
      }
    }
    return true; // Return true if all required fields are present and valid
  }
  
  function validateNotNull(inputs) {
    for (let input of inputs) {
      if (input === null || input === undefined) {
        return false; // Return false if any input is null or undefined
      }
    }
    return true; // Return true if all inputs are not null or undefined
  }
  
  module.exports = { validateNoSpaces, validateEmail, validateNoSpacesArray, validateNumber, validatorUUID, validateRequestBody, validateNotNull };
  