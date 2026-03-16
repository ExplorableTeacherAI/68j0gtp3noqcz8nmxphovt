import { type ReactElement } from "react";

// Initialize variables and their colors from this file's variable definitions
import { useVariableStore, initializeVariableColors } from "@/stores";
import { getDefaultValues, variableDefinitions } from "./variables";
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);

// Import all sections
import { section1WhatMakes3DBlocks } from "./sections/Section1WhatMakes3D";
import { section2UnfoldingCubeBlocks } from "./sections/Section2UnfoldingCube";
import { section3WhichNetsWorkBlocks } from "./sections/Section3WhichNetsWork";
import { section4BeyondTheCubeBlocks } from "./sections/Section4BeyondTheCube";

/**
 * ------------------------------------------------------------------
 * LESSON: Nets and 3D Shapes
 * ------------------------------------------------------------------
 *
 * This interactive lesson helps students aged 11-12 develop spatial
 * visualisation skills by exploring the connection between 2D nets
 * and 3D shapes.
 *
 * SECTIONS:
 * 1. What Makes a Shape 3D? - Interactive rotating cube
 * 2. Unfolding a Cube - Animated fold/unfold visualization
 * 3. Which Nets Work? - Trial and error net testing
 * 4. Beyond the Cube - Explore other shapes (pyramid, prisms)
 *
 * ------------------------------------------------------------------
 */

export const blocks: ReactElement[] = [
    ...section1WhatMakes3DBlocks,
    ...section2UnfoldingCubeBlocks,
    ...section3WhichNetsWorkBlocks,
    ...section4BeyondTheCubeBlocks,
];
