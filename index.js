require('dotenv').config();
const { Configuration, OpenAIApi} = require('openai');

const express = require("express");
const { getRandomSentence, getResponseInterval } = require("./utils");

const PORT = process.env.PORT || 5000;
const app = express();

const configuration = new Configuration({
    organization: "org-QU6yWcJ3d56TpA7To4UupLVb",
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const server = app.listen(PORT, () => console.log("Server running..."));

const io = require("socket.io")(server, { cors: { origin: "*" } });

app.get("/", (req, res) => {
	// Health Check
	res.send("This service is up and running...");
});

io.on("connection", (socket) => {
	socket.on("fetch_response", async (data) => {
		const { userId, message } = data;
		console.log(message)
		const responseInterval = getResponseInterval(1000, 4000);

		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: `${message}`,
			max_tokens: 10,
			temperature: 0,
		  });
		console.log(response.data)
	
		if(response.data.choices[0].text) {
			socket.emit("stop_typing", { userId });
			socket.emit("fetch_response", {
				response: response.data.choices[0].text,
				userId,
			});
		}

		// setTimeout(() => {
		// 	socket.emit("start_typing", { userId });
		// 	setTimeout(() => {
				// socket.emit("stop_typing", { userId });
				// socket.emit("fetch_response", {
				// 	response: "You said "+message,
				// 	userId,
				// });
		// 	}, responseInterval);
		// }, 1500);
	});
});
