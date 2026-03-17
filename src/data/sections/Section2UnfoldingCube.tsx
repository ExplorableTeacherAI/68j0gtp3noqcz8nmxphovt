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
    InlineTooltip,
} from "@/components/atoms";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import { getVariableInfo, numberPropsFromDefinition, clozePropsFromDefinition, choicePropsFromDefinition } from "../variables";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useVar } from "@/stores";
import { Suspense } from "react";
import * as THREE from "three";

// Colors for cube faces (consistent with Section 1)
const FACE_COLORS = {
    bottom: "#62D0AD",  // teal - base
    front: "#8E90F5",   // indigo
    back: "#F7B23B",    // amber
    left: "#AC8BF9",    // violet
    right: "#F8A0CD",   // rose
    top: "#62CCF9",     // sky
};

// Animated folding cube net component
function FoldingCubeNet({ progress }: { progress: number }) {
    // The cross-shaped net unfolds with the bottom face as the base
    // Progress: 0 = flat net, 1 = complete cube
    // Net layout (cross shape - viewed from above):
    //       [back]
    // [left][bottom][right]
    //       [front]
    //       [top] (attached to front)

    const foldAngle = (Math.PI / 2) * progress;

    // Face dimensions
    const size = 1;
    const half = size / 2;
    const gap = 0.01; // Small gap to prevent z-fighting

    return (
        <group position={[0, progress * half, 0]}>
            {/* Bottom face - stays flat as the base (center of the cross) */}
            <mesh position={[0, gap, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size * 0.98, size * 0.98]} />
                <meshStandardMaterial color={FACE_COLORS.bottom} side={THREE.DoubleSide} />
            </mesh>

            {/* Back face - folds up from back edge of bottom */}
            <group position={[0, 0, -half]} rotation={[-foldAngle, 0, 0]}>
                <mesh position={[0, 0, -half]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={FACE_COLORS.back} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Front face - folds up from front edge of bottom */}
            <group position={[0, 0, half]} rotation={[foldAngle, 0, 0]}>
                <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={FACE_COLORS.front} side={THREE.DoubleSide} />
                </mesh>

                {/* Top face - attached to front face, folds over to become top */}
                <group position={[0, 0, size]} rotation={[foldAngle, 0, 0]}>
                    <mesh position={[0, 0, half]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size * 0.98, size * 0.98]} />
                        <meshStandardMaterial color={FACE_COLORS.top} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            </group>

            {/* Left face - folds up from left edge of bottom (rotates around Z axis) */}
            <group position={[-half, 0, 0]} rotation={[0, 0, foldAngle]}>
                <mesh position={[-half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={FACE_COLORS.left} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Right face - folds up from right edge of bottom (rotates around Z axis) */}
            <group position={[half, 0, 0]} rotation={[0, 0, -foldAngle]}>
                <mesh position={[half, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[size * 0.98, size * 0.98]} />
                    <meshStandardMaterial color={FACE_COLORS.right} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Edges - only visible when fully assembled (progress === 1) */}
            {progress >= 1 && (
                <lineSegments position={[0, half, 0]}>
                    <edgesGeometry args={[new THREE.BoxGeometry(size, size, size)]} />
                    <lineBasicMaterial color="#475569" />
                </lineSegments>
            )}
        </group>
    );
}

