"""
Olympia Dx Code Import Script
Reads 04-02-26-Dx-Code-Tool.xlsx and seeds the PostgreSQL database
with diagnosis_lookup and icd9_mappings tables.
Run from the project root: python scripts/import_diagnosis_data.py
"""

import pandas as pd
import psycopg2
import os
import sys
import re

POSTGRES_URL = "postgresql://neondb_owner:npg_C3qfAOGpXDo2@ep-twilight-math-am953joz-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
EXCEL_FILE   = "04-02-26-Dx-Code-Tool.xlsx"

def main():
    print("=" * 60)
    print("Olympia Dx Code Database Importer")
    print("=" * 60)

    # ── 1. Load Excel ────────────────────────────────────────────
    print(f"\n📂 Opening {EXCEL_FILE} ...")
    xl = pd.ExcelFile(EXCEL_FILE)
    print(f"   Sheets found: {xl.sheet_names}")

    # ── 2. Parse Groups sheet → priority map ─────────────────────
    print("\n📋 Parsing Groups sheet ...")
    groups_df = pd.read_excel(EXCEL_FILE, sheet_name="Groups")
    groups_df.columns = ["group_id", "group_name", "priority_order"]
    groups_df = groups_df.dropna(subset=["group_id"])
    groups_df["group_id"]       = groups_df["group_id"].astype(str).str.strip().str.upper()
    groups_df["priority_order"] = pd.to_numeric(groups_df["priority_order"], errors="coerce").fillna(99).astype(int)

    group_priority = dict(zip(groups_df["group_id"], groups_df["priority_order"]))
    group_name_map = dict(zip(groups_df["group_id"], groups_df["group_name"]))
    print(f"   {len(groups_df)} clinical groups loaded.")
    for gid in sorted(group_priority.keys()):
        print(f"     {gid} → {group_name_map[gid]} (priority {group_priority[gid]})")

    # ── 3. Parse Diagnosis Codes master sheet ────────────────────
    print("\n📋 Parsing Diagnosis Codes master sheet ...")
    diag_df = pd.read_excel(EXCEL_FILE, sheet_name="Diagnosis Codes")
    diag_df.columns = ["code", "description", "clinical_group", "subchapter", "comorbidity_group"]
    diag_df = diag_df.dropna(subset=["code"])
    diag_df["code"]             = diag_df["code"].astype(str).str.strip().str.upper()
    diag_df["clinical_group"]   = diag_df["clinical_group"].astype(str).str.strip().str.upper()
    diag_df["comorbidity_group"]= diag_df["comorbidity_group"].fillna("No_group").astype(str).str.strip()
    diag_df["priority_order"]   = diag_df["clinical_group"].map(group_priority).fillna(99).astype(int)
    print(f"   {len(diag_df):,} ICD-10 diagnosis codes loaded.")

    # ── 4. Parse ICD-9 Codes crosswalk sheet ────────────────────
    print("\n📋 Parsing ICD-9 Codes crosswalk sheet ...")
    icd9_col_map = {
        "ICD 9 Codes":           "icd9_code",
        "Potential ICD 10 Codes": "potential_icd10",
        "Unnamed: 2":             "description",
    }
    icd9_df = pd.read_excel(EXCEL_FILE, sheet_name="ICD9 Codes", usecols=list(icd9_col_map.keys()))
    icd9_df = icd9_df.rename(columns=icd9_col_map)
    icd9_df = icd9_df.dropna(subset=["icd9_code"])
    icd9_df["icd9_code"]      = icd9_df["icd9_code"].astype(str).str.strip()
    icd9_df["potential_icd10"]= icd9_df["potential_icd10"].fillna("").astype(str).str.strip()
    icd9_df["description"]    = icd9_df["description"].fillna("").astype(str).str.strip()
    icd9_df["needs_review"]   = (
        icd9_df["description"].str.lower() == "multiple options"
    ) | icd9_df["potential_icd10"].str.contains(",", na=False)
    print(f"   {len(icd9_df):,} ICD-9 crosswalk entries loaded.")
    flagged = icd9_df["needs_review"].sum()
    print(f"   ⚠️  {flagged} entries flagged as 'Multiple Options'.")

    # ── 5. Connect to database ───────────────────────────────────
    print("\n🔌 Connecting to PostgreSQL ...")
    conn = psycopg2.connect(POSTGRES_URL)
    cur  = conn.cursor()
    print("   Connected successfully.")

    # ── 6. Create tables ─────────────────────────────────────────
    print("\n🏗️  Ensuring tables exist ...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS diagnosis_lookup (
            code             VARCHAR(20)  PRIMARY KEY,
            description      TEXT,
            clinical_group   VARCHAR(10),
            priority_order   INTEGER DEFAULT 99,
            subchapter       VARCHAR(50),
            comorbidity_group VARCHAR(100) DEFAULT 'No_group'
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS icd9_mappings (
            icd9_code        VARCHAR(20) PRIMARY KEY,
            potential_icd10  TEXT,
            description      TEXT,
            needs_review     BOOLEAN DEFAULT FALSE
        )
    """)
    conn.commit()

    # ── 7. Seed diagnosis_lookup ─────────────────────────────────
    print(f"\n⬆️  Inserting {len(diag_df):,} rows into diagnosis_lookup ...")
    print("   (Using bulk copy method...)")

    cur.execute("TRUNCATE TABLE diagnosis_lookup RESTART IDENTITY CASCADE")
    conn.commit()

    # Build a list of tuples
    records = [
        (
            str(row["code"]),
            str(row["description"]) if pd.notna(row["description"]) else "",
            str(row["clinical_group"]),
            int(row["priority_order"]),
            str(row.get("subchapter", "") or ""),
            str(row.get("comorbidity_group", "No_group") or "No_group"),
        )
        for _, row in diag_df.iterrows()
    ]

    from psycopg2.extras import execute_values
    BATCH = 5000
    rows_inserted = 0
    for i in range(0, len(records), BATCH):
        chunk = records[i : i + BATCH]
        execute_values(
            cur,
            """
            INSERT INTO diagnosis_lookup
                (code, description, clinical_group, priority_order, subchapter, comorbidity_group)
            VALUES %s
            ON CONFLICT (code) DO UPDATE
                SET description=EXCLUDED.description,
                    clinical_group=EXCLUDED.clinical_group,
                    priority_order=EXCLUDED.priority_order,
                    subchapter=EXCLUDED.subchapter,
                    comorbidity_group=EXCLUDED.comorbidity_group
            """,
            chunk,
            page_size=5000,
        )
        conn.commit()
        rows_inserted += len(chunk)
        sys.stdout.write(f"\r   {rows_inserted:,} / {len(records):,} inserted...")
        sys.stdout.flush()

    print(f"\r   ✅ {rows_inserted:,} rows inserted into diagnosis_lookup.")


    # ── 8. Seed icd9_mappings ────────────────────────────────────
    print(f"\n⬆️  Inserting {len(icd9_df):,} rows into icd9_mappings ...")
    cur.execute("TRUNCATE TABLE icd9_mappings RESTART IDENTITY CASCADE")
    conn.commit()

    icd9_batch = [
        (
            str(row["icd9_code"]),
            row["potential_icd10"],
            row["description"],
            bool(row["needs_review"]),
        )
        for _, row in icd9_df.iterrows()
    ]
    cur.executemany("""
        INSERT INTO icd9_mappings (icd9_code, potential_icd10, description, needs_review)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (icd9_code) DO UPDATE
            SET potential_icd10=EXCLUDED.potential_icd10,
                description=EXCLUDED.description,
                needs_review=EXCLUDED.needs_review
    """, icd9_batch)
    conn.commit()
    print(f"   ✅ {len(icd9_df):,} rows inserted into icd9_mappings.")

    # ── 9. Done ──────────────────────────────────────────────────
    cur.close()
    conn.close()
    print("\n" + "=" * 60)
    print("✅  Import complete! Database is ready.")
    print("=" * 60)

if __name__ == "__main__":
    main()
