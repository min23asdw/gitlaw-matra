import React from 'react';

/**
 * Formats Thai legal text by handling line breaks and special indentation for lists.
 * Replaces placeholders for B.E. (พ.ศ.) and Act (พ.ร.บ.) to prevent incorrect splitting.
 */
export const formatText = (text: string) => {
    if (!text) return null;
    const SAFE_BE = "___BE___";
    const SAFE_ACT = "___ACT___";
    const safeText = text.replace(/พ\.ศ\./g, SAFE_BE).replace(/พ\.ร\.บ\./g, SAFE_ACT);

    // Split by list markers: (1), (2) or Korgor. (ก.), Khor. (ข.) or multiple spaces/newlines
    const parts = safeText.split(/(\(\d+\)|[ก-ฮ]\.| {2,}|(?:\r\n|\r|\n))/g);

    return parts.map((part, index) => {
        const displayPart = part.replace(new RegExp(SAFE_BE, 'g'), "พ.ศ.").replace(new RegExp(SAFE_ACT, 'g'), "พ.ร.บ.");

        // Handle explicit line breaks
        if (/^[\r\n]+$/.test(part)) return <br key={index} className="mb-2" />;
        if (/^ {2,}$/.test(part)) return <br key={index} className="mb-2" />;

        const isListHeader = /^\(\d+\)$/.test(part) || /^[ก-ฮ]\.$/.test(part);
        if (isListHeader) {
            // SPECIAL CHECK: If we have Number -> Number (e.g. (15) -> (2)), force break if sequence resets (2 <= 15)
            let sequenceReset = false;

            const prevPart = index > 0 ? parts[index - 1] : "";
            const isShort = prevPart.trim().length < 30;

            // Check if current is (N) and previous header was (M)
            // We need to look back at parts[index-2] which should be the previous header if index-1 was short content
            if (index > 1 && /^\(\d+\)$/.test(part)) {
                const prevHeader = parts[index - 2];
                if (/^\(\d+\)$/.test(prevHeader)) {
                    const currNum = parseInt(part.replace(/\D/g, ''), 10);
                    const prevNum = parseInt(prevHeader.replace(/\D/g, ''), 10);

                    // If current number is less than or equal to previous, assume it's a new list/dedent -> Force break
                    if (currNum <= prevNum) {
                        sequenceReset = true;
                    }
                }
            }

            // Logic: Break before a list item unless it's the start, or previous part was a break, 
            // or previous part was very short (title-like).
            const isNewline = /^[\r\n]+$/.test(prevPart);
            const isDoubleSpace = /^ {2,}$/.test(prevPart);

            const shouldBreak = index > 0 &&
                !isNewline &&
                !isDoubleSpace &&
                (!isShort || sequenceReset);

            return (
                <React.Fragment key={index}>
                    {shouldBreak && <br className="block mb-2" />}
                    <span className="font-bold text-slate-900 inline-block mr-1">{displayPart}</span>
                </React.Fragment>
            );
        }
        return <span key={index}>{displayPart}</span>;
    });
};
