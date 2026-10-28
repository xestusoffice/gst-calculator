# XESTUS FINANCE & TAX SUITE
## Production Deployment Guide: GitHub Pages & BigRock Subdomain DNS Setup

This document outlines the exact, step-by-step procedure to deploy the XESTUS platform to **GitHub Pages** and connect it to your custom subdomain on **BigRock** (e.g., `gst.xestus.in` or `calc.xestus.in`).

---

### STEP 1: INITIALIZE GIT AND PUSH TO GITHUB

1. Open your terminal in this workspace:
   ```bash
   cd s:\A_Startups\GST_xestus
   git init
   git add .
   git commit -m "feat: launch world-class XESTUS finance & tax suite"
   ```

2. Create a new repository on your GitHub account (e.g., `GST_xestus` or `xestus-suite`).
   > **Note:** The repository can be **Public** (required for free GitHub Pages).

3. Link your remote repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```

---

### STEP 2: VERIFY GITHUB PAGES CONFIGURATION

1. On GitHub, navigate to your repository:
   **Settings &rarr; Pages** (in the left sidebar).
2. Under **Build and deployment**:
   - **Source:** Select `Deploy from a branch`.
   - **Branch:** Select `main` and folder `/ (root)`.
   - Click **Save**.
3. Under **Custom domain**:
   - Confirm that `gst.xestus.in` is listed (it is automatically detected from the included `CNAME` file).
   - Once DNS propagates, check the box: **"Enforce HTTPS"** (GitHub will provision a free Let's Encrypt SSL certificate within 15-30 minutes).

---

### STEP 3: CONFIGURE DNS RECORDS IN BIGROCK CONTROL PANEL

To route traffic from your BigRock domain (`xestus.in`) to GitHub Pages:

1. Log into your **BigRock Account**: [https://www.bigrock.in](https://www.bigrock.in)
2. Go to **Manage Orders &rarr; List/Search Orders**.
3. Click on your domain name: **`xestus.in`**.
4. In the right-hand panel, scroll down to the **DNS Management** box and click **Manage DNS**.
5. Switch to the **CNAME Records** tab and click **Add CNAME Record**.
6. Enter the following parameters:

| Field | Subdomain Option 1 (`gst.xestus.in`) | Subdomain Option 2 (`calc.xestus.in`) |
| :--- | :--- | :--- |
| **Host Name** | `gst` | `calc` |
| **Value (Points to)** | `<YOUR_GITHUB_USERNAME>.github.io.` | `<YOUR_GITHUB_USERNAME>.github.io.` |
| **TTL** | `7200` (or default `14400`) | `7200` (or default `14400`) |

*(Example: If your GitHub username is `xestusorg`, the value is `xestusorg.github.io`)*

7. Click **Add Record**.

> **Note on Root Domain Apex (`xestus.in`):**  
> If you also want `xestus.in` to point to GitHub Pages, add 4 **A Records** in BigRock pointing to GitHub's Anycast IPs:
> - `185.199.108.153`
> - `185.199.109.153`
> - `185.199.110.153`
> - `185.199.111.153`

---

### STEP 4: GOOGLE SEARCH CONSOLE & ADSENSE APPROVAL CHECKLIST

This repository is pre-configured with Google's highest Quality Guidelines to prevent AdSense "Low-Value Content" rejections:

1. **Verify in Google Search Console:**
   - Add property: `https://gst.xestus.in/`
   - Submit XML Sitemap: `https://gst.xestus.in/sitemap.xml`
2. **AdSense Compliance Infrastructure Already In Place:**
   - &check; **About Us (`about.html`):** Mission, zero-data collection guarantee, founder contact.
   - &check; **Contact Form (`contact.html`):** Working email feedback loop to `xestus.office@gmail.com` with anti-spam honeypot and client-side rate limiting.
   - &check; **Privacy Policy (`privacy-policy.html`):** Indian DPDP Act 2023, GDPR, and CCPA compliant.
   - &check; **Terms of Service (`terms.html`):** Explicit commercial and personal usage rights.
   - &check; **Financial Disclaimer (`disclaimer.html`):** SEBI and Income Tax Department disclaimers.
   - &check; **Cookie Consent Mode v2:** Fully implemented banner with granular acceptance state in `localStorage`.
   - &check; **Position #0 Schema:** Multi-Entity JSON-LD (`WebApplication`, `FAQPage`, `BreadcrumbList`, `Organization`).

---

### STEP 5: CONNECTING CONTACT FORM TO WEB3FORMS (OPTIONAL 1-MINUTE STEP)

The contact form is pre-wired to submit to `xestus.office@gmail.com`. To activate the direct Web3Forms access key:
1. Visit [https://web3forms.com](https://web3forms.com) (100% Free, no registration required).
2. Enter `xestus.office@gmail.com` to receive your unique Access Key.
3. Open `contact.html` and update line 223 with your key:
   ```javascript
   access_key: 'YOUR_ACTUAL_ACCESS_KEY_HERE'
   ```
*(Even without this, the form automatically falls back to an interactive direct `mailto:` launcher!)*

