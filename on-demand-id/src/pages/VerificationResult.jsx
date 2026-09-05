import "./Verification.css";
function VerificationResult({ verificationData }) {

  const authData = verificationData?.auth;

  const geoData = verificationData?.geo;


  const authDetails =
    authData?.data?.details;


  const geoDetails =
    geoData?.data?.details;


  const gpsAddress =
    geoDetails?.address ||
    geoDetails?.location ||
    authDetails?.address;


  const gpsLatitude =
    geoDetails?.latitude ||
    geoDetails?.lat ||
    authDetails?.latitude;


  const gpsLongitude =
    geoDetails?.longitude ||
    geoDetails?.lng ||
    authDetails?.longitude;


  const biometricIdentity =
    authDetails?.name ||
    authDetails?.id ||
    geoDetails?.name ||
    "Not available";


  const trustedDevice =
    geoDetails?.imei ||
    geoDetails?.device_address ||
    geoDetails?.deviceAddress ||
    geoDetails?.device ||
    "Device information not available";


  const timestamp =
    authData?.debug?.timestamp ||
    geoData?.debug?.timestamp;


  return (

    <main className="verification-page">

      <section className="verification-card">


        <h1>
          CONGRATULATIONS!
        </h1>


        <h2 className="success-message">
          You Have Successfully Verified Your Identity
        </h2>


        {/* =====================================
            BIOMETRIC ID
        ====================================== */}

        <div className="verification-row">

          <div className="verification-label">

            <strong>
              Biometric ID
            </strong>

            <span className="label-badge red">
              WHO?
            </span>

          </div>


          <div className="verification-value">

            {biometricIdentity}

          </div>

        </div>


        {/* =====================================
            TRUSTED DEVICE
        ====================================== */}

        <div className="verification-row">

          <div className="verification-label">

            <strong>
              Trusted Device
            </strong>

            <span className="label-badge blue">
              WHAT?
            </span>

          </div>


          <div className="verification-value">

            {trustedDevice}

          </div>

        </div>


        {/* =====================================
            GPS LOCATION
        ====================================== */}

        <div className="verification-row">

          <div className="verification-label">

            <strong>
              GPS Location
            </strong>

            <span className="label-badge purple">
              WHERE?
            </span>

          </div>


          <div className="verification-value">

            {gpsAddress ||
              "Location not available"}


            {gpsLatitude &&
             gpsLongitude && (

              <div className="coordinates">

                {gpsLatitude},
                {" "}
                {gpsLongitude}

              </div>

            )}

          </div>

        </div>


        {/* =====================================
            TIME STAMP
        ====================================== */}

        <div className="verification-row">

          <div className="verification-label">

            <strong>
              Time Stamp
            </strong>

            <span className="label-badge yellow">
              WHEN?
            </span>

          </div>


          <div className="verification-value">

            {timestamp
              ? new Date(
                  timestamp
                ).toLocaleString()

              : "Timestamp not available"}

          </div>

        </div>


        {/* =====================================
            SOURCE ID
        ====================================== */}

        <div className="verification-row">

          <div className="verification-label">

            <strong>
              Source ID
            </strong>

            <span className="label-badge green">
              WHY?
            </span>

          </div>


          <div className="verification-value">

            On-Demand ID Application

            <br />

            <strong>
              (Five DIMENSIONS Workflow)
            </strong>

          </div>

        </div>


        <button
          className="back-button"
          onClick={() => window.location.reload()}
        >
          Go Back
        </button>


      </section>

    </main>

  );
}


export default VerificationResult;
