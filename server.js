const express = require("express")
const fetch = require("node-fetch")
app.use(express.json())

const app = express()

app.post("/chat", async (req, res) => {
  const prompt = req.body.prompt
  const response = await fetch(
    "https://gptapi.crooi.io/v1/chat/completions",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + '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',
      },
      method: "POST",
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-0301',
        messages: [{"role": "user", "content": prompt}],
        stream: true,
      }),
    }
  )

  response.body.pipe(res)
})

app.listen(3000, () => {
    console.log("Server started on port 3000")
})