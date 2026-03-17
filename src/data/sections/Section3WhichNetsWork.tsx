import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineClozeChoice,
    InlineFeedback,
    InlineToggle,
    InlineTooltip,
} from "@/components/atoms";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import { getVariableInfo, numberPropsFromDefinition, choicePropsFromDefinition, togglePropsFromDefinition } from "../variables";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { useVar, useSetVar } from "@/stores";
import { Suspense, useEffect } from "react";
import * as THREE from "three";

// Net patterns - some fold into cubes, some don't
const NET_PATTERNS: Record<string, { squares: [number, number][]; works: boolean; name: string }> = {
    cross: {
        squares: [[0, 0], [0, 1], [0, 2], [0, 3], [-1, 1], [1, 1]],
        works: true,
        name: "Cross",
    },
    "t-shape": {
        squares: [[0, 0], [0, 1], [0, 2], [-1, 0], [1, 0], [0, 3]],
        works: true,
        name: "T-Shape",
    },
    zigzag: {
        squares: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]],
        works: true,
        name: "Zigzag",
    },
    line: {
        squares: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]],
        works: false,
        name: "Straight Line",
    },
    "l-shape": {
        squares: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1]],
        works: true,
        name: "L-Shape",
    },
    stairs: {
        squares: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
        works: true,
        name: "Stairs",
    },
};

const SQUARE_COLORS = [
    "#62D0AD", "#8E90F5", "#F7B23B", "#AC8BF9", "#F8A0CD", "#62CCF9"
];

