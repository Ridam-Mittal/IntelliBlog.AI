import { createAgent, gemini } from "@inngest/agent-kit";
import { marked } from "marked";
import removeMd from 'remove-markdown';

export const moderateComment = async (comment) => {
  const moderationAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY
    }),
    name: "AI Comment Moderation Agent",
    system: `You are an expert AI content moderator for a public blog.

    You must classify user comments into four levels of offensiveness:

    1. "none" — safe, respectful, or neutral.
    2. "mild" — slightly inappropriate, sarcastic, borderline offensive, or passive-aggressive but not harmful.
    3. "strong" — clearly offensive, insulting, or aggressive but without severe hate speech or vulgarity.
    4. "extreme" — vulgar, hateful, threatening, or abusive; violates community guidelines.

    Rules:
    - Provide a short 1–2 sentence explanation justifying your classification.
    - "removable" must be true only for "strong" or "extreme" levels.
    - If "removable" is true, provide a short, polite userNotification email text.
    - If "removable" is false, userNotification must be null.
    - Never invent details not in the comment.

    Output format:
    Return ONLY a valid JSON object with these exact keys:
    {
      "level": "...",
      "explanation": "...",
      "removable": true/false,
      "userNotification": "..." or null
    }

    Do not include markdown, code fences, extra text, or headings.

    Examples:
    Comment: "You are an idiot."
    Output: {
      "level": "strong",
      "explanation": "Contains direct personal insult that is offensive but not vulgar.",
      "removable": true,
      "userNotification": "Your comment has been removed due to offensive language."
    }

    Comment: "I don't agree with this post."
    Output: {
      "level": "none",
      "explanation": "A respectful disagreement without offensive language.",
      "removable": false,
      "userNotification": null
    }

    Comment: "This article is garbage."
    Output: {
      "level": "mild",
      "explanation": "Contains mildly insulting language without strong profanity or threats.",
      "removable": false,
      "userNotification": null
    }
    ` 
  });

  const response = await moderationAgent.run(`You are an AI moderation agent. Classify the following comment and return a JSON object with:

    - level: one of "none", "mild", "strong", or "extreme"
    - explanation: 1-2 sentences explaining the classification
    - removable: true or false (true only if level is "strong" or "extreme")
    - userNotification: a short message to be emailed to the user if the comment is removed (else, return null)

      Respond ONLY with this JSON format:

      {
        "level": "mild",
        "explanation": "Explain briefly why it’s categorized this way.",
        "removable": false,
        "userNotification": null
      }

      ---

      Comment: ${comment}`);

  const raw = response.output?.[0]?.content;

  if (!raw) {
    console.error("Empty or missing AI output:", response);
    return null;
  }

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON from AI:", e.message);
    return null;
  }
};


export const generateContent = async (title) => {
  const generationAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY
    }),
    name: "AI Blog Content Writer",
    system: `
      You are an expert blog content writer.

      Task:
      Given a blog title, generate a structured, original, and engaging blog post body (without including or repeating the title).

      Rules:
      1. Do not include the title anywhere — not in headings, intro, or text.
      2. Write in valid Markdown format only.
      3. Structure: 
        - Start with a 2–3 sentence engaging introduction.
        - Use 2–4 clear subheadings with useful content under each.
        - End with a short conclusion or closing thought.
      4. Content must be:
        - Informative, well-structured, and readable for a general audience.
        - Written in simple, clear language — no jargon unless explained.
        - Friendly and helpful in tone.
      5. No filler phrases like “In this blog post…” or “Here’s your article”.
      6. Output only the Markdown body — no JSON, metadata, comments, code fences, or extra formatting outside of Markdown.
    `
  });

  const response = await generationAgent.run(
    `Write a blog post for the title: "${title}"\nBut do NOT include or repeat the title in the output. Start directly with the body.`
  );

  let markdown = response.output?.[0]?.content;
  if (!markdown) throw new Error("Empty AI response");

  const desc = marked(markdown); // HTML
  const content = removeMd(markdown).trim(); // Plain text

  return { desc, content };
};


export const refineContent = async (desc, content) => {
  // Create a polishing agent
  const polishingAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY
    }),
    name: "AI Blog Content Refiner",
    system: `You are a professional copyeditor and content refiner. 

    Given a draft blog post, your job is to:
    1. Improve clarity, flow, and readability.
    2. Fix any grammar, spelling, and punctuation errors.
    3. Maintain the original tone and intent, but feel free to enrich the content with relevant enhancements, explanations, or examples.
    4. You are allowed to expand on ideas to improve overall quality and reader engagement.
    5. Keep section headings intact unless improving their clarity, but feel free to enhance with more headings.
    6. Return the full refined post in Markdown format, without any explanations or JSON wrappers.
    7. Observe the current html structure also to take reference on how to structure`
    
  });

  // Run the agent with the draft content
  const response = await polishingAgent.run(`Please refine the following blog content for clarity, style, and grammar:\n\n${content} 
    
    ${desc}`);

  // Extract the raw text
  const polished = response.output?.[0]?.content;
  if (!polished) {
    console.error("Empty or missing AI output:", response);
    throw new Error("Empty AI response");
  }

  const descnew = marked(polished); // HTML
  const contentnew = removeMd(polished).trim(); // Plain text

  // Return the cleaned result
  return { descnew, contentnew };
};




