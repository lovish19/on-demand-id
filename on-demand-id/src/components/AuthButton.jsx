import { isValidPhoneNumber } from "libphonenumber-js";
function AuthButton({phoneNumber,selectedCountry}) {

function handleAuthentication() {
  const isValid = isValidPhoneNumber(
    phoneNumber,
    selectedCountry
  );

  if (!isValid) {
    console.log("Invalid phone number");
    return;
  }

  console.log("Authentication request clicked");
  console.log("Country:", selectedCountry);
  console.log("Phone number:", phoneNumber);
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