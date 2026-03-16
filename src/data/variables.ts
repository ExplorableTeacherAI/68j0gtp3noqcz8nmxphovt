/**
 * Variables Configuration
 * =======================
 *
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 *
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 *
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /** Correct answer for cloze input validation */
    correctAnswer?: string;
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // SECTION 1: What Makes a Shape 3D?
    // ========================================

    // Highlight variable for linking prose to cube parts
    cubeHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Cube Highlight',
        description: 'Active highlight ID for cube parts',
        color: '#62D0AD',
    },

    // ========================================
    // SECTION 2: Unfolding a Cube
    // ========================================

    // Fold progress for the animated cube net
    foldProgress: {
        defaultValue: 0,
        type: 'number',
        label: 'Fold Progress',
        description: 'Controls how much the cube is folded (0 = flat net, 1 = complete cube)',
        min: 0,
        max: 1,
        step: 0.01,
        color: '#8E90F5',
    },

    // ========================================
    // SECTION 3: Which Nets Work?
    // ========================================

    // Selected net pattern to test
    selectedNetPattern: {
        defaultValue: 'cross',
        type: 'select',
        label: 'Net Pattern',
        description: 'The currently selected net pattern to test',
        options: ['cross', 't-shape', 'zigzag', 'line', 'l-shape', 'stairs'],
        color: '#F7B23B',
    },

    // Fold progress for the net testing
    netFoldProgress: {
        defaultValue: 0,
        type: 'number',
        label: 'Net Fold Progress',
        description: 'Controls the fold animation for testing nets',
        min: 0,
        max: 1,
        step: 0.01,
        color: '#AC8BF9',
    },

    // ========================================
    // SECTION 4: Beyond the Cube
    // ========================================

    // Selected 3D shape for exploration
    selectedShape: {
        defaultValue: 'pyramid',
        type: 'select',
        label: 'Selected Shape',
        description: 'The 3D shape to explore',
        options: ['pyramid', 'triangular-prism', 'rectangular-prism'],
        color: '#F8A0CD',
    },

    // Fold progress for the shape exploration
    shapeFoldProgress: {
        defaultValue: 0,
        type: 'number',
        label: 'Shape Fold Progress',
        description: 'Controls the fold animation for the selected shape',
        min: 0,
        max: 1,
        step: 0.01,
        color: '#62CCF9',
    },

    // ========================================
    // ASSESSMENT QUESTIONS
    // ========================================

    // Section 1 questions
    answerCubeFaces: {
        defaultValue: '',
        type: 'text',
        label: 'Cube Faces Answer',
        description: 'Student answer for how many faces a cube has',
        placeholder: '?',
        correctAnswer: '6',
        color: '#62D0AD',
    },

    answerCubeEdges: {
        defaultValue: '',
        type: 'text',
        label: 'Cube Edges Answer',
        description: 'Student answer for how many edges a cube has',
        placeholder: '?',
        correctAnswer: '12',
        color: '#8E90F5',
    },

    answerCubeVertices: {
        defaultValue: '',
        type: 'text',
        label: 'Cube Vertices Answer',
        description: 'Student answer for how many vertices a cube has',
        placeholder: '?',
        correctAnswer: '8',
        color: '#F7B23B',
    },

    // Section 2 questions
    answer2dShapeChoice: {
        defaultValue: '',
        type: 'select',
        label: '2D Shape Choice',
        description: 'Student answer for what 2D shape makes a cube face',
        placeholder: '?',
        correctAnswer: 'square',
        options: ['triangle', 'square', 'rectangle', 'circle'],
        color: '#AC8BF9',
    },

    answerNetSquares: {
        defaultValue: '',
        type: 'text',
        label: 'Net Squares Answer',
        description: 'Student answer for how many squares in a cube net',
        placeholder: '?',
        correctAnswer: '6',
        color: '#F8A0CD',
    },

    // Section 3 questions
    answerWhyLineFails: {
        defaultValue: '',
        type: 'select',
        label: 'Why Line Fails',
        description: 'Student answer for why a line of 6 squares cannot fold into a cube',
        placeholder: '?',
        correctAnswer: 'overlap',
        options: ['too-few-squares', 'overlap', 'gaps', 'wrong-shape'],
        color: '#62CCF9',
    },

    // Section 4 questions
    answerPyramidFaces: {
        defaultValue: '',
        type: 'text',
        label: 'Pyramid Faces Answer',
        description: 'Student answer for how many faces a square pyramid has',
        placeholder: '?',
        correctAnswer: '5',
        color: '#F4A89A',
    },

    answerPrismShape: {
        defaultValue: '',
        type: 'select',
        label: 'Prism Shape Choice',
        description: 'Student answer for what shape the ends of a triangular prism are',
        placeholder: '?',
        correctAnswer: 'triangle',
        options: ['square', 'triangle', 'rectangle', 'pentagon'],
        color: '#A8D5A2',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