export const Summarygenerate = async (content, title) => {
  const SummaryAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY
    }),
    name: 'AI Summary Generator',
    system: `You are an expert summarizer. Given a blog post, return a brief and easy to understand explanatory summary of it. 
    The summary should be clear, neutral, and avoid exaggeration. Return only plain text.`
  });

  const response = await SummaryAgent.run(`Summarize the following blog post titled ${title}:\n\n${content}`);
  const summary = response.output?.[0]?.content?.trim();

  if (!summary) {
    console.error("Empty summary output");
    return "";
  }

  return { summary };
}




export const CategoryAssign = async (content, title, categories = []) => {
  const CategoryAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY
    }),
    name: "AI Category Assigner",
    system: `You are an expert blog category classifier.

    Given:
    - Blog post title
    - Blog post content
    - A list of possible category names

    Your job:
    1. From the provided category list, choose the most relevant category names (1–2 words each).
    2. If no provided category is relevant, create up to 3 new concise category names (still 1–2 words each).
    3. Always return a JSON array of plain strings, e.g.: ["Technology", "AI"].
    4. Rules for selection:
      - Return at most 3 categories.
      - Avoid overly broad categories like "News" or "Misc".
      - Only pick categories that match the **main topics** in the blog.
      - Prefer single words unless 2 words are clearly necessary for meaning.
      - If multiple fit, prioritize: Technology, Health, Finance, Lifestyle, Travel.
    5. Do not repeat categories or include unrelated topics.
    6. Output strictly as JSON — no markdown, no code fences, no text outside the array.

    Examples:
    Possible: ["Technology", "AI", "Machine Learning"]
    Title: "How Neural Networks Learn from Data"
    Content: "...(about AI training methods)..."
    Output: ["Technology", "AI"]

    Possible: ["Travel", "Lifestyle"]
    Title: "10 Healthy Habits for Better Sleep"
    Content: "...(health tips)..."
    Output: ["Health", "Lifestyle"]

    Possible: []
    Title: "The Rise of Quantum Computing"
    Content: "...(future of computing)..."
    Output: ["Technology", "Quantum"]
    `
  });

  const prompt = `
    Title: ${title}
    Content: ${content}
    Possible Categories: ${categories.length > 0 ? categories.join(", ") : "None provided"}

    Select the most relevant categories based on the title and content.
    Return at most 3 categories.
  `;

  const response = await CategoryAgent.run(prompt);

  const raw = response.output?.[0]?.content;

  if (!raw) {
    console.error("Empty or missing AI output:", response);
    return [];
  }

  try {
    // Clean accidental formatting and parse as JSON array
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const categoryArray = JSON.parse(cleaned);

    if (!Array.isArray(categoryArray)) {
      throw new Error("AI did not return an array");
    }

    // Deduplicate and trim extra spaces
    return [...new Set(categoryArray.map(cat => cat.trim()))];
  } catch (e) {
    console.error("Failed to parse AI categories:", e.message, raw);
    return [];
  }
};



export const TagAssign = async (content) => {
  const TagAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY
    }),
    name: "AI Tag Assigner",
    system: `
        You are an intelligent blog tag generator.

        Given the blog post content:

        - Extract 3–7 relevant and specific tags.
        - Each tag must be 1–2 words only.
        - Tags must be highly relevant and specific to the content (not generic terms like "blog" or "post").
        - Return the output strictly as a valid JSON array of strings.
        - Do not include any extra text, explanation, or formatting.
        - Do not use code fences , markdown, or any other enclosing characters.
        - If you cannot produce valid tags, return [].
        - Remove duplicates and trim extra spaces.

        Example output:
        ["JavaScript", "Web Development", "React", "Frontend"]
      `
    });

  const prompt = `
Content: ${content}

Generate relevant tags for this blog post content.
`;

  const response = await TagAgent.run(prompt);

  const raw = response.output?.[0]?.content;

  if (!raw) {
    console.error("Empty or missing AI output:", response);
    return [];
  }

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const tagArray = JSON.parse(cleaned);

    if (!Array.isArray(tagArray)) {
      throw new Error("AI did not return an array");
    }

    // Deduplicate and trim extra spaces
    return [...new Set(tagArray.map(tag => tag.trim()))];
  } catch (e) {
    console.error("Failed to parse AI tags:", e.message, raw);
    return [];
  }
};



export const RefineTitle = async (content, originalTitle) => {
  const TitleAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    name: "AI Title Refiner",
    system: `
      You are an expert blog title editor.

      Your task:
      1. You will receive:
        - The original blog title
        - The full blog post content
      2. If the original title has more than 4 words:
        - Shorten it while keeping the core meaning.
        - Make it catchy and relevant.
      3. If the original title has 4 words or fewer:
        - Keep its length similar, but improve clarity and impact.
      4. The refined title must:
        - Be between 3 and 8 words
        - Be clear, concise, and directly relevant to the content
        - Avoid unnecessary filler words
      5. Return ONLY the refined title as plain text, with no quotation marks, punctuation at the end, or explanations.
      6. Never invent information not supported by the content.
    `

  });

  const prompt = `
Original Title: ${originalTitle}
Content: ${content}

Refine the title based on the content and instructions above.
`;

  const response = await TitleAgent.run(prompt);

  const refinedTitle = response.output?.[0]?.content?.trim();

  if (!refinedTitle) {
    console.error("Empty or missing AI output:", response);
    return originalTitle;
  }

  // Basic fallback check
  if (refinedTitle.length === 0 || refinedTitle.length > 60) {
    return originalTitle;
  }

  return refinedTitle;
};
