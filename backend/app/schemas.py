from enum import Enum
from typing import List, Optional, Any
from pydantic import BaseModel, Field


class PlatformEnum(str, Enum):
    AMAZON = "amazon"
    ETSY = "etsy"
    SHOPIFY = "shopify"
    GENERIC = "generic"


class ToneEnum(str, Enum):
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    PERSUASIVE = "persuasive"
    MINIMAL = "minimal"
    LUXURY = "luxury"


class TitleLengthEnum(str, Enum):
    SHORT = "short"       # < 80 chars
    MEDIUM = "medium"     # 80-140 chars
    LONG = "long"         # 140-200 chars


class ListingGenerationRequest(BaseModel):
    product_name: str = Field(..., min_length=2, max_length=200, description="Name of the product")
    category: str = Field(..., min_length=2, max_length=100, description="Product category (e.g. Handmade Jewelry, Electronics)")
    description: str = Field(..., min_length=5, max_length=2500, description="Basic product details or specifications")
    platform: PlatformEnum = Field(..., description="Target selling platform: amazon, etsy, shopify, generic")
    
    # Optional fields
    target_audience: Optional[str] = Field(None, max_length=200, description="Target demographic or customer persona")
    brand_name: Optional[str] = Field(None, max_length=100, description="Brand or store name")
    features: Optional[List[str]] = Field(default_factory=list, description="Key features, materials, or dimensions")
    tone: ToneEnum = Field(default=ToneEnum.PROFESSIONAL, description="Tone of voice")
    language: str = Field(default="English", max_length=50, description="Language for generated listing")
    keywords_to_include: Optional[List[str]] = Field(default_factory=list, description="Specific keywords to weave into copy")
    words_to_avoid: Optional[List[str]] = Field(default_factory=list, description="Claims or words to avoid (e.g. 'cure', 'best on earth')")
    desired_title_length: TitleLengthEnum = Field(default=TitleLengthEnum.MEDIUM, description="Target title length category")
    
    # Execution mode
    demo_mode: bool = Field(default=False, description="Explicit demo simulation mode without calling Ollama")


class ListingQualityScore(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Overall listing quality score out of 100")
    seo_score: int = Field(..., ge=0, le=100, description="SEO and keyword coverage score")
    readability_score: int = Field(..., ge=0, le=100, description="Clarity and formatting readability score")
    persuasiveness_score: int = Field(..., ge=0, le=100, description="Buyer persuasion and CTA strength score")
    summary: str = Field(..., description="One-sentence assessment of the listing's commercial readiness")


class GeneratedListingResponse(BaseModel):
    id: str = Field(..., description="Unique listing identifier")
    product_name: str
    platform: PlatformEnum
    title: str = Field(..., description="Primary optimized listing title")
    alternative_titles: List[str] = Field(default_factory=list, description="Alternative title variations for A/B testing")
    short_description: str = Field(..., description="Punchy summary or snippet")
    full_description: str = Field(..., description="Comprehensive, formatted product description")
    selling_points: List[str] = Field(default_factory=list, description="Key bullet points highlighting benefits")
    keywords: List[str] = Field(default_factory=list, description="High-intent search keywords")
    tags: List[str] = Field(default_factory=list, description="Platform search tags")
    call_to_action: str = Field(..., description="Compelling closing invitation to buy")
    quality_score: ListingQualityScore
    improvement_suggestions: List[str] = Field(default_factory=list, description="Specific suggestions for boosting conversion")
    is_demo_mode: bool = Field(default=False, description="Whether this output was simulated in demo mode")
    created_at: str


class SectionRegenerateRequest(BaseModel):
    section: str = Field(..., description="Section key to regenerate (e.g. title, alternative_titles, full_description, selling_points, keywords, tags, call_to_action)")
    context: ListingGenerationRequest
    current_value: Optional[Any] = None


class SectionRegenerateResponse(BaseModel):
    section: str
    value: Any
    is_demo_mode: bool


class HealthResponse(BaseModel):
    status: str
    ollama_connected: bool
    model_available: bool
    model_name: str
    available_models: List[str]
    message: str
    setup_guidance: Optional[str] = None
