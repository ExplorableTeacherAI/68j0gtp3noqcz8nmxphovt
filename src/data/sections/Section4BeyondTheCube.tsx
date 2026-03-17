import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineClozeInput,
    InlineClozeChoice,
    InlineFeedback,
    InlineToggle,
    InlineTooltip,
} from "@/components/atoms";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import { getVariableInfo, numberPropsFromDefinition, clozePropsFromDefinition, choicePropsFromDefinition, togglePropsFromDefinition } from "../variables";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useVar, useSetVar } from "@/stores";
import { Suspense, useEffect } from "react";
import * as THREE from "three";

// Colors for shape faces
const SHAPE_COLORS = {
    base: "#62D0AD",      // teal
    side1: "#8E90F5",     // indigo
    side2: "#F7B23B",     // amber
    side3: "#AC8BF9",     // violet
    side4: "#F8A0CD",     // rose
    end1: "#62CCF9",      // sky
    end2: "#F4A89A",      // coral
};

// Triangle mesh component - creates a triangle lying flat, base at z=0
function TriangleFace({ width, height, color }: { width: number; height: number; color: string }) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(0, height);
    shape.closePath();

    return (
        <mesh>
            <shapeGeometry args={[shape]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
    );
}

// Square Pyramid folding
function FoldingPyramid({ progress }: { progress: number }) {
    // For a square pyramid, faces fold to about 54.7 degrees
    const targetAngle = Math.atan(Math.sqrt(2));
    const foldAngle = targetAngle * progress;
    const size = 1;
    const half = size / 2;
    const gap = 0.01;
    const triHeight = size * 0.866; // Triangle height

    return (
        <group position={[0, progress * 0.4, 0]}>
            {/* Base - square */}
            <mesh position={[0, gap, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size * 0.98, size * 0.98]} />
                <meshStandardMaterial color={SHAPE_COLORS.base} side={THREE.DoubleSide} />
            </mesh>

            {/* Front triangle - pivots from front edge, starts flat on ground */}
            <group position={[0, 0, half]} rotation={[foldAngle, 0, 0]}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    <TriangleFace width={size * 0.98} height={triHeight} color={SHAPE_COLORS.side1} />
                </group>
            </group>

            {/* Back triangle - pivots from back edge */}
            <group position={[0, 0, -half]} rotation={[-foldAngle, 0, 0]}>
                <group rotation={[Math.PI / 2, 0, Math.PI]}>
                    <TriangleFace width={size * 0.98} height={triHeight} color={SHAPE_COLORS.side2} />
                </group>
            </group>

            {/* Left triangle - pivots from left edge */}
            <group position={[-half, 0, 0]} rotation={[0, 0, foldAngle]}>
                <group rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
                    <TriangleFace width={size * 0.98} height={triHeight} color={SHAPE_COLORS.side3} />
                </group>
            </group>

            {/* Right triangle - pivots from right edge */}
            <group position={[half, 0, 0]} rotation={[0, 0, -foldAngle]}>
                <group rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                    <TriangleFace width={size * 0.98} height={triHeight} color={SHAPE_COLORS.side4} />
                </group>
            </group>
        </group>
    );
}

// Triangular Prism folding
function FoldingTriangularPrism({ progress }: { progress: number }) {
    // For a triangular prism, sides fold to 60 degrees for equilateral triangle
    const foldAngle = (Math.PI / 3) * progress; // 60 degrees
    const endFoldAngle = (Math.PI / 2) * progress;
    const size = 1;
    const half = size / 2;
    const gap = 0.01;
    const length = size * 1.5;
    const halfLen = length / 2;
    const triHeight = size * 0.866;

    return (
        <group position={[0, progress * 0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
            {/* Bottom rectangle */}
            <mesh position={[0, gap, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size * 0.98, length * 0.98]} />
                <meshStandardMaterial color={SHAPE_COLORS.base} side={THREE.DoubleSide} />
            </mesh>

            {/* Left rectangle - folds up from left edge */}
            <group position={[-half, 0, 0]} rotation={[0, 0, foldAngle]}>
                <mesh position={[-half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, length * 0.98]} />
                    <meshStandardMaterial color={SHAPE_COLORS.side1} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Right rectangle - folds up from right edge */}
            <group position={[half, 0, 0]} rotation={[0, 0, -foldAngle]}>
                <mesh position={[half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, length * 0.98]} />
                    <meshStandardMaterial color={SHAPE_COLORS.side2} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Front triangle end - pivots from front edge */}
            <group position={[0, 0, halfLen]} rotation={[endFoldAngle, 0, 0]}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    <TriangleFace width={size * 0.98} height={triHeight} color={SHAPE_COLORS.end1} />
                </group>
            </group>

            {/* Back triangle end - pivots from back edge */}
            <group position={[0, 0, -halfLen]} rotation={[-endFoldAngle, 0, 0]}>
                <group rotation={[Math.PI / 2, 0, Math.PI]}>
                    <TriangleFace width={size * 0.98} height={triHeight} color={SHAPE_COLORS.end2} />
                </group>
            </group>
        </group>
    );
}

