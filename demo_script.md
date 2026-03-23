# System Demo Script: End-to-End Referral Flow

Follow these steps to record a perfect demonstration of the AI-integrated referral lifecycle.

## Phase 1: The AI Assistant Engagement
1.  **Start at the Homepage:** [olympia-landing.vercel.app](https://olympia-landing.vercel.app/)
2.  **Open the AI Chatbot:** Click the chat bubble in the bottom right.
3.  **Ask a Clinical Question:** 
    *   *Type:* "Do you provide physical therapy for hip replacements?"
    *   *Observation:* Watch the AI answer specifically about Olympia's services.
4.  **Ask About Referrals:**
    *   *Type:* "I'm a doctor. How do I send you a patient?"
    *   *Observation:* The AI will direct you to the **Provider Portal**.

## Phase 2: Provider Portal Submission
1.  **Navigate to Login:** Click the "Provider Portal" button in the menu or go to `/provider-login`.
2.  **Login:**
    *   **Provider ID:** `NPI-001`
    *   **Password:** `password123`
3.  **Submit a New Referral:**
    *   **Patient Name:** "Demo Patient 2026"
    *   **DOB:** `05/12/1975`
    *   **Diagnosis:** "Acute Rehabilitation Post-Stroke"
    *   **Services:** "Skilled Nursing + OT"
4.  **Deploy Audit:** Click the **[Deploy Referral Audit]** button.
5.  **Verify History:** Click the **"History"** tab in the sidebar and show that "Demo Patient" is listed as **PENDING**.

## Phase 3: Admin Intake Management
1.  **Access Admin Dashboard:** Scroll to the footer of the site and click **"Staff Login"**.
2.  **Login:**
    *   **Username:** `admin`
    *   **Password:** `olympia-admin-2026`
3.  **Go to Intake:** Click **"Referral Intake"** in the sidebar.
4.  **Process Referral:**
    *   Find "Demo Patient 2026".
    *   Click the **Blue Play Icon** (Mark as Processing).
    *   Wait a second, then click the **Green Checkmark** (Admitted).
    *   Observe the status change to **ADMITTED**.

## Phase 4: Closing the Loop (Verification)
1.  **Return to Provider Portal:** Switch back to the provider window (or refresh).
2.  **Confirm Sync:** Show that the patient's status has automatically updated to **ADMITTED** for the doctor.

---

### Suggested Recording Tips:
- **Split Screen:** If possible, have the Provider Dashboard and Admin Dashboard side-by-side to show the status changing in real-time.
- **Narrate:** Briefly explain that the AI saves the staff time by filtering questions, and the portal saves them from using old fax machines.
