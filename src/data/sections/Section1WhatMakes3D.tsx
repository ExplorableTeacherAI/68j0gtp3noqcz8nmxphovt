import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineTooltip,
} from "@/components/atoms";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import { getVariableInfo, clozePropsFromDefinition } from "../variables";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useVar, useSetVar } from "@/stores";
import { Suspense, useState } from "react";
import * as THREE from "three";

// Colors for cube faces
const FACE_COLORS = {
    front: "#62D0AD",   // teal
    back: "#8E90F5",    // indigo
    top: "#F7B23B",     // amber
    bottom: "#AC8BF9",  // violet
    left: "#F8A0CD",    // rose
    right: "#62CCF9",   // sky
};

// Interactive 3D Cube component
function InteractiveCube() {
    const highlightId = useVar("cubeHighlight", "") as string;
    const setVar = useSetVar();
    const [hoveredFace, setHoveredFace] = useState<string | null>(null);

    // Face data with positions and rotations
    const faces = [
        { id: "face-front", pos: [0, 0, 1] as [number, number, number], rot: [0, 0, 0], color: FACE_COLORS.front, label: "Front" },
        { id: "face-back", pos: [0, 0, -1] as [number, number, number], rot: [0, Math.PI, 0], color: FACE_COLORS.back, label: "Back" },
        { id: "face-top", pos: [0, 1, 0] as [number, number, number], rot: [-Math.PI / 2, 0, 0], color: FACE_COLORS.top, label: "Top" },
        { id: "face-bottom", pos: [0, -1, 0] as [number, number, number], rot: [Math.PI / 2, 0, 0], color: FACE_COLORS.bottom, label: "Bottom" },
        { id: "face-left", pos: [-1, 0, 0] as [number, number, number], rot: [0, -Math.PI / 2, 0], color: FACE_COLORS.left, label: "Left" },
        { id: "face-right", pos: [1, 0, 0] as [number, number, number], rot: [0, Math.PI / 2, 0], color: FACE_COLORS.right, label: "Right" },
    ];

    // Edge positions (12 edges)
    const edges: Array<{ start: [number, number, number]; end: [number, number, number]; id: string }> = [
        // Top face edges
        { start: [-1, 1, -1], end: [1, 1, -1], id: "edge-1" },
        { start: [1, 1, -1], end: [1, 1, 1], id: "edge-2" },
        { start: [1, 1, 1], end: [-1, 1, 1], id: "edge-3" },
        { start: [-1, 1, 1], end: [-1, 1, -1], id: "edge-4" },
        // Bottom face edges
        { start: [-1, -1, -1], end: [1, -1, -1], id: "edge-5" },
        { start: [1, -1, -1], end: [1, -1, 1], id: "edge-6" },
        { start: [1, -1, 1], end: [-1, -1, 1], id: "edge-7" },
        { start: [-1, -1, 1], end: [-1, -1, -1], id: "edge-8" },
        // Vertical edges
        { start: [-1, -1, -1], end: [-1, 1, -1], id: "edge-9" },
        { start: [1, -1, -1], end: [1, 1, -1], id: "edge-10" },
        { start: [1, -1, 1], end: [1, 1, 1], id: "edge-11" },
        { start: [-1, -1, 1], end: [-1, 1, 1], id: "edge-12" },
    ];

    // Vertex positions (8 vertices)
    const vertices: Array<{ pos: [number, number, number]; id: string }> = [
        { pos: [-1, -1, -1], id: "vertex-1" },
        { pos: [1, -1, -1], id: "vertex-2" },
        { pos: [1, -1, 1], id: "vertex-3" },
        { pos: [-1, -1, 1], id: "vertex-4" },
        { pos: [-1, 1, -1], id: "vertex-5" },
        { pos: [1, 1, -1], id: "vertex-6" },
        { pos: [1, 1, 1], id: "vertex-7" },
        { pos: [-1, 1, 1], id: "vertex-8" },
    ];

    const isHighlightingFaces = highlightId === "faces";
    const isHighlightingEdges = highlightId === "edges";
    const isHighlightingVertices = highlightId === "vertices";

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-3, 3, -3]} intensity={0.3} />

            {/* Cube faces */}
            <group>
                {faces.map((face) => {
                    const isHovered = hoveredFace === face.id;
                    const shouldHighlight = isHighlightingFaces || isHovered;
                    const opacity = isHighlightingFaces ? 0.9 : (isHighlightingEdges || isHighlightingVertices ? 0.3 : 0.85);

                    return (
                        <mesh
                            key={face.id}
                            position={face.pos}
                            rotation={face.rot as [number, number, number]}
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                setHoveredFace(face.id);
                                setVar("cubeHighlight", "faces");
                            }}
                            onPointerOut={() => {
                                setHoveredFace(null);
                                setVar("cubeHighlight", "");
                            }}
                        >
                            <planeGeometry args={[1.98, 1.98]} />
                            <meshStandardMaterial
                                color={face.color}
                                transparent
                                opacity={opacity}
                                side={THREE.DoubleSide}
                                emissive={shouldHighlight ? face.color : "#000000"}
                                emissiveIntensity={shouldHighlight ? 0.3 : 0}
                            />
                        </mesh>
                    );
                })}
            </group>

            {/* Cube edges */}
            {edges.map((edge) => {
                const direction = new THREE.Vector3(
                    edge.end[0] - edge.start[0],
                    edge.end[1] - edge.start[1],
                    edge.end[2] - edge.start[2]
                );
                const length = direction.length();
                const midpoint = new THREE.Vector3(
                    (edge.start[0] + edge.end[0]) / 2,
                    (edge.start[1] + edge.end[1]) / 2,
                    (edge.start[2] + edge.end[2]) / 2
                );

                const quaternion = new THREE.Quaternion();
                quaternion.setFromUnitVectors(
                    new THREE.Vector3(0, 1, 0),
                    direction.clone().normalize()
                );

                const shouldHighlight = isHighlightingEdges;
                const edgeColor = shouldHighlight ? "#8E90F5" : "#475569";
                const edgeOpacity = isHighlightingFaces ? 0.3 : 1;

                return (
                    <mesh
                        key={edge.id}
                        position={midpoint}
                        quaternion={quaternion}
                        onPointerOver={(e) => {
                            e.stopPropagation();
                            setVar("cubeHighlight", "edges");
                        }}
                        onPointerOut={() => setVar("cubeHighlight", "")}
                    >
                        <cylinderGeometry args={[0.03, 0.03, length, 8]} />
                        <meshStandardMaterial
                            color={edgeColor}
                            transparent
                            opacity={edgeOpacity}
                            emissive={shouldHighlight ? "#8E90F5" : "#000000"}
                            emissiveIntensity={shouldHighlight ? 0.5 : 0}
                        />
                    </mesh>
                );
            })}

            {/* Cube vertices */}
            {vertices.map((vertex) => {
                const shouldHighlight = isHighlightingVertices;
                const vertexColor = shouldHighlight ? "#F7B23B" : "#64748b";
                const vertexOpacity = isHighlightingFaces || isHighlightingEdges ? 0.3 : 1;

                return (
                    <mesh
                        key={vertex.id}
                        position={vertex.pos}
                        onPointerOver={(e) => {
                            e.stopPropagation();
                            setVar("cubeHighlight", "vertices");
                        }}
                        onPointerOut={() => setVar("cubeHighlight", "")}
                    >
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshStandardMaterial
                            color={vertexColor}
                            transparent
                            opacity={vertexOpacity}
                            emissive={shouldHighlight ? "#F7B23B" : "#000000"}
                            emissiveIntensity={shouldHighlight ? 0.5 : 0}
                        />
                    </mesh>
                );
            })}
        </>
    );
}

