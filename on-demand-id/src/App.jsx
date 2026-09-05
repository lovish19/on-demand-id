import { useState } from "react";
import "./App.css";

import Home from "./pages/Home";
import VerificationResult from "./pages/VerificationResult";


function App() {

  const [verificationData, setVerificationData] =
    useState(null);


  function handleAuthenticationSuccess(data) {

    console.log(
      "All authentication data received:",
      data
    );

    setVerificationData(data);
  }


  return (
    <div className="app">

      {verificationData ? (

        <VerificationResult
          verificationData={verificationData}
        />

      ) : (

        <Home
          onAuthenticationSuccess={
            handleAuthenticationSuccess
          }
        />

      )}

    </div>
  );
}


export default App;