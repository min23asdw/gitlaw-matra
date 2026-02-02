import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

// --- Configuration ---
// Using a multilingual model optimized for sentence similarity
// 'Xenova/paraphrase-multilingual-MiniLM-L12-v2' is ~470MB mapped, very fast on CPU.
const MODEL_NAME = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';

// Fix __dirname for ES Modules/TypeScript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '../backend/json_output/final');
const OUTPUT_FILE = path.join(__dirname, '../public/data/embeddings.json');
const CONSTITUTIONS = [
    'con2475temp', 'con2475', 'con2489', 'con2490temp', 'con2492', 'con2495',
    'con2502temp', 'con2511', 'con2515temp', 'con2517', 'con2519temp', 'con2520temp',
    'con2521', 'con2534temp', 'con2534', 'con2540', 'con2549temp', 'con2550',
    'con2557temp', 'con2560'
];

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// --- Main Process ---
async function main() {
    console.log(`Loading Model: ${MODEL_NAME}... (This may take a while on first run)`);

    // Create the extractor pipeline
    const extractor = await pipeline('feature-extraction', MODEL_NAME, {
        quantized: false, // Use full precision for better matching? Or true for smaller size. False is safer for consistency.
    });

    console.log("Model Loaded. Starting Embedding Generation...");

    const embeddingsMap: Record<string, number[]> = {}; // Key: "conId_sectionId", Value: vector[]
    let totalSections = 0;

    for (const conId of CONSTITUTIONS) {
        console.log(`Processing ${conId}...`);
        const filePath = path.join(INPUT_DIR, `${conId}_full_summary.json`);

        if (!fs.existsSync(filePath)) {
            console.warn(`Skipping ${conId}: File not found at ${filePath}`);
            continue;
        }

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const richCategories = JSON.parse(rawData);

        // Flatten Sections
        const sections: any[] = [];
        if (Array.isArray(richCategories)) {
            richCategories.forEach((cat: any) => {
                if (cat.sections) {
                    cat.sections.forEach((sec: any) => {
                        if (sec.type === 'section' || !sec.type) {
                            sections.push(sec);
                        }
                    });
                }
            });
        }

        console.log(`  - Found ${sections.length} sections.`);

        // Loop sections
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const key = `${conId}_${section.id}`;
            const text = section.content;

            if (!text || text.length < 5) continue;

            try {
                // Determine pooling: 'mean' or 'cls'?
                // For sentence-transformers, mean pooling is usually standard.
                // Transformers.js output.mean_token gives us the pooled embedding directly if using feature-extraction? 
                // Wait, default pipeline returns tensor of (1, seq_len, hidden_size).
                // We need to pool it.
                // Actually, let's use the 'sentence-similarity' pipeline? No, that compares two.
                // 'feature-extraction' is correct but we need to do mean pooling.

                const output = await extractor(text, { pooling: 'mean', normalize: true });
                // output is a Tensor. .tolist() or .data
                const vector = Array.from(output.data);

                embeddingsMap[key] = vector as number[];
                totalSections++;

                if (i % 20 === 0) {
                    process.stdout.write(`    Progress: ${i}/${sections.length}\r`);
                }

            } catch (err: any) {
                console.log(`    Error generating ${section.id}:`, err.message);
            }
        }
        console.log(`    Completed ${conId}`);
    }

    console.log(`Writing ${totalSections} vectors to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(embeddingsMap));
    console.log("Done!");
}

main();
