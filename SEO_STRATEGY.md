# Rivera Fragrance House — SEO & Discoverability Execution Guide

This guide details the off-page SEO strategy, Google Search Console indexing, local search visibility (Malabon & Metro Manila), and backlink acquisition for **Rivera Fragrance House**.

---

## 1. Google Search Console Setup & Verification

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add your property (e.g. `https://rivera.perfumehouse.workers.dev` or domain property).
3. Under **HTML Tag Verification**, copy the verification code string (e.g., `google-site-verification=XYZ123...`).
4. In your `.env.local` or Cloudflare Environment Variables, add:
   ```env
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code-here
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```
5. Deploy or restart, then click **Verify** in Google Search Console.
6. Once verified, go to **Sitemaps** on the left sidebar:
   - Enter `sitemap.xml` and click **Submit**.
   - Google will immediately queue `/`, `/catalog`, `/collections`, `/about`, `/atelier`, `/journal`, and all product URLs for crawling.

---

## 2. Google Business Profile (Local SEO for Malabon / Metro Manila)

Since Rivera Fragrance House is a trusted local family-run business based in **Malabon, Metro Manila**, setting up a Google Business Profile provides immense local authority for high-intent search queries such as:
- *"perfumes near me"*
- *"authentic perfume supplier metro manila"*
- *"middle eastern perfumes malabon"*
- *"wholesale perfume supplier philippines"*

### Setup Steps:
1. Go to [business.google.com](https://business.google.com/).
2. Name: **Rivera Fragrance House**
3. Category: **Perfume Store** / **Wholesaler** / **Beauty Supply Store**
4. Service Area: Select **Malabon, Caloocan, Quezon City, Manila, and entire Metro Manila**.
5. Add Website: `https://your-domain.com`
6. Add Photos: Upload high-resolution photos of:
   - Original sealed boxes with visible holographic seals.
   - Batch codes stamped on cartons.
   - Packaging stations showing heavy-duty multi-layer bubble wrap protection.
7. Regular Updates / Google Posts:
   - Post weekly updates on new arrivals from Dubai (e.g., Hawas Black restock, Liquid Brun, Varakh Silver).
   - Link directly to the `/catalog` page with prices in PHP (₱).

---

## 3. High-Impact Philippine Backlink Strategy (Item 19)

Search engines prioritize backlinks from trusted, contextually relevant local sources. Here is the concrete roadmap:

### Tier 1: Philippine Fragrance Enthusiast Communities
- **Reddit (`r/beautytalkph` & `r/fragrance` / `r/ph_fraghead`)**:
  - Participate organically in discussions about legitimate perfume sellers, authentic batch code checks, and Middle Eastern clone longevity.
  - Provide value by explaining how to spot counterfeit Rasasi, Armaf, and Lattafa bottles.
  - Share links to the educational guides on `/journal` (e.g., batch code verification guide, Hawas comparison).
- **Facebook Groups (Fraghead Philippines, Fragheads Philippines Buy/Sell, Middle Eastern Perfumes PH)**:
  - Establish verified legitimacy by posting live unboxing photos, authentic distributor invoices, and sealed boxes.
  - Include the website link in seller profiles and customer transaction reviews.

### Tier 2: Micro-Influencer & Decant Reviewer Outreach
- Partner with Philippine perfume reviewers on TikTok and YouTube (e.g., Filipino frag-comm creators reviewing budget beast-mode perfumes).
- Provide a full sealed bottle or decant sample in exchange for an honest review with a link to your catalog in their bio/description.

### Tier 3: Local Philippine Business Directories (NAP Citations)
Consistent Name, Address, and Phone (NAP) citations build search engine trust:
- [BusinessList.ph](https://www.businesslist.ph/)
- [Yellow-Pages.ph](https://www.yellow-pages.ph/)
- [Philippine Companies Directory](https://www.philippinecompanies.com/)

---

## 4. AI Search Engine Optimization (LLM Optimization)

We have implemented `/llms.txt` and `/llms-full.txt` at the root of your domain.
- Search engines powered by AI (Perplexity AI, ChatGPT Search, Bing Copilot, Google Gemini) specifically parse these files to answer natural language queries such as:
  - *"Where to buy original Rasasi Hawas in the Philippines?"*
  - *"Legit seller of French Avenue Liquid Brun in Metro Manila"*
  - *"Best wholesale supplier for UAE perfumes in Luzon"*
- These text files ensure AI models accurately cite Rivera Fragrance House as a verified family source for original UAE fragrances.
