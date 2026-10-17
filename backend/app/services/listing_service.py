import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import logging

from app.schemas import (
    ListingGenerationRequest,
    GeneratedListingResponse,
    ListingQualityScore,
    PlatformEnum,
    SectionRegenerateRequest,
    SectionRegenerateResponse,
)
from app.services.ollama_service import (
    ollama_service,
    OllamaServiceError,
    OllamaConnectionError,
    OllamaModelNotFoundError,
)

logger = logging.getLogger("listingcraft.service")


def compute_quality_score(
    title: str,
    description: str,
    selling_points: List[str],
    keywords: List[str],
    platform: PlatformEnum,
    user_req: ListingGenerationRequest
) -> ListingQualityScore:
    """Computes a realistic, objective quality score based on copy metrics."""
    # 1. SEO Score
    seo = 65
    title_words = title.lower().split()
    if len(title_words) >= 6:
        seo += 10
    if len(title_words) >= 12:
        seo += 5
    if len(keywords) >= 5:
        seo += 10
    if len(keywords) >= 8:
        seo += 10
    seo = min(100, seo)

    # 2. Readability Score
    readability = 70
    if len(selling_points) >= 4:
        readability += 15
    if len(description) >= 200:
        readability += 10
    if any(char in description for char in ["\n", "•", "-"]):
        readability += 5
    readability = min(100, readability)

    # 3. Persuasiveness Score
    persuasiveness = 70
    power_words = ["guaranteed", "premium", "authentic", "handcrafted", "ergonomic", "durable", "easy", "perfect", "instant", "boost", "crafted", "essential"]
    lower_desc = description.lower()
    matches = sum(1 for pw in power_words if pw in lower_desc)
    persuasiveness += min(20, matches * 4)
    if user_req.target_audience and user_req.target_audience.lower() in lower_desc:
        persuasiveness += 10
    persuasiveness = min(100, persuasiveness)

    # Overall weighted average
    overall = int((seo * 0.35) + (readability * 0.35) + (persuasiveness * 0.30))

    if overall >= 88:
        summary = "Exceptional commercial listing: strong search keyword indexing, crisp bullet points, and compelling buyer appeal."
    elif overall >= 75:
        summary = "Well-crafted listing ready for publishing; consider adding more specific keywords or product dimensions for peak conversion."
    else:
        summary = "Good initial draft; review bullet points and search tags to maximize platform visibility."

    return ListingQualityScore(
        overall_score=overall,
        seo_score=seo,
        readability_score=readability,
        persuasiveness_score=persuasiveness,
        summary=summary,
    )


