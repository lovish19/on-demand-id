import {
  useEffect,
  useRef,
} from "react";

import {
  isValidPhoneNumber,
  getCountryCallingCode,
} from "libphonenumber-js";

const POLL_INTERVAL_MS = 2000;

function AuthButton({
  phoneNumber,
  selectedCountry,
  onAuthenticationComplete,
}) {
  const requestInFlightRef = useRef(false);
  const coordinatorTimerRef = useRef(null);
  const activeRequestIdRef = useRef(0);
  const isPollingRef = useRef(false);
  const pollingCycleInFlightRef = useRef(false);
  const resultsRef = useRef({
    auth: {
      done: false,
      success: false,
      status: null,
      data: null,
    },
    geo: {
      done: false,
      success: false,
      status: null,
      data: null,
    },
    completed: false,
  });


  function clearCoordinatorTimer() {
    if (coordinatorTimerRef.current) {
      clearTimeout(coordinatorTimerRef.current);
      coordinatorTimerRef.current = null;
    }
  }


  function stopPolling() {
    clearCoordinatorTimer();
    isPollingRef.current = false;
    pollingCycleInFlightRef.current = false;
  }


  function resetResults() {
    resultsRef.current = {
      auth: {
        done: false,
        success: false,
        status: null,
        data: null,
      },
      geo: {
        done: false,
        success: false,
        status: null,
        data: null,
      },
      completed: false,
    };
  }


  function getFullMobileNumber() {
    return `+${getCountryCallingCode(selectedCountry)}${phoneNumber}`;
  }


  async function postPollingRequest(url, mobile) {
    const response = await fetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: mobile,
        }),
      }
    );

    const data = await response.json();

    return {
      status: response.status,
      data: data,
    };
  }


  function handleAuthPollingResult(result) {
    console.log(
      "API #2 status:",
      result.status
    );

    console.log(
      "API #2 response:",
      result.data
    );

    if (result.status === 200) {
      console.log(
        "API #2: AUTHENTICATION SUCCESSFUL!"
      );

      resultsRef.current.auth = {
        done: true,
        success: true,
        status: result.status,
        data: result.data,
      };

      return;
    }

    if (result.status === 422) {
      console.log(
        "API #2: Not authenticated yet."
      );

      return;
    }

    if (result.status === 403) {
      console.log(
        "API #2: Authentication failed or expired."
      );

      resultsRef.current.auth = {
        done: true,
        success: false,
        status: result.status,
        data: result.data,
      };

      return;
    }

    console.log(
      "API #2: Unexpected status:",
      result.status
    );
  }


  function handleGeoPollingResult(result) {
    console.log(
      "API #3 status:",
      result.status
    );

    console.log(
      "API #3 response:",
      result.data
    );

    if (result.status === 200) {
      console.log(
        "API #3: GEO-FENCE RESULT SUCCESSFUL!"
      );

      resultsRef.current.geo = {
        done: true,
        success: true,
        status: result.status,
        data: result.data,
      };

      return;
    }

    if (result.status === 422) {
      console.log(
        "API #3: Geo-fence result not ready yet."
      );

      return;
    }

    if (
      result.status === 403 ||
      result.status === 404
    ) {
      console.log(
        "API #3: Geo-fence authentication failed or unavailable."
      );

      resultsRef.current.geo = {
        done: true,
        success: false,
        status: result.status,
        data: result.data,
      };

      return;
    }

    console.log(
      "API #3: Unexpected status:",
      result.status
    );
  }


  function finishIfReady(requestId) {
    if (requestId !== activeRequestIdRef.current) {
      return;
    }

    const results = resultsRef.current;

    if (
      !results.auth.done ||
      !results.geo.done
    ) {
      return;
    }

    stopPolling();

    if (results.completed) {
      return;
    }

    resultsRef.current = {
      ...results,
      completed: true,
    };

    if (!results.auth.success) {
      console.log(
        "Authentication flow stopped before verification page.",
        {
          authStatus: results.auth.status,
          geoStatus: results.geo.status,
        }
      );

      return;
    }

    if (!results.geo.success) {
      console.log(
        "Continuing to verification page with unavailable geo-fence data.",
        {
          authStatus: results.auth.status,
          geoStatus: results.geo.status,
        }
      );
    }

    const combinedAuthenticationData = {
      auth: results.auth.data,
      geo: results.geo.data,
      authStatus: results.auth.status,
      geoStatus: results.geo.status,
    };

    console.log(
      "Both API results received."
    );

    console.log(
      "Final combined authentication data:",
      combinedAuthenticationData
    );

    onAuthenticationComplete(combinedAuthenticationData);
  }


  function scheduleNextPollingCycle(
    mobile,
    requestId
  ) {
    if (requestId !== activeRequestIdRef.current) {
      return;
    }

    clearCoordinatorTimer();

    coordinatorTimerRef.current = setTimeout(() => {
      runPollingCycle(mobile, requestId);
    }, POLL_INTERVAL_MS);
  }


  async function runPollingCycle(
    mobile,
    requestId
  ) {
    if (
      requestId !== activeRequestIdRef.current ||
      !isPollingRef.current ||
      pollingCycleInFlightRef.current
    ) {
      return;
    }

    pollingCycleInFlightRef.current = true;

    const requests = [];
    const results = resultsRef.current;

    if (!results.auth.done) {
      console.log(
        "API #2: Checking authentication..."
      );

      requests.push(
        postPollingRequest(
          "http://localhost:5000/api/auth-result",
          mobile
        ).then((result) => ({
          api: "auth",
          result: result,
        })).catch((error) => ({
          api: "auth",
          error: error,
        }))
      );
    }

    if (!results.geo.done) {
      console.log(
        "API #3: Checking geo-fence result..."
      );

      requests.push(
        postPollingRequest(
          "http://localhost:5000/api/geo-fence-auth-result",
          mobile
        ).then((result) => ({
          api: "geo",
          result: result,
        })).catch((error) => ({
          api: "geo",
          error: error,
        }))
      );
    }

    if (requests.length === 0) {
      pollingCycleInFlightRef.current = false;
      finishIfReady(requestId);
      return;
    }

    try {
      const responses = await Promise.all(requests);

      if (requestId !== activeRequestIdRef.current) {
        return;
      }

      responses.forEach(({ api, result, error }) => {
        if (error) {
          console.error(
            `${api === "auth" ? "API #2" : "API #3"} polling error:`,
            error
          );

          return;
        }

        if (api === "auth") {
          handleAuthPollingResult(result);
        }

        if (api === "geo") {
          handleGeoPollingResult(result);
        }
      });

      pollingCycleInFlightRef.current = false;
      finishIfReady(requestId);

      const latestResults = resultsRef.current;

      if (
        isPollingRef.current &&
        (
          !latestResults.auth.done ||
          !latestResults.geo.done
        )
      ) {
        console.log(
          "Polling incomplete. Checking again in 2 seconds..."
        );

        scheduleNextPollingCycle(mobile, requestId);
      }

    } catch (error) {
      if (requestId !== activeRequestIdRef.current) {
        return;
      }

      console.error(
        "Polling coordinator error:",
        error
      );

      pollingCycleInFlightRef.current = false;
      scheduleNextPollingCycle(mobile, requestId);
    }
  }


  function startPollingCoordinator(mobile) {
    activeRequestIdRef.current += 1;
    stopPolling();
    resetResults();

    const requestId = activeRequestIdRef.current;

    isPollingRef.current = true;

    console.log(
      "Starting API #2 and API #3 polling coordinator..."
    );

    runPollingCycle(mobile, requestId);
  }


  async function handleAuthentication() {
    if (
      requestInFlightRef.current ||
      isPollingRef.current
    ) {
      console.log(
        "Authentication request already in progress."
      );

      return;
    }

    const isValid = isValidPhoneNumber(
      phoneNumber,
      selectedCountry
    );

    if (!isValid) {
      console.log("Invalid phone number");
      return;
    }

    const mobile = getFullMobileNumber();

    console.log("Authentication request clicked");
    console.log("Full phone number:", mobile);

    try {
      requestInFlightRef.current = true;

      const response = await fetch(
        "http://localhost:5000/api/auth-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile: mobile,
          }),
        }
      );

      const data = await response.json();

      console.log("API #1 status:", response.status);
      console.log("API #1 response:", data);

      if (response.status === 200) {
        console.log(
          "API #1 successful."
        );

        startPollingCoordinator(mobile);

        return;
      }

      console.log(
        "Authentication request failed."
      );

    } catch (error) {

      console.error(
        "API #1 request failed:",
        error
      );

    } finally {
      requestInFlightRef.current = false;
    }
  }


  useEffect(() => {
    return () => {
      activeRequestIdRef.current += 1;

      if (coordinatorTimerRef.current) {
        clearTimeout(coordinatorTimerRef.current);
        coordinatorTimerRef.current = null;
      }

      isPollingRef.current = false;
      pollingCycleInFlightRef.current = false;
    };
  }, []);


  return (
    <button
      className="auth-button"
      onClick={handleAuthentication}
    >
      Send Authentication Request
    </button>
  );
}

export default AuthButton;
