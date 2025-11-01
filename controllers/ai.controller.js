import PartyPalace from "../models/partypalace.model.js";
import openai from "../services/ai.service.js";
import axios from "axios";

//chatgpt api model (maybe work, but for now I have no access to chatgpt api, It is paid)

export const AISuggetPartyPalaceController = async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({
        msg: "user message is required",
        success: false,
        error: true,
      });
    }

    const aiResponse = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that suggests party palace from a database.",
        },
        { role: "user", content: userMessage },
      ],
      model: "gpt-3.5-turbo",
    });

    const intent = aiResponse.choices[0].message.content;

    //search database based on AI response (cheap and best logic);
    const query = {};

    if (intent.toLowerCase().includes("cheapest"))
      query.pricePerHour = { $lt: 500 };

    const results = await PartyPalace.find(query).sort({
      pricePerHour: 1,
    });

    return res.status(200).json({
      msg: "Party palace suggested successfully",
      error: false,
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

// deepseek api model (Natural Language Processing)
export const DeepSeekSuggestPartyPalace = async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage)
      return res.status(400).json({
        msg: "user message is required",
        success: false,
        error: true,
      });

    // Mock DeepSeek API response
    const mockDeepSeekResponse = {
      intent: "cheapest",
      entities: [],
    };

    const config = {
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
    };

    const { intent, entities } = mockDeepSeekResponse;

    //creating query
    const query = {};

    if (intent.includes("cheapest")) query.pricePerHour = { $lt: 500 };

    const response = await PartyPalace.find(query).sort({ pricePerHour: 1 });

    return res.status(200).json({
      msg: "Party palace suggested successfully",
      success: true,
      error: false,
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};