def generate_demo_listing(req: ListingGenerationRequest) -> GeneratedListingResponse:
    """
    Generates a realistic mock listing for demonstration when Ollama is not running.
    Explicitly flags is_demo_mode = True.
    """
    brand_prefix = f"{req.brand_name} - " if req.brand_name else ""
    features_summary = ", ".join(req.features[:3]) if req.features else "Premium build, ergonomic design, versatile everyday use"
    
    if req.platform == PlatformEnum.AMAZON:
        title = f"{brand_prefix}{req.product_name} - {req.category} with {features_summary} | Optimized for {req.target_audience or 'Everyday Living'}"
        alt_titles = [
            f"{req.product_name} - Professional {req.category} by {req.brand_name or 'ListingCraft'} ({req.tone.title()} Edition)",
            f"{brand_prefix}High-Performance {req.product_name} for {req.target_audience or 'Discerning Buyers'}",
            f"{req.product_name} | Durable {req.category} Featuring {features_summary[:40]}"
        ]
        selling_points = [
            f"[ENGINEERED EXCELLENCE] Thoughtfully designed {req.product_name} featuring {features_summary}.",
            f"[TARGETED FOR YOU] Specifically built for {req.target_audience or 'enthusiasts'} seeking reliable quality.",
            f"[EFFORTLESS USE] Ready to integrate seamlessly into your daily routine with zero hassle.",
            f"[DURABLE CRAFTSMANSHIP] Built with dependable materials ensuring long-lasting satisfaction.",
            f"[BUY WITH CONFIDENCE] Backed by responsive customer support and detailed specifications."
        ]
        cta = f"Click 'Add to Cart' today to experience the unmatched utility of {req.product_name}!"
    elif req.platform == PlatformEnum.ETSY:
        title = f"{req.product_name}, {req.category} Gift, Handcrafted {brand_prefix.strip(' -')}, Unique Keepsake for {req.target_audience or 'Loved Ones'}"
        alt_titles = [
            f"Handmade {req.product_name} - Custom {req.category} - Thoughtful Gift",
            f"{req.product_name} Artisan Creation | Sustainable & Distinctive",
            f"Customizable {req.product_name} for {req.target_audience or 'Special Occasions'}"
        ]
        selling_points = [
            f"Handmade with meticulous attention to detail and authentic care.",
            f"Features: {features_summary}.",
            f"The ideal gift for {req.target_audience or 'someone special'}.",
            f"Ships carefully wrapped and ready for gifting.",
            f"Support independent makers with every single purchase."
        ]
        cta = f"Favorite this item and place your order today to secure this one-of-a-kind piece!"
    elif req.platform == PlatformEnum.SHOPIFY:
        title = f"{brand_prefix}{req.product_name} | The Ultimate {req.category}"
        alt_titles = [
            f"{req.product_name} - Designed for Modern {req.target_audience or 'Living'}",
            f"Meet {req.product_name}: Quality {req.category} You Can Rely On",
            f"{brand_prefix}{req.product_name} ({req.category})"
        ]
        selling_points = [
            f"Curated specifically for {req.target_audience or 'our discerning customers'}.",
            f"Highlighting {features_summary}.",
            f"Designed to blend elegance, performance, and everyday simplicity.",
            f"Fast, direct shipping with 100% satisfaction commitment."
        ]
        cta = f"Elevate your experience with {req.product_name}. Select your options and order now!"
    else:
        title = f"{brand_prefix}{req.product_name} - {req.category} ({req.tone.title()} Edition)"
        alt_titles = [
            f"{req.product_name} - Top Rated {req.category}",
            f"{brand_prefix}{req.product_name} for {req.target_audience or 'Active Users'}",
            f"Reliable {req.product_name} - {features_summary[:35]}"
        ]
        selling_points = [
            f"Key advantage: {features_summary}.",
            f"Optimized for {req.target_audience or 'all users'} with a {req.tone} finish.",
            f"Versatile, easy-to-use, and highly practical {req.category}.",
            f"Great value backed by verified product specifications."
        ]
        cta = f"Don't miss out - get your {req.product_name} while supplies last!"

    short_desc = f"Discover {req.product_name}, a premier {req.category} engineered with {features_summary}. Perfectly crafted with a {req.tone.value} aesthetic for {req.target_audience or 'savvy shoppers'}."
    
    full_desc = (
        f"### About {req.product_name}\n\n"
        f"{req.description}\n\n"
        f"Whether you are looking to upgrade your personal setup or seeking the perfect solution for {req.target_audience or 'daily tasks'}, "
        f"{req.product_name} delivers superior performance without compromise.\n\n"
        f"#### Key Highlights\n"
        f"- **Category:** {req.category}\n"
        f"- **Primary Features:** {features_summary}\n"
        f"- **Aesthetic & Tone:** {req.tone.value.title()}\n\n"
        f"Invest in a product designed around your real needs. Order yours today."
    )

    keywords = [
        req.product_name.lower(),
        req.category.lower(),
        f"best {req.category.lower()}",
        f"{req.product_name.lower()} online",
        f"buy {req.product_name.lower()}",
        f"{req.category.lower()} for { (req.target_audience or 'everyone').lower() }",
        "durable " + req.category.lower(),
        "premium " + req.product_name.lower()
    ]
    if req.keywords_to_include:
        keywords = list(dict.fromkeys(req.keywords_to_include + keywords))

    tags = [
        req.category.lower()[:20],
        req.product_name.lower()[:20],
        (req.brand_name or "artisan").lower()[:20],
        req.tone.lower(),
        "gift idea",
        "top seller",
        "must have",
        "handpicked"
    ]

    suggestions = [
        "Include high-resolution lifestyle photography showing the product in real-world use.",
        "Add exact dimensions, weights, and packaging materials to reduce customer return rates.",
        f"Consider A/B testing Title Variation #2 on {req.platform.title()} for mobile searchers."
    ]

    q_score = compute_quality_score(title, full_desc, selling_points, keywords, req.platform, req)

    return GeneratedListingResponse(
        id=str(uuid.uuid4()),
        product_name=req.product_name,
        platform=req.platform,
        title=title,
        alternative_titles=alt_titles,
        short_description=short_desc,
        full_description=full_desc,
        selling_points=selling_points,
        keywords=keywords[:10],
        tags=tags[:13],
        call_to_action=cta,
        quality_score=q_score,
        improvement_suggestions=suggestions,
        is_demo_mode=True,
        created_at=datetime.now(timezone.utc).isoformat(),
    )


