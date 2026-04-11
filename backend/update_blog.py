"""One-shot script to update blog post content in DB. Delete after use."""
import asyncio
import sys
sys.path.insert(0, '/app')

from datetime import datetime, timezone
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.blog import BlogPost

POSTS = [
    {
        "slug": "rera-2026-what-every-homebuyer-in-tamil-nadu-should-know",
        "title": "RERA 2026: What Every Homebuyer in Tamil Nadu Should Know",
        "excerpt": (
            "RERA has reshaped the real estate landscape across India, and Tamil Nadu is no exception. "
            "Here is what every homebuyer needs to understand about their rights, builder obligations, "
            "and how to use TNRERA to protect their investment in 2026."
        ),
        "content": """The Real Estate (Regulation and Development) Act has been in force since 2017, but many homebuyers in Tamil Nadu still do not fully understand how it protects them — or how to invoke it when things go wrong. With regulatory enforcement tightening in 2026, this guide covers everything you need to know before signing on any dotted line.

**What RERA Requires of Builders**

Every residential project with more than eight units or a plot exceeding 500 sq.m must be registered with the Tamil Nadu Real Estate Regulatory Authority (TNRERA) before any marketing or sale can begin. Registration forces developers to disclose approved layouts, completion timelines, financial statements, and the names of architects and engineers on record. This information is publicly accessible on the TNRERA portal — always verify it before making any advance payment.

**Escrow Protection: Your Money Is Ring-Fenced**

One of RERA's most powerful provisions requires developers to deposit 70% of all buyer payments into a dedicated escrow account that can only be used for that specific project's land and construction costs. This prevents the common malpractice of diverting funds from one project to fund another. Ask your builder for the escrow account details and confirm they are compliant before paying any instalment beyond the booking amount.

**Timeline Commitments Are Legally Binding**

Under RERA, the possession date stated in your sale agreement is a legal commitment. If your builder misses it, you are entitled to a full refund with interest (currently pegged at the State Bank of India's marginal cost lending rate plus 2%) or continued possession with monthly compensation. Do not accept vague "expected possession" language — insist on a specific date written into the agreement.

**Structural Defect Warranty**

RERA mandates a five-year structural defect warranty from the date of possession. If cracks, seepage, or structural failures emerge within this window, the developer must rectify them at no cost. Document any defects in writing to the builder within the warranty period and file with TNRERA if repairs are not completed within 30 days.

**How to File a Complaint**

TNRERA complaints can be filed online at tnrera.in. The adjudicating officer must decide within 60 days. Penalties for non-compliant developers can reach up to 10% of the project cost, and repeat violations can result in imprisonment. Keep all payment receipts, sale agreements, and written correspondence — these are your evidence.

**Pillar Square's Commitment**

Every project Pillar Square undertakes is fully RERA-registered, escrow-compliant, and delivered with a complete documentation package at handover. We believe regulatory compliance is not a burden — it is the foundation of the trust our clients place in us.""",
        "featured_image": "/uploads/ps.jpg",
        "is_published": True,
        "published_at": datetime(2026, 3, 15, 9, 0, tzinfo=timezone.utc),
    },
    {
        "slug": "construction-cost-trends-chennai-2026-update",
        "title": "Construction Cost Trends in Chennai: 2026 Update",
        "excerpt": (
            "Material prices and labour rates have shifted significantly heading into 2026. "
            "Here is an honest breakdown of what it costs to build in Chennai today, and how "
            "to budget smartly without compromising on quality."
        ),
        "content": """If you commissioned a construction cost estimate two years ago and are only now starting your project, that number is out of date. Chennai's construction economy has seen meaningful price movements across key materials and trades. Here is what the market looks like in early 2026 and how to plan around it.

**Cement and Steel: The Structural Backbone**

Ordinary Portland Cement (OPC 53 grade) is trading at Rs 380-420 per 50 kg bag in Chennai as of Q1 2026, up roughly 8% year-on-year. TMT steel bars (Fe 500D) are priced at Rs 58,000-63,000 per metric tonne, stabilised after a volatile 2024-25 period driven by global demand. For a typical 2,000 sq.ft residence, steel and cement together represent approximately 18-22% of total civil cost — so even a 10% swing meaningfully impacts your budget.

**Sand and Aggregate**

Manufactured sand (M-sand) has become the dominant fine aggregate in Chennai construction following continued restrictions on river sand quarrying. M-sand costs Rs 55-65 per cubic foot delivered to site. Blue metal aggregate (20 mm) is approximately Rs 50-58 per cubic foot. Factor higher wastage rates for M-sand compared to river sand in your estimate — typically 10-15% more material is required.

**Labour Rates in 2026**

Skilled masons command Rs 950-1,100 per day in Chennai, up from Rs 800-900 in 2023. Steel fixers and carpenters are similarly priced. Unskilled helpers range from Rs 550-650 per day. Labour typically accounts for 25-30% of total construction cost, and shortages of skilled trades in Chennai are keeping rates elevated. Locking in a labour contract early — before peak construction season (October-February) — can save 10-15% on this line item.

**All-In Construction Cost Benchmarks**

| Grade | Cost per sq.ft (built-up) |
|-------|--------------------------|
| Basic residential | Rs 1,900-2,200 |
| Mid-range residential | Rs 2,400-2,900 |
| Premium residential | Rs 3,200-4,500 |
| Commercial fit-out | Rs 2,000-3,500 |

These figures exclude land, statutory approvals, interior furniture, and landscaping.

**How to Budget Wisely**

Lock material prices early through a back-to-back supply agreement with your contractor or directly with dealers. Build a 12-15% contingency into your total budget. Prioritise the structural and waterproofing budget — cutting corners here creates disproportionate long-term costs. Finishes and fixtures can be value-engineered more safely than the structural shell.

Pillar Square provides clients with a detailed bill of quantities at project initiation, updated quarterly to reflect current market rates. Transparency on cost is not optional — it is the foundation of every successful project we deliver.""",
        "featured_image": "/uploads/ps2.jpg",
        "is_published": True,
        "published_at": datetime(2026, 2, 20, 9, 0, tzinfo=timezone.utc),
    },
    {
        "slug": "traditional-vs-modern-construction-chennai-complete-guide",
        "title": "Traditional vs Modern Construction in Chennai: A Complete Guide",
        "excerpt": (
            "The choice between contemporary architecture and traditional Tamil design is more than "
            "aesthetic — it affects budget, timeline, maintenance, and how your home feels to live in "
            "for decades. Here is a complete guide to help you decide."
        ),
        "content": """Walk through any neighbourhood in Chennai and you will find two distinct architectural languages in conversation: the clean geometries of modern construction and the ornate heritage of traditional Tamil design. Both have profound merit. Choosing between them — or blending the two — is one of the most personal decisions a homeowner makes.

**What We Mean by Modern Construction**

Modern construction in the Chennai context typically means RCC (reinforced concrete) framing with flat or low-pitch roofs, large glazed openings, minimal ornamentation, and an open-plan interior layout. It is faster to build, easier to waterproof, and readily accommodates integrated smart-home systems. Modern homes are well-suited to compact urban plots where maximising floor area ratio is a priority.

**What We Mean by Traditional Construction**

Traditional Tamil homes — inspired by Chettinad, Brahmin agraharam, and vernacular courtyard house typologies — are characterised by load-bearing brick or stone walls, sloped Mangalore-tiled roofs, carved timber elements, central courtyards for ventilation, and Athangudi or Cuddapah stone flooring. They are thermally superior in Chennai's climate, relying on passive cooling rather than energy-intensive HVAC systems, and carry immense cultural resonance that modern homes cannot replicate.

**Cost and Timeline Comparison**

| Factor | Modern | Traditional |
|--------|--------|-------------|
| Build cost per sq.ft (2026) | Rs 2,000-2,900 | Rs 2,500-4,000 |
| Timeline | 14-18 months | 20-30 months |
| Skilled artisans required | Moderate | High |
| 20-year maintenance cost | Higher | Lower |
| Thermal comfort | HVAC-dependent | Passive cooling |
| Resale appeal | Broad market | Niche premium |

**The Case for a Hybrid Approach**

Many of our best projects in 2025-26 have blended both idioms: an RCC structural frame for speed and seismic resilience, Mangalore tile roofing for thermal performance, Athangudi tile flooring in living areas for character, and a central skylight in place of a traditional open courtyard. This hybrid delivers 70-80% of the traditional aesthetic at modern construction timescales.

**Our Recommendation**

For plots under 2,000 sq.ft in urban Chennai — Anna Nagar, Velachery, Madipakkam — modern or hybrid construction makes practical sense. For larger plots in Tambaram, ECR, or peri-urban areas where land is more generous, a traditional or hybrid design delivers superior long-term value and a living quality that purely modern construction cannot match.

Pillar Square has delivered excellence in both idioms across Chennai. What matters most is that your home reflects your values, your family's way of life, and the neighbourhood it will inhabit for generations. We are happy to walk you through both options before you commit to either.""",
        "featured_image": "/uploads/ps3.jpg",
        "is_published": True,
        "published_at": datetime(2026, 1, 10, 9, 0, tzinfo=timezone.utc),
    },
]


async def main():
    async with AsyncSessionLocal() as db:
        for data in POSTS:
            row = await db.scalar(select(BlogPost).where(BlogPost.slug == data["slug"]))
            if row:
                for k, v in data.items():
                    setattr(row, k, v)
                print("updated:", data["slug"])
            else:
                print("not found:", data["slug"])
        await db.commit()
        print("done")


asyncio.run(main())