// Reactive wrapper for the 3D cube
function ReactiveInteractiveCube() {
    return (
        <div className="relative w-full h-[400px] bg-white rounded-xl overflow-hidden border border-slate-200">
            <Canvas>
                <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={45} />
                <Suspense fallback={null}>
                    <InteractiveCube />
                </Suspense>
                <OrbitControls
                    enableDamping
                    dampingFactor={0.1}
                    minDistance={4}
                    maxDistance={10}
                />
            </Canvas>
            <InteractionHintSequence
                hintKey="cube-orbit-hint"
                steps={[
                    {
                        gesture: "orbit-3d",
                        label: "Drag to rotate the cube",
                        position: { x: "50%", y: "50%" },
                    },
                ]}
            />
            {/* Counter display */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-6">
                <CounterBadge label="Faces" count={6} color="#62D0AD" highlightId="faces" />
                <CounterBadge label="Edges" count={12} color="#8E90F5" highlightId="edges" />
                <CounterBadge label="Vertices" count={8} color="#F7B23B" highlightId="vertices" />
            </div>
        </div>
    );
}

// Counter badge component
function CounterBadge({ label, count, color, highlightId }: { label: string; count: number; color: string; highlightId: string }) {
    const activeHighlight = useVar("cubeHighlight", "") as string;
    const setVar = useSetVar();
    const isActive = activeHighlight === highlightId;

    return (
        <div
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${isActive ? 'ring-2 ring-offset-2' : 'opacity-80 hover:opacity-100'}`}
            style={{
                backgroundColor: isActive ? color : `${color}33`,
                color: isActive ? "white" : color,
                ringColor: color,
            }}
            onMouseEnter={() => setVar("cubeHighlight", highlightId)}
            onMouseLeave={() => setVar("cubeHighlight", "")}
        >
            <div className="text-xs font-medium uppercase tracking-wide">{label}</div>
            <div className="text-2xl font-bold">{count}</div>
        </div>
    );
}

export const section1WhatMakes3DBlocks: ReactElement[] = [
    // Title
    <StackLayout key="layout-section1-title" maxWidth="xl">
        <Block id="section1-title" padding="lg">
            <EditableH1 id="h1-section1-title" blockId="section1-title">
                Nets and 3D Shapes
            </EditableH1>
        </Block>
    </StackLayout>,

    // Introduction
    <StackLayout key="layout-section1-intro" maxWidth="xl">
        <Block id="section1-intro" padding="sm">
            <EditableParagraph id="para-section1-intro" blockId="section1-intro">
                Pick up any box and you are holding a 3D shape. But what makes it "3D"? And what happens if you could unfold that box completely flat? In this lesson, you will discover the hidden connection between flat patterns called{" "}
                <InlineTooltip id="tooltip-net-definition" tooltip="A net is a 2D pattern that can be folded to create a 3D shape. Think of it like unwrapping a present!">
                    nets
                </InlineTooltip>{" "}
                and the 3D shapes they create.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Section 1 heading
    <StackLayout key="layout-section1-heading" maxWidth="xl">
        <Block id="section1-heading" padding="md">
            <EditableH2 id="h2-section1-heading" blockId="section1-heading">
                What Makes a Shape 3D?
            </EditableH2>
        </Block>
    </StackLayout>,

    // 2D vs 3D explanation
    <StackLayout key="layout-section1-2d3d-explanation" maxWidth="xl">
        <Block id="section1-2d3d-explanation" padding="sm">
            <EditableParagraph id="para-section1-2d3d-explanation" blockId="section1-2d3d-explanation">
                A square drawn on paper is a 2D shape. It has length and width, but no thickness. You can measure across it and up it, but you cannot go inside it. A cube is different. It has length, width, and something extra:{" "}
                <InlineTooltip id="tooltip-depth" tooltip="Depth is the measurement going 'into' or 'out of' a shape. It's what makes a box feel solid rather than flat like a piece of paper.">
                    depth
                </InlineTooltip>
                . This third dimension is what makes it a 3D shape.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive cube visualization
    <SplitLayout key="layout-section1-cube-visual" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="section1-cube-explanation" padding="sm">
                <EditableParagraph id="para-section1-cube-explanation" blockId="section1-cube-explanation">
                    Every 3D shape has three important parts. The flat surfaces are called{" "}
                    <InlineLinkedHighlight
                        id="highlight-faces"
                        varName="cubeHighlight"
                        highlightId="faces"
                        color="#62D0AD"
                    >
                        faces
                    </InlineLinkedHighlight>
                    . The lines where two faces meet are called{" "}
                    <InlineLinkedHighlight
                        id="highlight-edges"
                        varName="cubeHighlight"
                        highlightId="edges"
                        color="#8E90F5"
                    >
                        edges
                    </InlineLinkedHighlight>
                    . And the corners where edges come together are called{" "}
                    <InlineLinkedHighlight
                        id="highlight-vertices"
                        varName="cubeHighlight"
                        highlightId="vertices"
                        color="#F7B23B"
                    >
                        vertices
                    </InlineLinkedHighlight>
                    .
                </EditableParagraph>
            </Block>
            <Block id="section1-cube-instruction" padding="sm">
                <EditableParagraph id="para-section1-cube-instruction" blockId="section1-cube-instruction">
                    Drag the cube to spin it around. Can you find all six faces? Notice how some are hidden on the back. Hover over the counters below the cube to highlight each part.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="section1-cube-visual" padding="sm" hasVisualization>
            <ReactiveInteractiveCube />
        </Block>
    </SplitLayout>,

    // Question: How many faces?
    <StackLayout key="layout-section1-question-faces" maxWidth="xl">
        <Block id="section1-question-faces" padding="md">
            <EditableParagraph id="para-section1-question-faces" blockId="section1-question-faces">
                After exploring the cube, how many faces does it have?{" "}
                <InlineFeedback
                    varName="answerCubeFaces"
                    correctValue="6"
                    position="terminal"
                    successMessage="Exactly right! A cube has 6 faces, all identical squares"
                    failureMessage="Not quite"
                    hint="Try rotating the cube to count all the flat surfaces, including the hidden ones"
                    reviewBlockId="section1-cube-visual"
                    reviewLabel="Explore the cube again"
                >
                    <InlineClozeInput
                        varName="answerCubeFaces"
                        correctAnswer="6"
                        {...clozePropsFromDefinition(getVariableInfo('answerCubeFaces'))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Question: How many edges?
    <StackLayout key="layout-section1-question-edges" maxWidth="xl">
        <Block id="section1-question-edges" padding="md">
            <EditableParagraph id="para-section1-question-edges" blockId="section1-question-edges">
                And how many edges does a cube have?{" "}
                <InlineFeedback
                    varName="answerCubeEdges"
                    correctValue="12"
                    position="terminal"
                    successMessage="Well done! 12 edges, with 4 on top, 4 on bottom, and 4 connecting them"
                    failureMessage="Not quite"
                    hint="Count the lines where faces meet. Each face has 4 edges, but edges are shared between faces"
                    reviewBlockId="section1-cube-visual"
                    reviewLabel="Count the edges on the cube"
                >
                    <InlineClozeInput
                        varName="answerCubeEdges"
                        correctAnswer="12"
                        {...clozePropsFromDefinition(getVariableInfo('answerCubeEdges'))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Question: How many vertices?
    <StackLayout key="layout-section1-question-vertices" maxWidth="xl">
        <Block id="section1-question-vertices" padding="md">
            <EditableParagraph id="para-section1-question-vertices" blockId="section1-question-vertices">
                Finally, how many vertices (corners) does a cube have?{" "}
                <InlineFeedback
                    varName="answerCubeVertices"
                    correctValue="8"
                    position="terminal"
                    successMessage="Correct! 8 vertices, with 4 on top and 4 on bottom"
                    failureMessage="Not quite"
                    hint="Look at where three edges meet. A cube has corners on top and bottom"
                    reviewBlockId="section1-cube-visual"
                    reviewLabel="Find all the corners"
                >
                    <InlineClozeInput
                        varName="answerCubeVertices"
                        correctAnswer="8"
                        {...clozePropsFromDefinition(getVariableInfo('answerCubeVertices'))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
