import apiConfig from "../config/apiConfig";

export async function sendAuthenticationRequest(mobile) {
    const respone = await fetch (
        apiConfig.endpoints.authRequest,
        {
            method: "POST",
            headers:{
                "x-api-key": apiConfig.apiKey,
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                mobile: mobile,
            }),
        }
    );

    const data = await respone.json();
    return {
        status: respone.status,
        data: data,
    };
}