class ListingService:
    @staticmethod
    def _build_system_prompt(req: ListingGenerationRequest) -> str:
        platform_instructions = {
            PlatformEnum.AMAZON: (
                "Format specifically for Amazon:\n"
                "- Title: 120-180 characters, Brand + Core Keywords + Specifications, no promotional claims ('cheap', 'best', '#1').\n"
                "- Bullet Points (selling_points): Exactly 5 bullet points, starting with a capitalized benefit in brackets like '[PREMIUM BUILD] Details...'.\n"
                "- Avoid claims of guarantees, cures, or unsupported statistics."
            ),
            PlatformEnum.ETSY: (
                "Format specifically for Etsy:\n"
                "- Title: Poetic, descriptive, separated by commas or slashes, highlighting handmade, artisanal, gift angles.\n"
                "- Bullet Points: Emphasize craftsmanship, materials, dimensions, and personalization.\n"
                "- Tags: Exactly 13 short multi-word search phrases under 20 characters each.\n"
                "- Warm, community-oriented tone."
            ),
            PlatformEnum.SHOPIFY: (
                "Format specifically for a branded Shopify direct-to-consumer store:\n"
                "- Title: Clean, sleek, brand-centric.\n"
                "- Full Description: Rich Markdown structure with subheadings, lifestyle narrative, and benefit bullets.\n"
                "- Persuasive, modern brand voice."
            ),
            PlatformEnum.GENERIC: (
                "Format for general e-commerce marketplaces:\n"
                "- Clear, descriptive title with high-intent keywords.\n"
                "- Balanced, scannable bullet points and structured product description."
            ),
        }

        return (
            "You are an expert e-commerce copywriter and SEO specialist adhering to the highest ethical advertising standards.\n"
            "Your task is to create high-converting, honest, and platform-compliant product listings.\n\n"
            "CRITICAL RULES:\n"
            "1. NEVER invent product specifications, certifications (e.g. FDA, ISO, organic), warranties, materials, or performance claims not mentioned in the user input.\n"
            "2. Adapt the voice to the requested tone and target audience.\n"
            "3. If words to avoid are provided, never use them.\n"
            "4. Return strict JSON matching the schema below without any markdown code fences or conversational preamble.\n\n"
            f"PLATFORM GUIDANCE:\n{platform_instructions.get(req.platform, '')}\n\n"
            "OUTPUT JSON SCHEMA:\n"
            "{\n"
            '  "title": "Primary listing title",\n'
            '  "alternative_titles": ["Alt title 1", "Alt title 2", "Alt title 3"],\n'
            '  "short_description": "2-3 sentence punchy summary",\n'
            '  "full_description": "Detailed markdown product description with headings and paragraphs",\n'
            '  "selling_points": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4", "Bullet 5"],\n'
            '  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6", "keyword 7"],\n'
            '  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],\n'
            '  "call_to_action": "Direct closing CTA",\n'
            '  "quality_score": {\n'
            '    "overall_score": 85,\n'
            '    "seo_score": 88,\n'
            '    "readability_score": 84,\n'
            '    "persuasiveness_score": 82,\n'
            '    "summary": "Summary of listing quality"\n'
            '  },\n'
            '  "improvement_suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]\n'
            "}"
        )

    @staticmethod
    def _build_user_prompt(req: ListingGenerationRequest) -> str:
        prompt = (
            f"Generate a complete e-commerce product listing for:\n"
            f"- Product Name: {req.product_name}\n"
            f"- Category: {req.category}\n"
            f"- Platform: {req.platform.value.upper()}\n"
            f"- Basic Description & Details: {req.description}\n"
            f"- Tone of Voice: {req.tone.value}\n"
            f"- Language: {req.language}\n"
            f"- Desired Title Length: {req.desired_title_length.value}\n"
        )
        if req.brand_name:
            prompt += f"- Brand Name: {req.brand_name}\n"
        if req.target_audience:
            prompt += f"- Target Audience: {req.target_audience}\n"
        if req.features:
            prompt += f"- Key Features/Specs: {', '.join(req.features)}\n"
        if req.keywords_to_include:
            prompt += f"- Keywords to Naturally Include: {', '.join(req.keywords_to_include)}\n"
        if req.words_to_avoid:
            prompt += f"- Words or Claims to Strictly Avoid: {', '.join(req.words_to_avoid)}\n"

        prompt += "\nRespond ONLY with the strict JSON structure."
        return prompt

    async def generate_listing(self, req: ListingGenerationRequest) -> GeneratedListingResponse:
        """
        Generates listing using Ollama when available, or demo mode if requested.
        Raises OllamaConnectionError or OllamaServiceError when Ollama is needed but fails.
        """
        if req.demo_mode:
            logger.info("Executing listing generation in explicit DEMO MODE")
            return generate_demo_listing(req)

        system_prompt = self._build_system_prompt(req)
        user_prompt = self._build_user_prompt(req)

        # Call real Ollama inference
        raw_data = await ollama_service.generate_structured(user_prompt, system_prompt)

        # Safely parse and sanitize fields
        title = str(raw_data.get("title", f"{req.product_name} - {req.category}")).strip()
        alt_titles = [str(t).strip() for t in raw_data.get("alternative_titles", []) if str(t).strip()]
        if not alt_titles:
            alt_titles = [f"{req.product_name} - Premium Edition", f"Authentic {req.product_name}"]

        short_desc = str(raw_data.get("short_description", req.description[:150])).strip()
        full_desc = str(raw_data.get("full_description", req.description)).strip()
        
        selling_points = [str(sp).strip() for sp in raw_data.get("selling_points", []) if str(sp).strip()]
        if not selling_points:
            selling_points = [req.description[:80]]

        keywords = [str(k).strip() for k in raw_data.get("keywords", []) if str(k).strip()]
        tags = [str(t).strip() for t in raw_data.get("tags", []) if str(t).strip()]
        cta = str(raw_data.get("call_to_action", "Order yours today!")).strip()

        # Parse or compute quality score
        qs_raw = raw_data.get("quality_score", {})
        if isinstance(qs_raw, dict) and "overall_score" in qs_raw:
            try:
                quality_score = ListingQualityScore(
                    overall_score=max(0, min(100, int(qs_raw.get("overall_score", 80)))),
                    seo_score=max(0, min(100, int(qs_raw.get("seo_score", 80)))),
                    readability_score=max(0, min(100, int(qs_raw.get("readability_score", 80)))),
                    persuasiveness_score=max(0, min(100, int(qs_raw.get("persuasiveness_score", 80)))),
                    summary=str(qs_raw.get("summary", "Solid commercial listing with clear attributes.")),
                )
            except Exception:
                quality_score = compute_quality_score(title, full_desc, selling_points, keywords, req.platform, req)
        else:
            quality_score = compute_quality_score(title, full_desc, selling_points, keywords, req.platform, req)

        suggestions = [str(s).strip() for s in raw_data.get("improvement_suggestions", []) if str(s).strip()]
        if not suggestions:
            suggestions = [
                "Consider pairing this listing with lifestyle photography to increase conversions.",
                "Review title keywords against seasonal search trends."
            ]

        return GeneratedListingResponse(
            id=str(uuid.uuid4()),
            product_name=req.product_name,
            platform=req.platform,
            title=title,
            alternative_titles=alt_titles,
            short_description=short_desc,
            full_description=full_desc,
            selling_points=selling_points,
            keywords=keywords,
            tags=tags,
            call_to_action=cta,
            quality_score=quality_score,
            improvement_suggestions=suggestions,
            is_demo_mode=False,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    async def regenerate_section(self, req: SectionRegenerateRequest) -> SectionRegenerateResponse:
        """Regenerates a single targeted section."""
        ctx = req.context
        if ctx.demo_mode:
            # Produce fresh variation in demo mode
            full_mock = generate_demo_listing(ctx)
            val = getattr(full_mock, req.section, None)
            if val is None and req.section == "keywords_tags":
                val = {"keywords": full_mock.keywords, "tags": full_mock.tags}
            return SectionRegenerateResponse(section=req.section, value=val, is_demo_mode=True)

        system_prompt = (
            f"You are an expert e-commerce copywriter. Regenerate only the '{req.section}' section "
            f"for a product listing on {ctx.platform.value}. "
            "Adhere strictly to factual accuracy and avoid ungrounded claims. "
            "Respond in JSON format with a single key 'value'."
        )
        user_prompt = (
            f"Product: {ctx.product_name}\n"
            f"Details: {ctx.description}\n"
            f"Platform: {ctx.platform.value}\n"
            f"Tone: {ctx.tone.value}\n"
            f"Current value was: {req.current_value}\n"
            f"Provide a fresh, optimized alternative."
        )

        raw = await ollama_service.generate_structured(user_prompt, system_prompt)
        val = raw.get("value", raw)
        return SectionRegenerateResponse(section=req.section, value=val, is_demo_mode=False)


listing_service = ListingService()
