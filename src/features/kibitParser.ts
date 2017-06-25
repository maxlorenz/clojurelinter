'use strict';

export interface KibitSuggestion {
    line: number;
    suggestion: string;
}

let lineRegex = /:(\d+):/;

export function parse(input: string): KibitSuggestion[] {
    var suggestions: KibitSuggestion[] = [];
    var suggestionFollows = false;
    var currentSuggestion;

    input.split("\n").forEach(part => {
        if (part.startsWith("At ")) {
            if (currentSuggestion != null) {
                suggestions.push(currentSuggestion);
            }
            
            currentSuggestion = {
                line: Number(lineRegex.exec(part)[1]),
                suggestion: ""
            };
        }
        else if (part.startsWith("Consider")) {
            suggestionFollows = true;
        }
        else if (part.startsWith("instead of")) {
            suggestionFollows = false;
        }
        else if (suggestionFollows) {
            currentSuggestion.suggestion += part;
        }
    });

    return suggestions;
}