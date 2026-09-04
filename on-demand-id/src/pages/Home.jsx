import { useState } from "react";
import AuthButton from "../components/AuthButton";
import Header from "../components/Header";
import PhoneInput from "../components/PhoneInput";

function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");

  return (
    <>
      <div className="user-badge" aria-hidden="true">
        🥳
      </div>

      <Header />

      <main>
        <section className="auth-card">
          <h1>On-Demand ID to Force Callers to Identify Themselves</h1>

          <h2>(Stops Social Engineering)</h2>
          <PhoneInput
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
          />
          <AuthButton phoneNumber={phoneNumber} selectedCountry={selectedCountry} />
        </section>

        <h2 className="verification-status">
          Click On The Mobile Phone Notification to Verify Biometrics
        </h2>
      </main>
    </>
  );
}

export default Home;
