import { SectionContent } from "./dataLoader";

export interface DiffRow {
    key: string; // Unique key: categoryId::sectionId
    sectionId: string;
    categoryId: string;
    categoryTitle: string;
    left?: SectionContent;
    right?: SectionContent;
    status: 'MATCH' | 'MODIFIED' | 'ADD' | 'REMOVE';
}

export const alignSections = (leftSections: SectionContent[], rightSections: SectionContent[]): DiffRow[] => {
    // Helper to generate key
    const genKey = (catId: string, secId: string) => `${catId}::${secId}`;

    const mapLeft = new Map<string, SectionContent>();
    leftSections.forEach(s => {
        const catId = s.category_id || 'general';
        mapLeft.set(genKey(catId, s.id), s);
    });

    const mapRight = new Map<string, SectionContent>();
    rightSections.forEach(s => {
        const catId = s.category_id || 'general';
        mapRight.set(genKey(catId, s.id), s);
    });

    // Get all unique Keys
    const allKeys = new Set([...mapLeft.keys(), ...mapRight.keys()]);

    // Sort logic: We want to sort by Category Order first, then Section Number.
    // However, we don't have explicit category order here unless we infer it from the input arrays.
    // Let's create a Category Order Map based on appearance in Left then Right.
    const catOrder = new Map<string, number>();
    let orderCounter = 0;

    [...leftSections, ...rightSections].forEach(s => {
        const catId = s.category_id || 'general';
        if (!catOrder.has(catId)) {
            catOrder.set(catId, orderCounter++);
        }
    });

    const sortedKeys = Array.from(allKeys).sort((a, b) => {
        const [catA, secA] = a.split('::');
        const [catB, secB] = b.split('::');

        // 1. Compare Category Order
        const orderA = catOrder.get(catA) ?? 9999;
        const orderB = catOrder.get(catB) ?? 9999;

        if (orderA !== orderB) {
            return orderA - orderB;
        }

        // 2. Compare Section Number
        const numA = parseFloat(secA);
        const numB = parseFloat(secB);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return secA.localeCompare(secB);
    });

    const rows: DiffRow[] = [];

    sortedKeys.forEach(key => {
        const left = mapLeft.get(key);
        const right = mapRight.get(key);

        // Extract Metadata from whichever side exists
        const item = left || right!;
        const categoryId = item.category_id || 'general';
        // We might want a better way to get the display title if it differs, but for now take the one we have.
        const categoryTitle = item.chapter_name || 'บททั่วไป';
        const sectionId = item.id;

        let status: DiffRow['status'] = 'MATCH';

        if (left && right) {
            if (left.content.trim() !== right.content.trim()) {
                status = 'MODIFIED';
            } else {
                status = 'MATCH';
            }
        } else if (left && !right) {
            status = 'REMOVE';
        } else if (!left && right) {
            status = 'ADD';
        }

        rows.push({
            key,
            sectionId,
            categoryId,
            categoryTitle,
            left,
            right,
            status
        });
    });

    return rows;
};
