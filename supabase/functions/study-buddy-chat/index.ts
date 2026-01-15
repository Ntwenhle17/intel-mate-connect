import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    if (action === "chat") {
      systemPrompt = `You are an AI Study Buddy specializing in Artificial Intelligence topics including:
- Machine Learning (ML)
- Deep Learning
- Natural Language Processing (NLP)
- Computer Vision
- Neural Networks
- Reinforcement Learning
- AI Ethics
- Data Science fundamentals

You should:
1. Answer questions clearly and concisely about AI topics
2. Provide examples when helpful
3. Suggest related topics the user might want to explore
4. If asked about non-AI topics, politely redirect to AI-related subjects

Always be encouraging and supportive of the learner's journey.`;
    } else if (action === "generate_quiz") {
      systemPrompt = `You are a quiz generator for AI/ML topics. Generate a quiz based on the topic provided.
Return a JSON object with the following structure:
{
  "title": "Quiz title",
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}
Generate 5 questions. Make them progressively harder. Only output valid JSON, no markdown.`;
    } else if (action === "generate_flashcards") {
      systemPrompt = `You are a flashcard generator for AI/ML topics. Generate flashcards based on the topic provided.
Return a JSON array with the following structure:
[
  {
    "question": "Front of flashcard (question/term)",
    "answer": "Back of flashcard (answer/definition)"
  }
]
Generate 5-8 flashcards covering key concepts. Only output valid JSON, no markdown.`;
    } else if (action === "generate_mindmap") {
      systemPrompt = `You are a mind map generator for AI/ML topics. Generate a mind map structure based on the topic provided.
Return a JSON object with the following structure:
{
  "title": "Main Topic",
  "nodes": [
    {
      "id": "1",
      "label": "Central concept",
      "children": [
        {
          "id": "1-1",
          "label": "Sub-concept 1",
          "children": []
        },
        {
          "id": "1-2", 
          "label": "Sub-concept 2",
          "children": [
            {
              "id": "1-2-1",
              "label": "Detail"
            }
          ]
        }
      ]
    }
  ]
}
Create a comprehensive mind map with 3-4 main branches and 2-3 sub-branches each. Only output valid JSON, no markdown.`;
    } else if (action === "generate_notes") {
      systemPrompt = `You are a study notes generator for AI/ML topics. Generate comprehensive study notes based on the topic provided.
Create well-structured notes with:
- Clear headings and subheadings
- Key definitions
- Important concepts explained simply
- Examples where helpful
- Summary points at the end

Format the notes in a clear, readable way using markdown-style formatting.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: action === "chat",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "chat") {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("study-buddy-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
