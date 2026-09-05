import { 
    isValidPhoneNumber,
    getCountryCallingCode,
 } from "libphonenumber-js";


function AuthButton({phoneNumber,selectedCountry}) {

async function handleAuthentication() {
  const isValid = isValidPhoneNumber(
    phoneNumber,
    selectedCountry
  );

  if (!isValid) {
    console.log("Invalid phone number");
    return;
  }

  
  console.log("Authentication request clicked");
  console.log(
    "Full phone number: ",
    `+${getCountryCallingCode(selectedCountry)}${phoneNumber}`
  );
  
    try {

      const response = await fetch(
        "http://localhost:5000/api/auth-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            mobile: `+${getCountryCallingCode(selectedCountry)}${phoneNumber}`
          })
        }
      );

      const data = await response.json();

      console.log("API status:", response.status);
      console.log("API response:", data);

      if (response.ok) {
        console.log(
          "Authentication request successful. Starting polling..."
        );

        checkAuthenticationResult();
      }

    } catch (error) {

      console.error("Request failed:", error);

    }
  }

    async function checkAuthenticationResult() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth-result",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            mobile: `+${getCountryCallingCode(selectedCountry)}${phoneNumber}`
          })
        }
      );

      const data = await response.json();

      console.log("Auth result status:", response.status);
      console.log("Auth result response:", data);

      if (response.status === 200) {
        console.log("AUTHENTICATION SUCCESSFUL!");
        return;
      }

      if (response.status === 422) {
        console.log(
          "Not authenticated yet. Checking again in 2 seconds..."
        );

        setTimeout(() => {
          checkAuthenticationResult();
        }, 2000);

        return;
      }

      if (response.status === 403) {
        console.log("Authentication failed or expired.");
        return;
      }

      console.log(
        "Unexpected authentication response:",
        response.status
      );

    } catch (error) {
      console.error(
        "Authentication result error:",
        error
      );
    }
  }

  return (
    <button 
    className="auth-button"
    onClick={handleAuthentication}>
      Send Authentication Request
    </button>
  );
}

export default AuthButton;