// Reactive wrapper for the folding animation
function ReactiveFoldingCube() {
    const progress = useVar("foldProgress", 0) as number;

    return (
        <div className="relative w-full h-[400px] bg-white rounded-xl overflow-hidden border border-slate-200">
            <Canvas>
                <PerspectiveCamera makeDefault position={[3, 2.5, 3]} fov={45} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <directionalLight position={[-3, 3, -3]} intensity={0.3} />
                <Suspense fallback={null}>
                    <FoldingCubeNet progress={progress} />
                </Suspense>
                <OrbitControls
                    enableDamping
                    dampingFactor={0.1}
                    minDistance={3}
                    maxDistance={8}
                />
            </Canvas>
            <InteractionHintSequence
                hintKey="fold-cube-hint"
                steps={[
                    {
                        gesture: "orbit-3d",
                        label: "Drag to view from different angles",
                        position: { x: "50%", y: "40%" },
                    },
                ]}
            />
            {/* Progress indicator */}
            <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Flat Net</span>
                        <span className="font-medium text-slate-800">
                            {progress < 0.1 ? "Unfolded" : progress > 0.9 ? "Complete Cube!" : "Folding..."}
                        </span>
                        <span className="text-slate-600">3D Cube</span>
                    </div>
                    <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-400 to-teal-400 transition-all duration-100"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export const section2UnfoldingCubeBlocks: ReactElement[] = [
    // Section heading
    <StackLayout key="layout-section2-heading" maxWidth="xl">
        <Block id="section2-heading" padding="lg">
            <EditableH2 id="h2-section2-heading" blockId="section2-heading">
                Unfolding a Cube
            </EditableH2>
        </Block>
    </StackLayout>,

    // Introduction to nets
    <StackLayout key="layout-section2-intro" maxWidth="xl">
        <Block id="section2-intro" padding="sm">
            <EditableParagraph id="para-section2-intro" blockId="section2-intro">
                Imagine you could carefully cut along some edges of a cardboard box and lay it completely flat. What you would see is called a{" "}
                <InlineTooltip id="tooltip-net" tooltip="A net is the 2D pattern you get when you unfold a 3D shape. You can fold the net back up to recreate the original shape.">
                    net
                </InlineTooltip>
                . Every 3D shape has at least one net, and understanding nets helps us see how 2D and 3D shapes are connected.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive folding visualization
    <SplitLayout key="layout-section2-fold-visual" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="section2-fold-explanation" padding="sm">
                <EditableParagraph id="para-section2-fold-explanation" blockId="section2-fold-explanation">
                    This is a{" "}
                    <InlineTooltip id="tooltip-cross-net" tooltip="The cross-shaped net is one of 11 different nets that can fold into a cube. It's called a 'cross' because it looks like a plus sign.">
                        cross-shaped net
                    </InlineTooltip>
                    {" "}for a cube. The teal square in the middle becomes the bottom of the cube. The other five squares fold up to become the sides and top.
                </EditableParagraph>
            </Block>
            <Block id="section2-fold-instruction" padding="sm">
                <EditableParagraph id="para-section2-fold-instruction" blockId="section2-fold-instruction">
                    Use the slider below to control the folding animation. Drag it slowly to the right and watch each face rise up from the flat net. Can you predict which square will become the top of the cube before it finishes folding?
                </EditableParagraph>
            </Block>
            <Block id="section2-fold-slider" padding="sm">
                <EditableParagraph id="para-section2-fold-slider" blockId="section2-fold-slider">
                    Fold progress:{" "}
                    <InlineScrubbleNumber
                        varName="foldProgress"
                        {...numberPropsFromDefinition(getVariableInfo('foldProgress'))}
                        formatValue={(v) => `${Math.round(v * 100)}%`}
                    />
                </EditableParagraph>
            </Block>
        </div>
        <Block id="section2-fold-visual" padding="sm" hasVisualization>
            <ReactiveFoldingCube />
        </Block>
    </SplitLayout>,

    // Key insight
    <StackLayout key="layout-section2-insight" maxWidth="xl">
        <Block id="section2-insight" padding="md">
            <EditableParagraph id="para-section2-insight" blockId="section2-insight">
                Here is something interesting: the net is made entirely of 2D shapes, but when you fold it, you get a 3D shape. The magic happens at the edges where the squares connect. These edges become the{" "}
                <InlineTooltip id="tooltip-hinges" tooltip="Like a door hinge, these edges allow the faces to rotate from flat (0°) to upright (90°).">
                    hinges
                </InlineTooltip>
                {" "}that let the faces fold up.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Question: What 2D shape?
    <StackLayout key="layout-section2-question-shape" maxWidth="xl">
        <Block id="section2-question-shape" padding="md">
            <EditableParagraph id="para-section2-question-shape" blockId="section2-question-shape">
                Each face of a cube is a 2D shape. What shape is each face?{" "}
                <InlineFeedback
                    varName="answer2dShapeChoice"
                    correctValue="square"
                    position="terminal"
                    successMessage="Correct! Every face of a cube is a perfect square, all the same size"
                    failureMessage="Not quite"
                    hint="Look at the faces in the visualization. All four sides of each face are equal length"
                    reviewBlockId="section2-fold-visual"
                    reviewLabel="Look at the faces again"
                >
                    <InlineClozeChoice
                        varName="answer2dShapeChoice"
                        correctAnswer="square"
                        options={["triangle", "square", "rectangle", "circle"]}
                        {...choicePropsFromDefinition(getVariableInfo('answer2dShapeChoice'))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Question: How many squares in net?
    <StackLayout key="layout-section2-question-squares" maxWidth="xl">
        <Block id="section2-question-squares" padding="md">
            <EditableParagraph id="para-section2-question-squares" blockId="section2-question-squares">
                A cube has 6 faces. So how many squares must there be in any net that folds into a cube?{" "}
                <InlineFeedback
                    varName="answerNetSquares"
                    correctValue="6"
                    position="terminal"
                    successMessage="That is right! One square for each face, so always 6 squares"
                    failureMessage="Think again"
                    hint="Each square in the net becomes one face of the cube"
                    reviewBlockId="section2-fold-visual"
                    reviewLabel="Count the squares in the net"
                >
                    <InlineClozeInput
                        varName="answerNetSquares"
                        correctAnswer="6"
                        {...clozePropsFromDefinition(getVariableInfo('answerNetSquares'))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