// 3D folding attempt visualization
function FoldingAttempt({ pattern, progress }: { pattern: string; progress: number }) {
    const netData = NET_PATTERNS[pattern] || NET_PATTERNS.cross;
    const { works: _works } = netData;

    const foldAngle = (Math.PI / 2) * progress;
    const size = 0.9;
    const half = size / 2;
    const gap = 0.01;

    // For the cross pattern (works)
    if (pattern === "cross") {
        return (
            <group position={[0, progress * half, 0]}>
                {/* Base - center of the cross */}
                <mesh position={[0, gap, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={SQUARE_COLORS[0]} side={THREE.DoubleSide} />
                </mesh>

                {/* Front - folds up from front edge */}
                <group position={[0, 0, half]} rotation={[foldAngle, 0, 0]}>
                    <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[1]} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Top - attached to front, folds over */}
                    <group position={[0, 0, size]} rotation={[foldAngle, 0, 0]}>
                        <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[size * 0.98, size * 0.98]} />
                            <meshStandardMaterial color={SQUARE_COLORS[2]} side={THREE.DoubleSide} />
                        </mesh>
                    </group>
                </group>

                {/* Back - folds up from back edge */}
                <group position={[0, 0, -half]} rotation={[-foldAngle, 0, 0]}>
                    <mesh position={[0, 0, -half]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[3]} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* Left - folds up from left edge */}
                <group position={[-half, 0, 0]} rotation={[0, 0, foldAngle]}>
                    <mesh position={[-half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[4]} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* Right - folds up from right edge */}
                <group position={[half, 0, 0]} rotation={[0, 0, -foldAngle]}>
                    <mesh position={[half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[5]} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            </group>
        );
    }

    // For the line pattern (doesn't work)
    if (pattern === "line") {
        return (
            <group position={[0, progress * half, 0]}>
                {/* Base - center square */}
                <mesh position={[0, gap, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={SQUARE_COLORS[2]} side={THREE.DoubleSide} />
                </mesh>

                {/* Squares folding up in a line - they will collide */}
                <group position={[0, 0, half]} rotation={[foldAngle, 0, 0]}>
                    <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[3]} side={THREE.DoubleSide} />
                    </mesh>
                    <group position={[0, 0, size]} rotation={[foldAngle, 0, 0]}>
                        <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[size * 0.98, size * 0.98]} />
                            <meshStandardMaterial color={SQUARE_COLORS[4]} side={THREE.DoubleSide} />
                        </mesh>
                        <group position={[0, 0, size]} rotation={[foldAngle, 0, 0]}>
                            <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                                <planeGeometry args={[size * 0.98, size * 0.98]} />
                                <meshStandardMaterial color={progress > 0.6 ? "#ef4444" : SQUARE_COLORS[5]} side={THREE.DoubleSide} opacity={progress > 0.6 ? 0.7 : 1} transparent />
                            </mesh>
                        </group>
                    </group>
                </group>

                <group position={[0, 0, -half]} rotation={[-foldAngle, 0, 0]}>
                    <mesh position={[0, 0, -half]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[1]} side={THREE.DoubleSide} />
                    </mesh>
                    <group position={[0, 0, -size]} rotation={[-foldAngle, 0, 0]}>
                        <mesh position={[0, 0, -half]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[size * 0.98, size * 0.98]} />
                            <meshStandardMaterial color={progress > 0.6 ? "#ef4444" : SQUARE_COLORS[0]} side={THREE.DoubleSide} opacity={progress > 0.6 ? 0.7 : 1} transparent />
                        </mesh>
                    </group>
                </group>

                {/* Warning text when folding fails */}
                {progress > 0.5 && (
                    <Text
                        position={[0, 2, 0]}
                        fontSize={0.2}
                        color="#ef4444"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Squares overlap!
                    </Text>
                )}
            </group>
        );
    }

    // For t-shape (works)
    if (pattern === "t-shape") {
        return (
            <group position={[0, progress * half, 0]}>
                {/* Base */}
                <mesh position={[0, gap, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={SQUARE_COLORS[0]} side={THREE.DoubleSide} />
                </mesh>

                {/* Front - double fold */}
                <group position={[0, 0, half]} rotation={[foldAngle, 0, 0]}>
                    <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[1]} side={THREE.DoubleSide} />
                    </mesh>
                    <group position={[0, 0, size]} rotation={[foldAngle, 0, 0]}>
                        <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[size * 0.98, size * 0.98]} />
                            <meshStandardMaterial color={SQUARE_COLORS[5]} side={THREE.DoubleSide} />
                        </mesh>
                    </group>
                </group>

                {/* Back */}
                <group position={[0, 0, -half]} rotation={[-foldAngle, 0, 0]}>
                    <mesh position={[0, 0, -half]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[2]} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* Left */}
                <group position={[-half, 0, 0]} rotation={[0, 0, foldAngle]}>
                    <mesh position={[-half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[3]} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* Right */}
                <group position={[half, 0, 0]} rotation={[0, 0, -foldAngle]}>
                    <mesh position={[half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[4]} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            </group>
        );
    }

    // Default: show simple cross for other patterns (zigzag, l-shape, stairs)
    return (
        <group position={[0, progress * half, 0]}>
            <mesh position={[0, gap, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size * 0.98, size * 0.98]} />
                <meshStandardMaterial color={SQUARE_COLORS[0]} side={THREE.DoubleSide} />
            </mesh>
            <group position={[0, 0, half]} rotation={[foldAngle, 0, 0]}>
                <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={SQUARE_COLORS[1]} side={THREE.DoubleSide} />
                </mesh>
                <group position={[0, 0, size]} rotation={[foldAngle, 0, 0]}>
                    <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={SQUARE_COLORS[2]} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            </group>
            <group position={[0, 0, -half]} rotation={[-foldAngle, 0, 0]}>
                <mesh position={[0, 0, -half]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={SQUARE_COLORS[3]} side={THREE.DoubleSide} />
                </mesh>
            </group>
            <group position={[-half, 0, 0]} rotation={[0, 0, foldAngle]}>
                <mesh position={[-half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={SQUARE_COLORS[4]} side={THREE.DoubleSide} />
                </mesh>
            </group>
            <group position={[half, 0, 0]} rotation={[0, 0, -foldAngle]}>
                <mesh position={[half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={SQUARE_COLORS[5]} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
}

// Reactive wrapper for net testing
function ReactiveNetTester() {
    const pattern = useVar("selectedNetPattern", "cross") as string;
    const progress = useVar("netFoldProgress", 0) as number;
    const setVar = useSetVar();
    const netData = NET_PATTERNS[pattern] || NET_PATTERNS.cross;

    // Reset progress when pattern changes
    useEffect(() => {
        setVar("netFoldProgress", 0);
    }, [pattern, setVar]);

    return (
        <div className="relative w-full h-[400px] bg-white rounded-xl overflow-hidden border border-slate-200">
            <Canvas>
                <PerspectiveCamera makeDefault position={[3, 3, 3]} fov={45} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <directionalLight position={[-3, 3, -3]} intensity={0.3} />
                <Suspense fallback={null}>
                    <FoldingAttempt pattern={pattern} progress={progress} />
                </Suspense>
                <OrbitControls
                    enableDamping
                    dampingFactor={0.1}
                    minDistance={3}
                    maxDistance={8}
                />
            </Canvas>
            <InteractionHintSequence
                hintKey="net-test-hint"
                steps={[
                    {
                        gesture: "orbit-3d",
                        label: "Drag to rotate the view",
                        position: { x: "50%", y: "40%" },
                    },
                ]}
            />
            {/* Result indicator */}
            <div className="absolute top-4 left-4 right-4">
                <div className={`px-4 py-2 rounded-lg text-center font-medium ${
                    progress > 0.8
                        ? netData.works
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-600"
                }`}>
                    {progress > 0.8
                        ? netData.works
                            ? "This net folds into a perfect cube!"
                            : "This pattern cannot form a cube"
                        : `Testing: ${netData.name}`
                    }
                </div>
            </div>
        </div>
    );
}

// Pattern info display
function PatternInfo() {
    const pattern = useVar("selectedNetPattern", "cross") as string;
    const netData = NET_PATTERNS[pattern] || NET_PATTERNS.cross;

    return (
        <span className={netData.works ? "text-green-600" : "text-red-600"}>
            {netData.works ? "valid net" : "invalid net"}
        </span>
    );
}

export const section3WhichNetsWorkBlocks: ReactElement[] = [
    // Section heading
    <StackLayout key="layout-section3-heading" maxWidth="xl">
        <Block id="section3-heading" padding="lg">
            <EditableH2 id="h2-section3-heading" blockId="section3-heading">
                Which Nets Work?
            </EditableH2>
        </Block>
    </StackLayout>,

    // Introduction
    <StackLayout key="layout-section3-intro" maxWidth="xl">
        <Block id="section3-intro" padding="sm">
            <EditableParagraph id="para-section3-intro" blockId="section3-intro">
                Not every arrangement of six squares can fold into a cube. Some patterns have squares that would overlap, and others would leave gaps. In fact, out of all the ways you could arrange six squares touching edge-to-edge, only 11 of them actually work as cube nets!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive net tester
    <SplitLayout key="layout-section3-net-tester" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="section3-pattern-selector" padding="sm">
                <EditableParagraph id="para-section3-pattern-selector" blockId="section3-pattern-selector">
                    Select a pattern to test:{" "}
                    <InlineToggle
                        id="toggle-net-pattern"
                        varName="selectedNetPattern"
                        options={["cross", "t-shape", "zigzag", "line", "l-shape", "stairs"]}
                        {...togglePropsFromDefinition(getVariableInfo('selectedNetPattern'))}
                    />
                    {" "}(<PatternInfo />)
                </EditableParagraph>
            </Block>
            <Block id="section3-fold-control" padding="sm">
                <EditableParagraph id="para-section3-fold-control" blockId="section3-fold-control">
                    Now try to fold it:{" "}
                    <InlineScrubbleNumber
                        varName="netFoldProgress"
                        {...numberPropsFromDefinition(getVariableInfo('netFoldProgress'))}
                        formatValue={(v) => `${Math.round(v * 100)}%`}
                    />
                </EditableParagraph>
            </Block>
            <Block id="section3-test-instruction" padding="sm">
                <EditableParagraph id="para-section3-test-instruction" blockId="section3-test-instruction">
                    Try testing different patterns. When you select "line" and try to fold it, watch what happens. The squares at each end try to become the same face, and they crash into each other! This is why a straight line of six squares cannot become a cube.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="section3-net-visual" padding="sm" hasVisualization>
            <ReactiveNetTester />
        </Block>
    </SplitLayout>,

    // Explanation of why some fail
    <StackLayout key="layout-section3-explanation" maxWidth="xl">
        <Block id="section3-explanation" padding="md">
            <EditableParagraph id="para-section3-explanation" blockId="section3-explanation">
                For a net to work, every edge that will become a fold must connect exactly two squares. And when folded, each face must end up in a unique position. The "line" pattern fails because when you fold it, two squares try to occupy the same spot. They{" "}
                <InlineTooltip id="tooltip-overlap" tooltip="When two faces try to be in the same place at the same time, they overlap. A real piece of cardboard cannot do this!">
                    overlap
                </InlineTooltip>
                , which is impossible with real cardboard.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Question: Why does line fail?
    <StackLayout key="layout-section3-question-line" maxWidth="xl">
        <Block id="section3-question-line" padding="md">
            <EditableParagraph id="para-section3-question-line" blockId="section3-question-line">
                Why can a straight line of 6 squares not fold into a cube? Because the faces would{" "}
                <InlineFeedback
                    varName="answerWhyLineFails"
                    correctValue="overlap"
                    position="terminal"
                    successMessage="Exactly! The two end squares try to become the same face, causing them to overlap"
                    failureMessage="Not quite"
                    hint="Try folding the 'line' pattern and watch what happens to the end squares"
                    reviewBlockId="section3-net-visual"
                    reviewLabel="Test the line pattern"
                >
                    <InlineClozeChoice
                        varName="answerWhyLineFails"
                        correctAnswer="overlap"
                        options={["too-few-squares", "overlap", "gaps", "wrong-shape"]}
                        {...choicePropsFromDefinition(getVariableInfo('answerWhyLineFails'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
