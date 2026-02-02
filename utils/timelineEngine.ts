import {
    fetchConstitutionData,
    getAllConstitutions,
    SectionContent
} from './dataLoader';
import stringSimilarity from 'string-similarity';
import { loadEmbeddings, getEmbedding } from './embeddingLoader';

export interface TimelineNode {
    year: number;
    constitutionId: string;
    constitutionName: string;
    section: SectionContent;
    similarity: number;
    status: 'MATCH' | 'MODIFIED' | 'NEW' | 'MISSING';
    isCurrent: boolean;
}

const SIMILARITY_THRESHOLD_STRICT = 0.95;
// const SIMILARITY_THRESHOLD_VECTOR = 0.82; // Unused
const SIMILARITY_THRESHOLD_INTRA_CATEGORY = 0.55;

// --- Helper: Cosine Similarity ---
function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates a timeline of a specific section across all constitutions.
 * Uses Hybrid Matching:
 * 1. Try Vector Embeddings (Cosine Similarity) if available -> Solves Semantic Drift
 * 2. Fallback to String Similarity (Heuristic) if no embeddings
 */
export const generateTimeline = async (
    startSectionId: string,
    startConId: string
): Promise<TimelineNode[]> => {

    // 0. Pre-load Embeddings (Fire and forget, await if needed)
    // We try to load them. If they fail or don't exist, we proceed with text search.
    const embeddingsMap = await loadEmbeddings(); // Returns null if not found
    const hasEmbeddings = !!embeddingsMap;

    // 1. Load Start Constitution & Section
    const startData = await fetchConstitutionData(startConId);
    const targetSection = startData.content.sections.find(s => s.id === startSectionId);

    if (!targetSection) {
        console.error(`Section ${startSectionId} not found in ${startConId}`);
        return [];
    }

    const targetContent = targetSection.content;
    const targetCategory = targetSection.category_id || 'uncategorized';

    // Get target vector if available
    let targetVector: number[] | null = null;
    if (hasEmbeddings) {
        targetVector = getEmbedding(startConId, startSectionId);
    }

    // 2. Get list of all constitutions to check
    const allCons = getAllConstitutions();

    // 3. Parallel Fetching
    const allDataPromises = allCons.map(c => fetchConstitutionData(c.id));
    const allDataResults = await Promise.all(allDataPromises);

    const timeline: TimelineNode[] = [];

    // 4. Processing Loop
    allDataResults.forEach((conData, index) => {
        const conMeta = allCons[index];
        const isCurrent = conMeta.id === startConId;

        if (isCurrent) {
            timeline.push({
                year: Number(conMeta.year),
                constitutionId: conMeta.id,
                constitutionName: conMeta.name,
                section: targetSection,
                similarity: 1.0,
                status: 'MATCH',
                isCurrent: true
            });
            return;
        }

        const sections = conData.content.sections;

        let bestMatch: SectionContent | null = null;
        let bestScore = 0;

        // --- STRATEGY SWITCH ---
        if (targetVector && hasEmbeddings) {
            // === PLAN A: VECTOR SEARCH ===
            // Scan all sections using vector dot product.
            for (const sec of sections) {
                const secVector = getEmbedding(conMeta.id, sec.id);
                if (secVector) {
                    const score = cosineSimilarity(targetVector, secVector);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = sec;
                    }
                } else {
                    // Fallback to text if specific section misses vector
                    const textScore = stringSimilarity.compareTwoStrings(targetContent, sec.content);
                    if (textScore > bestScore) {
                        bestScore = textScore;
                        bestMatch = sec;
                    }
                }
            }
        } else {
            // === PLAN B: TEXT HEURISTIC (Legacy Logic) ===

            // A. Filter by Category
            const categoryPool = sections.filter(s => s.category_id === targetCategory);

            // B. Search in Category
            for (const sec of categoryPool) {
                const score = stringSimilarity.compareTwoStrings(targetContent, sec.content);
                if (score > SIMILARITY_THRESHOLD_STRICT) {
                    bestMatch = sec;
                    bestScore = score;
                    break;
                }
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = sec;
                }
            }

            // C. Fallback Global
            if (bestScore < SIMILARITY_THRESHOLD_INTRA_CATEGORY) {
                const otherPool = sections.filter(s => s.category_id !== targetCategory);
                for (const sec of otherPool) {
                    const score = stringSimilarity.compareTwoStrings(targetContent, sec.content);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = sec;
                    }
                    if (score > SIMILARITY_THRESHOLD_STRICT) break;
                }
            }
        }

        // 5. Determine Result
        const threshold = (targetVector && hasEmbeddings) ? 0.76 : 0.45; // Vectors need higher threshold usually

        if (bestMatch && bestScore > threshold) {
            // Determining Status Match/Modified
            // With vectors, even 0.9 might be 'Modified' if text differs.
            // So we check Exact Text Match for "MATCH" status regardless of vector score.
            const isExactText = bestMatch.content === targetContent;

            timeline.push({
                year: Number(conMeta.year),
                constitutionId: conMeta.id,
                constitutionName: conMeta.name,
                section: bestMatch,
                similarity: bestScore,
                status: isExactText ? 'MATCH' : 'MODIFIED',
                isCurrent: false
            });
        }
    });

    // 6. Sort Chronologically (Newest First)
    timeline.sort((a, b) => b.year - a.year);

    return timeline;
};