// Rectangular Prism (cuboid) folding
function FoldingRectangularPrism({ progress }: { progress: number }) {
    const foldAngle = (Math.PI / 2) * progress;
    const width = 1;
    const height = 0.6;
    const depth = 1.4;
    const gap = 0.01;

    return (
        <group position={[0, progress * height / 2, 0]}>
            {/* Bottom */}
            <mesh position={[0, gap, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[width * 0.98, depth * 0.98]} />
                <meshStandardMaterial color={SHAPE_COLORS.base} side={THREE.DoubleSide} />
            </mesh>

            {/* Front - pivots from front edge */}
            <group position={[0, 0, depth / 2]} rotation={[foldAngle, 0, 0]}>
                <mesh position={[0, 0, height / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[width * 0.98, height * 0.98]} />
                    <meshStandardMaterial color={SHAPE_COLORS.side1} side={THREE.DoubleSide} />
                </mesh>
                {/* Top - attached to front, folds over */}
                <group position={[0, 0, height]} rotation={[foldAngle, 0, 0]}>
                    <mesh position={[0, 0, depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[width * 0.98, depth * 0.98]} />
                        <meshStandardMaterial color={SHAPE_COLORS.side3} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            </group>

            {/* Back - pivots from back edge */}
            <group position={[0, 0, -depth / 2]} rotation={[-foldAngle, 0, 0]}>
                <mesh position={[0, 0, -height / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[width * 0.98, height * 0.98]} />
                    <meshStandardMaterial color={SHAPE_COLORS.side2} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Left - pivots from left edge */}
            <group position={[-width / 2, 0, 0]} rotation={[0, 0, foldAngle]}>
                <mesh position={[-height / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[height * 0.98, depth * 0.98]} />
                    <meshStandardMaterial color={SHAPE_COLORS.end1} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Right - pivots from right edge */}
            <group position={[width / 2, 0, 0]} rotation={[0, 0, -foldAngle]}>
                <mesh position={[height / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[height * 0.98, depth * 0.98]} />
                    <meshStandardMaterial color={SHAPE_COLORS.end2} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
}

// Shape info data
const SHAPE_INFO: Record<string, { name: string; faces: number; description: string }> = {
    pyramid: {
        name: "Square Pyramid",
        faces: 5,
        description: "1 square base + 4 triangular sides",
    },
    "triangular-prism": {
        name: "Triangular Prism",
        faces: 5,
        description: "2 triangular ends + 3 rectangular sides",
    },
    "rectangular-prism": {
        name: "Rectangular Prism",
        faces: 6,
        description: "Like a stretched cube (a box)",
    },
};

// Reactive wrapper for shape selector
function ReactiveShapeFolder() {
    const shape = useVar("selectedShape", "pyramid") as string;
    const progress = useVar("shapeFoldProgress", 0) as number;
    const setVar = useSetVar();
    const shapeInfo = SHAPE_INFO[shape] || SHAPE_INFO.pyramid;

    // Reset progress when shape changes
    useEffect(() => {
        setVar("shapeFoldProgress", 0);
    }, [shape, setVar]);

    return (
        <div className="relative w-full h-[400px] bg-white rounded-xl overflow-hidden border border-slate-200">
            <Canvas>
                <PerspectiveCamera makeDefault position={[3, 2.5, 3]} fov={45} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <directionalLight position={[-3, 3, -3]} intensity={0.3} />
                <Suspense fallback={null}>
                    {shape === "pyramid" && <FoldingPyramid progress={progress} />}
                    {shape === "triangular-prism" && <FoldingTriangularPrism progress={progress} />}
                    {shape === "rectangular-prism" && <FoldingRectangularPrism progress={progress} />}
                </Suspense>
                <OrbitControls
                    enableDamping
                    dampingFactor={0.1}
                    minDistance={3}
                    maxDistance={8}
                />
            </Canvas>
            <InteractionHintSequence
                hintKey="shape-folder-hint"
                steps={[
                    {
                        gesture: "orbit-3d",
                        label: "Drag to rotate the view",
                        position: { x: "50%", y: "40%" },
                    },
                ]}
            />
            {/* Shape info */}
            <div className="absolute top-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
                    <div className="font-medium text-slate-800">{shapeInfo.name}</div>
                    <div className="text-sm text-slate-600">{shapeInfo.description}</div>
                </div>
            </div>
            {/* Faces counter */}
            <div className="absolute bottom-4 right-4">
                <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {shapeInfo.faces} faces
                </div>
            </div>
        </div>
    );
}

// Shape name display
function ShapeNameDisplay() {
    const shape = useVar("selectedShape", "pyramid") as string;
    const shapeInfo = SHAPE_INFO[shape] || SHAPE_INFO.pyramid;
    return <span>{shapeInfo.name}</span>;
}

export const section4BeyondTheCubeBlocks: ReactElement[] = [
    // Section heading
    <StackLayout key="layout-section4-heading" maxWidth="xl">
        <Block id="section4-heading" padding="lg">
            <EditableH2 id="h2-section4-heading" blockId="section4-heading">
                Beyond the Cube
            </EditableH2>
        </Block>
    </StackLayout>,

    // Introduction
    <StackLayout key="layout-section4-intro" maxWidth="xl">
        <Block id="section4-intro" padding="sm">
            <EditableParagraph id="para-section4-intro" blockId="section4-intro">
                Cubes are not the only 3D shapes with nets! Every 3D shape made of flat faces can be unfolded into a net. The shape of each face in the net depends on the 3D shape you are making. A pyramid uses triangles, while a prism uses a mix of shapes.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive shape selector
    <SplitLayout key="layout-section4-shape-selector" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="section4-shape-selector" padding="sm">
                <EditableParagraph id="para-section4-shape-selector" blockId="section4-shape-selector">
                    Choose a shape to explore:{" "}
                    <InlineToggle
                        id="toggle-shape"
                        varName="selectedShape"
                        options={["pyramid", "triangular-prism", "rectangular-prism"]}
                        {...togglePropsFromDefinition(getVariableInfo('selectedShape'))}
                    />
                </EditableParagraph>
            </Block>
            <Block id="section4-fold-control" padding="sm">
                <EditableParagraph id="para-section4-fold-control" blockId="section4-fold-control">
                    Fold the net:{" "}
                    <InlineScrubbleNumber
                        varName="shapeFoldProgress"
                        {...numberPropsFromDefinition(getVariableInfo('shapeFoldProgress'))}
                        formatValue={(v) => `${Math.round(v * 100)}%`}
                    />
                </EditableParagraph>
            </Block>
            <Block id="section4-shape-explanation" padding="sm">
                <EditableParagraph id="para-section4-shape-explanation" blockId="section4-shape-explanation">
                    Notice how each shape needs different types of faces. A{" "}
                    <InlineTooltip id="tooltip-pyramid" tooltip="A pyramid has a flat base and triangular faces that meet at a single point called the apex.">
                        pyramid
                    </InlineTooltip>
                    {" "}has triangular sides meeting at a point. A{" "}
                    <InlineTooltip id="tooltip-prism" tooltip="A prism has two identical ends connected by rectangular faces. The ends give the prism its name (triangular prism, hexagonal prism, etc.).">
                        prism
                    </InlineTooltip>
                    {" "}has matching ends connected by rectangles.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="section4-shape-visual" padding="sm" hasVisualization>
            <ReactiveShapeFolder />
        </Block>
    </SplitLayout>,

    // Question: Pyramid faces
    <StackLayout key="layout-section4-question-pyramid" maxWidth="xl">
        <Block id="section4-question-pyramid" padding="md">
            <EditableParagraph id="para-section4-question-pyramid" blockId="section4-question-pyramid">
                A square pyramid has 1 square base and 4 triangular sides. How many faces does it have in total?{" "}
                <InlineFeedback
                    varName="answerPyramidFaces"
                    correctValue="5"
                    position="terminal"
                    successMessage="Correct! 1 square + 4 triangles = 5 faces"
                    failureMessage="Not quite"
                    hint="Count the base plus all the triangular sides"
                    reviewBlockId="section4-shape-visual"
                    reviewLabel="Explore the pyramid"
                >
                    <InlineClozeInput
                        varName="answerPyramidFaces"
                        correctAnswer="5"
                        {...clozePropsFromDefinition(getVariableInfo('answerPyramidFaces'))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Question: Prism ends
    <StackLayout key="layout-section4-question-prism" maxWidth="xl">
        <Block id="section4-question-prism" padding="md">
            <EditableParagraph id="para-section4-question-prism" blockId="section4-question-prism">
                The two end faces of a triangular prism are what shape?{" "}
                <InlineFeedback
                    varName="answerPrismShape"
                    correctValue="triangle"
                    position="terminal"
                    successMessage="That is right! The ends are triangles, which is why it is called a triangular prism"
                    failureMessage="Not quite"
                    hint="The shape of the ends gives the prism its name"
                    reviewBlockId="section4-shape-visual"
                    reviewLabel="Look at the triangular prism"
                >
                    <InlineClozeChoice
                        varName="answerPrismShape"
                        correctAnswer="triangle"
                        options={["square", "triangle", "rectangle", "pentagon"]}
                        {...choicePropsFromDefinition(getVariableInfo('answerPrismShape'))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Summary
    <StackLayout key="layout-section4-summary" maxWidth="xl">
        <Block id="section4-summary" padding="lg">
            <EditableParagraph id="para-section4-summary" blockId="section4-summary">
                You have now explored how 3D shapes connect to their flat nets. Every 3D shape made of flat faces can be unfolded and refolded. Understanding this connection helps you visualise 3D shapes even when you can only see a 2D drawing. Next time you see a cardboard box, try to imagine what its net would look like!
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
