import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.json({
        message: "iVALT backend is running",
    });
});

app.post("/api/auth-request",async (req, res) => {
    try{
        const {mobile} = req.body;
        console.log("Received mobile: ", mobile);

        console.log("API key exists:", !!process.env.IVALT_API_KEY);
console.log("API key length:", process.env.IVALT_API_KEY?.length);

        const response = await fetch(
            "https://api.ivalt.com/biometric-auth-request",
          {
             method: "POST",
             headers: {
               "x-api-key": process.env.IVALT_API_KEY,
               "Content-Type": "application/json",
            },
             body: JSON.stringify({
             mobile: mobile,
            }),
          }
        );

        const data = await response.json();

        console.log("iVALT status: ", response.status);
        console.log("iVALT response: ", data);

        res.status(response.status).json(data);
    }
    catch(error){
        console.error("Server error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

async function checkAuthenticationResult(mobile) {
  const response = await fetch(
    "https://api.ivalt.com/biometric-auth-result",
    {
      method: "POST",
      headers: {
        "x-api-key": process.env.IVALT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile: mobile,
      }),
    }
  );

  const data = await response.json();

  console.log("Auth result status:", response.status);
  console.log("Auth result response:", data);

  return {
    status: response.status,
    data: data,
  };
}

app.post("/api/auth-result", async (req, res) => {
  try {
    const { mobile } = req.body;

    console.log(
      "Checking authentication for:",
      mobile
    );

    const result =
      await checkAuthenticationResult(mobile);

    res
      .status(result.status)
      .json(result.data);

  } catch (error) {
    console.error(
      "Auth result error:",
      error
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

const PORT =5000;

app.listen(PORT, () =>{
    console.log(`Server running on http://localhost:${PORT}`);
});