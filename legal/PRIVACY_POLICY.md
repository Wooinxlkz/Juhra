# Juhra Privacy Policy

**Last updated:** [DATE OF FIRST PUBLIC RELEASE — fill in before publishing]

This policy is written in plain language on purpose. If anything here is unclear, contact us — see [Contact](#contact) below.

## 1. Who we are

Juhra is developed and operated by an individual person, not a registered company at this time:

- **Controller:** Karim
- **Location:** Algeria
- **Contact:** karimsc01t@gmail.com

For the purposes of Algeria's Law No. 18-07 of 10 June 2018 on the protection of natural persons in the processing of personal data, as amended by Law No. 25-11 of 24 July 2025, Karim is the data controller for any personal data processed through Juhra. Given the limited scope of data processed (see below), no separate Data Protection Officer has been appointed; the contact above handles all data protection matters directly.

## 2. What Juhra does **not** do

Before listing what we do collect, here's what an audit of the actual application code confirmed we do **not** do, as of this version:

- No account creation or login is required to use the app in its current form.
- No analytics, telemetry, crash-reporting, or usage-tracking SDK of any kind is built into the app.
- No advertising or ad-tracking SDK is present.
- No data is sold, rented, or shared with data brokers. This will never change.
- The app does not read, scan, or transmit files from your computer outside its own installation folder.

## 3. What we do collect

### 3.1 Local app preferences
Juhra stores a small amount of data **only on your own device** (never transmitted anywhere):
- Your privacy/consent choice (see §4)
- Interface preferences such as light/dark theme, once you set them

This data never leaves your computer and is not accessible to us.

### 3.2 Google Fonts (only if you accept)
Juhra's interface uses three type families (Manrope, DM Mono, Space Grotesk) licensed under the SIL Open Font License. By default, the app does **not** load these from the internet — it asks first, via the consent banner shown on first launch. If you accept, your device contacts Google's font-delivery servers to download the font files, which means Google receives your IP address and standard request metadata (this is normal for any font or resource loaded from a CDN). If you decline, Juhra uses your operating system's built-in fonts instead and never makes that request. You can find Google's own privacy disclosures at https://policies.google.com/privacy. Your choice is stored locally per §3.1 and you are never asked again unless you reinstall the app.

This is currently the **only** third-party service Juhra talks to.

### 3.3 In-game purchases (planned)
Juhra is intended to support in-game and in-app purchases in future versions. When that functionality ships:
- Payment processing will be handled entirely by a third-party payment processor (e.g. a platform or payment gateway), not by us directly — we do not want to, and will not, handle or store your raw card/payment details ourselves.
- We will update this Privacy Policy and the [Refund Policy](REFUND_POLICY.md) before that functionality is enabled, naming the specific processor(s) used, and it will be reflected in the in-app consent flow.
- Purchase records (what was bought, when, and the order/transaction ID) may be retained for support, fraud-prevention, and legal/tax record-keeping purposes.

## 4. Consent

Where Juhra's use of a third party (currently: Google Fonts) is not strictly necessary for the app to function at all, we ask first. The in-app consent banner is the mechanism for this — declining is a fully supported, first-class choice, not a degraded or hidden path. You can change your mind at any time by clearing the app's local storage or reinstalling.

## 5. Children's data

Juhra is not directed at children, and we do not knowingly collect personal data from anyone under the age of 16. Since the app does not currently require an account, name, email, or any other identifying information to use, there is nothing for a child to submit in the first place. If in-game purchases are enabled in a future version, purchase flows will require confirmation that the purchaser is of legal age to make a purchase in their jurisdiction, consistent with standard platform and payment-processor requirements. If we later learn that we have inadvertently collected personal data from a child in a manner inconsistent with this policy, we will delete it.

## 6. Your rights

Under Algerian Law 18-07 (as amended) and as a matter of general good practice regardless of where you're located, you have the right to:
- **Access** any personal data we hold about you
- **Correct** inaccurate data
- **Delete** your data ("right to erasure")
- **Object to** or **restrict** processing
- **Withdraw consent** at any time, where processing is based on consent (e.g. §3.2)

Given how little data Juhra actually processes about any individual (see §3), most requests can be resolved by simply reinstalling the app (which clears local storage) or, once accounts/purchases exist, by emailing us. See [Data Deletion & Unsubscribe Requests](DATA_DELETION_REQUESTS.md) for the process.

You also have the right to lodge a complaint with Algeria's National Authority for the Protection of Personal Data (ANPDP — Autorité Nationale de Protection des Données à Caractère Personnel), or with your own country's equivalent data protection authority if you are located elsewhere.

## 7. Data retention

We do not retain personal data for longer than necessary for the purpose it was collected for. Local app preferences (§3.1) persist only until you clear them or uninstall. Future purchase records (§3.3) will be retained only as long as required for support and legal/tax obligations, after which they will be deleted or anonymized.

## 8. Security

Reasonable technical measures are used to protect any data Juhra does handle. No method of storage or transmission is 100% secure, and we can't guarantee absolute security — but given the app's minimal data footprint, the practical exposure is correspondingly small.

## 9. International transfers

Loading Google Fonts (§3.2), if you accept it, involves a request to Google's global content-delivery network, which may route through servers outside Algeria. No other cross-border transfer of your data currently occurs.

## 10. Changes to this policy

If this policy changes in a way that materially affects what we collect or how we use it, we will update the "Last updated" date above and, where practical, surface the change in-app rather than silently updating this document.

## 11. Contact

Email: **karimsc01t@gmail.com**

This is the single point of contact for all privacy questions, data access/deletion requests, and complaints.

---

See also: [Terms of Service](TERMS_OF_SERVICE.md) · [Cookie Policy](COOKIE_POLICY.md) · [Refund Policy](REFUND_POLICY.md) · [Data Deletion & Unsubscribe Requests](DATA_DELETION_REQUESTS.md)

*This document is a template drafted for Juhra's current functionality. It is not a substitute for advice from a licensed lawyer, and should be reviewed by one — particularly before in-game purchases, accounts, or any EU/UK user base are added — before being published as a final, binding policy.*
