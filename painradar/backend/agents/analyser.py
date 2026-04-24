import json
import logging
import os
import re
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

logger = logging.getLogger("nichemind")


def _build_prompt(niche_data: dict) -> str:
	return (
		"You are an India-first market research analyst. Analyze the pain points in the data "
		"and return only valid JSON with the schema provided. Respond with raw JSON only, no markdown, no explanation, no code fences.\n\n"
		"Schema:\n"
		"{\n"
		"  \"pain_points\": [\n"
		"    {\n"
		"      \"title\": \"string\",\n"
		"      \"description\": \"string\",\n"
		"      \"score\": 9.2\n"
		"    }\n"
		"  ],\n"
		"  \"opportunity\": \"string (2-3 sentences about the market opportunity in India)\",\n"
		"  \"build_recommendation\": {\n"
		"    \"title\": \"string\",\n"
		"    \"description\": \"string\"\n"
		"  },\n"
		"  \"overall_score\": 8.4,\n"
		"  \"scores\": {\n"
		"    \"pain_intensity\": 8.5,\n"
		"    \"market_size\": 7.2,\n"
		"    \"competition_gap\": 9.1\n"
		"  },\n"
		"  \"market_data\": {\n"
		"    \"tam_estimate\": \"₹1,200 Cr+\",\n"
		"    \"target_users\": \"20M+ in India\",\n"
		"    \"maturity\": \"Early stage\"\n"
		"  },\n"
		"  \"competitors\": {\n"
		"    \"existing_solutions\": \"one sentence about what exists today\",\n"
		"    \"your_advantage\": \"one sentence about the India-first advantage\",\n"
		"    \"gap_to_fill\": \"one sentence about the specific gap\"\n"
		"  }\n"
		"}\n\n"
		"Data:\n"
		f"{json.dumps(niche_data, ensure_ascii=False)}"
	)


def _extract_json(text: str):
	match = re.search(r"\{.*\}", text, re.DOTALL)
	if match:
		return json.loads(match.group())
	# If no brackets found, maybe it's just raw json
	try:
		return json.loads(text)
	except Exception:
		raise ValueError("No JSON found in response")


def analyze_niche(niche_data: dict):
	if not niche_data:
		return {"error": "No niche data provided"}

	posts = []
	if isinstance(niche_data, dict):
		posts = niche_data.get("reddit", []) or []
	posts = posts[:15]
	trimmed_posts = []
	for post in posts:
		if not isinstance(post, dict):
			continue
		trimmed_posts.append(
			{
				"title": post.get("title", ""),
				"body": post.get("body", ""),
				"source_api": post.get("source_api", ""),
			}
		)

	prepared_data = {"niche": niche_data.get("niche"), "reddit": trimmed_posts}
	prompt = _build_prompt(prepared_data)
	rough_tokens = len(prompt) // 4
	if rough_tokens > 10000:
		trimmed_posts = trimmed_posts[:10]
		prepared_data = {"niche": niche_data.get("niche"), "reddit": trimmed_posts}
		prompt = _build_prompt(prepared_data)

	api_key = os.getenv("GROQ_API_KEY")
	if not api_key or api_key == "your_key_here":
		return {"error": "GROQ_API_KEY is not configured"}

	client = Groq(api_key=api_key)

	try:
		response = client.chat.completions.create(
			model="llama-3.3-70b-versatile",
			messages=[
				{
					"role": "system",
					"content": (
						"You are an India-first market research analyst. Respond with raw JSON only, no markdown, no explanation, no code fences. "
						"Keep the JSON schema identical to the prompt. Enforce these rules strictly. "
						"If a rule is violated, fix it before responding.\n\n"
						"RULE 1 - SPECIFIC PAIN TITLES: Every pain title must include who is affected, "
						"where in India, and a specific number or INR amount. Use this format: "
						"'<who> in <city/state/region> ... INR <amount> ... <number>% ...'.\n"
						"Example: Gym memberships in Tier-2 cities like Nagpur/Indore cost INR 2,000-4,000/month "
						"but 60 percent of members quit within 3 months due to no accountability system.\n\n"
						"RULE 2 - OPPORTUNITY WITH REASONING: The opportunity must detail the market size and gap in India in 2-3 sentences.\n"
						"Example: INR 4,200 crores market with 180M gym-aware Indians. Currently unaddressed due to high costs.\n\n"
						"RULE 3 - BUILD RECOMMENDATION: Must include a product name, "
						"who pays, pricing model, and a Year 1 target in the description.\n"
						"Example title: GymPass India. Example description: B2B SaaS sold to corporates, "
						"INR 199/employee/month, targeting 500 companies in Year 1.\n\n"
						"RULE 4 - MARKET & COMPETITORS: Provide realistic, niche-specific estimates for India. "
						"TAM must be in INR (Cr/Lakh). Target users must be specific to the India niche. "
						"Competitor analysis must compare against what exists in India today."
					),
				},
				{"role": "user", "content": prompt},
			],
			temperature=0.2,
		)
		content = response.choices[0].message.content.strip()
		try:
			return _extract_json(content)
		except (ValueError, json.JSONDecodeError) as exc:
			logger.warning("Groq response was not valid JSON: %s", exc)
			return {"error": "Failed to parse AI response into JSON format"}
	except Exception as exc:
		logger.exception("Groq API call failed: %s", exc)
		print(f"Groq exception: {exc}")
		return {"error": "Failed to generate analysis due to API error"}

