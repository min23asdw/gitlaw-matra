import os
import json
import logging
import time
from google import genai
from google.genai import types

from agents import AgentSummarizer
from config import GOOGLE_API_KEY, CATEGORIES

# --- Config ---
from config import (
    GOOGLE_API_KEY, 
    CATEGORIES,
    TARGET_CONST_ID,
    OUTPUT_DIR_FINAL,
    FILE_CLEAN,
    FILE_FINAL_SUMMARY
)

# Setup Logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

if not GOOGLE_API_KEY:
    raise ValueError("❌ GOOGLE_API_KEY is missing!")

# Init Google Client
client = genai.Client(api_key=GOOGLE_API_KEY)


# --- AI Helper Functions ---

def categorize_sections_with_ai(sections):
    """
    Step 1: ให้ AI ช่วยแยกหมวดหมู่ 18 หมวด
    """
    # กรองเอาเฉพาะ Section ปกติ (ไม่เอา Header) ไปประมวลผลเพื่อประหยัด Token
    sections_to_process = [s for s in sections if s.get("type") == "section"]
    logging.info(f"🤖 AI Categorizing {len(sections_to_process)} sections...")

    # ส่งแค่ ID กับ Content
    sections_lite = [{"id": s["id"], "content": s["content"]} for s in sections_to_process]
    cats_text = "\n".join([f"- {k}: {v}" for k, v in CATEGORIES.items()])

    prompt = f"""
    Role: Thai Constitutional Law Expert.
    Task: Classify each section into exactly one of the 18 categories.
    Categories:
    {cats_text}
    Input (JSON):
    {json.dumps(sections_lite, ensure_ascii=False)}
    Output: JSON Object {{ "section_id": "category_id" }}
    """

    for attempt in range(1):
        try:
            response = client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:-3]
            
            return json.loads(text)
            
        except Exception as e:
            logging.warning(f"⚠️ Categorization Attempt {attempt+1} Failed: {e}")
            time.sleep(2)
            
    logging.error("❌ Categorization Failed after retries.")
    return {}


def generate_summaries_from_data(sections, year, output_path):
    """
    Step 2: ส่งข้อมูลที่จัดหมวดแล้วไปให้ AgentSummarizer (agents.py) สรุป
    """
    summarizer = AgentSummarizer()
    logging.info(f"⚡ Generating Summaries...")

    grouped_content = {}
    grouped_raw = {}

    for section in sections:
        # skip header use only content
        if section.get("type") == "header": continue

        cat_id = section.get("category_id", "general")
        if cat_id not in grouped_content:
            grouped_content[cat_id] = []
            grouped_raw[cat_id] = []

        grouped_content[cat_id].append(
            f"[ม.{section.get('id', '?')}] {section['content']}"
        )
        grouped_raw[cat_id].append(section)

    # เรียกใช้ Agent
    ai_results = summarizer.run_batch(grouped_content)

    # รวมผลลัพธ์
    final_output = []
    for cat_id, cat_name in CATEGORIES.items():
        if cat_id not in grouped_content:
            continue

        ai_data = ai_results.get(cat_id, {})
        final_output.append(
            {
                "constitution_year": year,
                "category_id": cat_id,
                "category_name": cat_name,
                "ai_summary": ai_data.get("summary", "ไม่มีการสรุป"),
                "key_change": ai_data.get("key_change", "-"),
                "section_count": len(grouped_raw[cat_id]),
                "sections": grouped_raw[cat_id],
            }
        )

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)
    logging.info(f"✅ FINAL SUCCESS! Summary saved to: {output_path}")


# --- Main Execution ---

def main():
    # 1. Load File Clean (Golden Source)
    if not os.path.exists(FILE_CLEAN):
        logging.error(f"❌ ไม่พบไฟล์ {FILE_CLEAN}")
        logging.error("👉 กรุณารัน 'main_robust.py' ก่อน เพื่อสร้างข้อมูลที่ถูกต้อง")
        return

    print(f"📂 Loading Clean Data from: {FILE_CLEAN}")
    with open(FILE_CLEAN, "r", encoding="utf-8") as f:
        sections = json.load(f)
    
    print(f"✅ Loaded {len(sections)} items. TRUSTING this data (No sort/filter applied).")

    # 2. AI Categorize (Using Gemini)
    category_map = categorize_sections_with_ai(sections)

    # 3. Transform & Enrich (เติม Category ID ลงไป)
    ready_for_summary = []
    for item in sections:
        sec_id = str(item["id"])
        
        # เพิ่ม Category ID เข้าไป (Header จะได้ general ซึ่งจะโดนข้ามตอนสรุป)
        cat_id = category_map.get(sec_id, "general")
        
        # สร้าง Object ใหม่โดยรักษาลำดับเดิมไว้ 100%
        enriched_item = item.copy()
        if item.get("type") == "section":
            enriched_item["category_id"] = cat_id
            
        ready_for_summary.append(enriched_item)

    # 4. Generate Final Summary
    try: year = int("".join(filter(str.isdigit, TARGET_CONST_ID)))
    except: year = 0
    
    os.makedirs(OUTPUT_DIR_FINAL, exist_ok=True)
    generate_summaries_from_data(ready_for_summary, year, FILE_FINAL_SUMMARY)


if __name__ == "__main__":
    main()