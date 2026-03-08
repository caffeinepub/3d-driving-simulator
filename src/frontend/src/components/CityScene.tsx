import { useMemo } from "react";

// Deterministic pseudo-random based on a seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453123;
  return x - Math.floor(x);
}

// City config
const CITY_SIZE = 240;
const BLOCK_SIZE = 24; // road + sidewalk block
const ROAD_WIDTH = 8;
const SIDEWALK_WIDTH = 1.5;
const NUM_BLOCKS = 9; // 9x9 grid

// Generate building data
function generateBuildings() {
  const buildings: {
    x: number;
    z: number;
    w: number;
    h: number;
    d: number;
    color: string;
  }[] = [];
  let seed = 1;

  const colors = [
    "#b0b0b8",
    "#a8a8b0",
    "#c0c0c8",
    "#d0cfc0",
    "#c8c0b0",
    "#b8c0c8",
    "#a0a8b0",
    "#c8c8d0",
    "#d8d0c8",
    "#b0c8b8",
    "#d0b8a8",
    "#c0d0d8",
    "#b8b0c0",
    "#d8c0b0",
    "#c0b8d0",
  ];

  for (let bx = 0; bx < NUM_BLOCKS; bx++) {
    for (let bz = 0; bz < NUM_BLOCKS; bz++) {
      const blockCenterX =
        -CITY_SIZE / 2 + ROAD_WIDTH / 2 + bx * BLOCK_SIZE + BLOCK_SIZE / 2;
      const blockCenterZ =
        -CITY_SIZE / 2 + ROAD_WIDTH / 2 + bz * BLOCK_SIZE + BLOCK_SIZE / 2;
      const blockInnerSize = BLOCK_SIZE - ROAD_WIDTH - SIDEWALK_WIDTH * 2;

      // 1-4 buildings per block
      const numBuildings = Math.floor(seededRandom(seed++) * 3) + 1;

      if (numBuildings === 1) {
        const w = blockInnerSize * (0.5 + seededRandom(seed++) * 0.4);
        const d = blockInnerSize * (0.5 + seededRandom(seed++) * 0.4);
        const h = 5 + seededRandom(seed++) * 22;
        const color = colors[Math.floor(seededRandom(seed++) * colors.length)];
        buildings.push({ x: blockCenterX, z: blockCenterZ, w, h, d, color });
      } else if (numBuildings === 2) {
        const w1 = blockInnerSize * 0.4;
        const w2 = blockInnerSize * 0.45;
        const h1 = 5 + seededRandom(seed++) * 18;
        const h2 = 5 + seededRandom(seed++) * 22;
        const offset = blockInnerSize * 0.22;
        const color1 = colors[Math.floor(seededRandom(seed++) * colors.length)];
        const color2 = colors[Math.floor(seededRandom(seed++) * colors.length)];
        buildings.push({
          x: blockCenterX - offset,
          z: blockCenterZ,
          w: w1,
          h: h1,
          d: blockInnerSize * 0.6,
          color: color1,
        });
        buildings.push({
          x: blockCenterX + offset,
          z: blockCenterZ,
          w: w2,
          h: h2,
          d: blockInnerSize * 0.6,
          color: color2,
        });
      } else if (numBuildings === 3) {
        const h1 = 5 + seededRandom(seed++) * 20;
        const h2 = 5 + seededRandom(seed++) * 15;
        const h3 = 5 + seededRandom(seed++) * 12;
        const c1 = colors[Math.floor(seededRandom(seed++) * colors.length)];
        const c2 = colors[Math.floor(seededRandom(seed++) * colors.length)];
        const c3 = colors[Math.floor(seededRandom(seed++) * colors.length)];
        const s = blockInnerSize * 0.32;
        buildings.push({
          x: blockCenterX - s * 0.5,
          z: blockCenterZ - s * 0.5,
          w: s * 1.2,
          h: h1,
          d: s * 1.2,
          color: c1,
        });
        buildings.push({
          x: blockCenterX + s * 0.6,
          z: blockCenterZ - s * 0.5,
          w: s,
          h: h2,
          d: s,
          color: c2,
        });
        buildings.push({
          x: blockCenterX,
          z: blockCenterZ + s * 0.8,
          w: s * 1.5,
          h: h3,
          d: s,
          color: c3,
        });
      } else {
        const offsets: [number, number][] = [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ];
        for (const [ox, oz] of offsets) {
          const w =
            blockInnerSize * 0.3 + seededRandom(seed++) * blockInnerSize * 0.15;
          const h = 5 + seededRandom(seed++) * 16;
          const color =
            colors[Math.floor(seededRandom(seed++) * colors.length)];
          buildings.push({
            x: blockCenterX + ox * blockInnerSize * 0.25,
            z: blockCenterZ + oz * blockInnerSize * 0.25,
            w,
            h,
            d: w,
            color,
          });
        }
      }
    }
  }

  return buildings;
}

// Generate trees
function generateTrees() {
  const treeList: { x: number; z: number; h: number; scale: number }[] = [];
  let seed = 500;

  for (let bx = 0; bx <= NUM_BLOCKS; bx++) {
    for (let bz = 0; bz <= NUM_BLOCKS; bz++) {
      const roadX = -CITY_SIZE / 2 + bx * BLOCK_SIZE;
      const roadZ = -CITY_SIZE / 2 + bz * BLOCK_SIZE;

      if (seededRandom(seed++) > 0.45) {
        const offX = roadX + ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2;
        const offZ =
          roadZ + ROAD_WIDTH / 4 + seededRandom(seed++) * (BLOCK_SIZE * 0.5);
        const h = 2 + seededRandom(seed++) * 2;
        const scale = 0.8 + seededRandom(seed++) * 0.6;
        treeList.push({ x: offX, z: offZ, h, scale });
      }
      if (seededRandom(seed++) > 0.45) {
        const offX = roadX - ROAD_WIDTH / 2 - SIDEWALK_WIDTH / 2;
        const offZ = roadZ + seededRandom(seed++) * (BLOCK_SIZE * 0.6);
        const h = 2 + seededRandom(seed++) * 2;
        const scale = 0.8 + seededRandom(seed++) * 0.6;
        treeList.push({ x: offX, z: offZ, h, scale });
      }
    }
  }
  return treeList.slice(0, 60);
}

// Generate lane markings (dashed center lines)
function generateLaneMarkings() {
  const markings: { x: number; z: number; type: "h" | "v" }[] = [];

  for (let i = 0; i <= NUM_BLOCKS; i++) {
    const pos = -CITY_SIZE / 2 + i * BLOCK_SIZE;
    for (let d = -CITY_SIZE / 2 + 3; d < CITY_SIZE / 2; d += 6) {
      markings.push({ x: pos, z: d, type: "v" });
      markings.push({ x: d, z: pos, type: "h" });
    }
  }
  return markings;
}

// Road positions as a stable array
const ROAD_POSITIONS = Array.from({ length: NUM_BLOCKS + 1 }, (_, i) => ({
  index: i,
  pos: -CITY_SIZE / 2 + i * BLOCK_SIZE,
}));

// Building windows decoration
function BuildingWindows({
  x,
  z,
  h,
  w,
  d,
}: {
  x: number;
  z: number;
  h: number;
  w: number;
  d: number;
}) {
  return (
    <mesh position={[x, h / 2 + 0.01, z + d / 2 + 0.01]}>
      <planeGeometry args={[w * 0.85, h * 0.8]} />
      <meshStandardMaterial
        color="#1a2a3a"
        emissive="#203050"
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.3}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export function CityScene() {
  const buildings = useMemo(() => generateBuildings(), []);
  const treeList = useMemo(() => generateTrees(), []);
  const laneMarkings = useMemo(() => generateLaneMarkings(), []);

  return (
    <group>
      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[CITY_SIZE + 20, CITY_SIZE + 20]} />
        <meshStandardMaterial color="#1a1e24" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* City blocks */}
      {ROAD_POSITIONS.slice(0, NUM_BLOCKS).map(({ index: bx, pos: bxPos }) =>
        ROAD_POSITIONS.slice(0, NUM_BLOCKS).map(({ index: bz, pos: bzPos }) => {
          const cx = bxPos + ROAD_WIDTH / 2 + BLOCK_SIZE / 2;
          const cz = bzPos + ROAD_WIDTH / 2 + BLOCK_SIZE / 2;
          return (
            <mesh
              key={`block-${bx}-${bz}`}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[cx, 0, cz]}
              receiveShadow
            >
              <planeGeometry
                args={[BLOCK_SIZE - ROAD_WIDTH, BLOCK_SIZE - ROAD_WIDTH]}
              />
              <meshStandardMaterial color="#2a2e35" roughness={0.85} />
            </mesh>
          );
        }),
      )}

      {/* Road surfaces */}
      {ROAD_POSITIONS.map(({ index, pos }) => (
        <group key={`road-pos-${index}`}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[pos, 0.001, 0]}
            receiveShadow
          >
            <planeGeometry args={[ROAD_WIDTH, CITY_SIZE]} />
            <meshStandardMaterial color="#222428" roughness={0.95} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.001, pos]}
            receiveShadow
          >
            <planeGeometry args={[CITY_SIZE, ROAD_WIDTH]} />
            <meshStandardMaterial color="#222428" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Sidewalks */}
      {ROAD_POSITIONS.map(({ index, pos }) => (
        <group key={`sidewalk-pos-${index}`}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[pos + ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2, 0.002, 0]}
          >
            <planeGeometry args={[SIDEWALK_WIDTH, CITY_SIZE]} />
            <meshStandardMaterial color="#3a3e45" roughness={0.8} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[pos - ROAD_WIDTH / 2 - SIDEWALK_WIDTH / 2, 0.002, 0]}
          >
            <planeGeometry args={[SIDEWALK_WIDTH, CITY_SIZE]} />
            <meshStandardMaterial color="#3a3e45" roughness={0.8} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.002, pos + ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2]}
          >
            <planeGeometry args={[CITY_SIZE, SIDEWALK_WIDTH]} />
            <meshStandardMaterial color="#3a3e45" roughness={0.8} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.002, pos - ROAD_WIDTH / 2 - SIDEWALK_WIDTH / 2]}
          >
            <planeGeometry args={[CITY_SIZE, SIDEWALK_WIDTH]} />
            <meshStandardMaterial color="#3a3e45" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Road lane markings */}
      {laneMarkings.map((m) => (
        <mesh
          key={`mark-v${m.type}-x${m.x.toFixed(1)}-z${m.z.toFixed(1)}`}
          rotation={[-Math.PI / 2, m.type === "h" ? Math.PI / 2 : 0, 0]}
          position={[
            m.type === "v" ? m.x : m.z,
            0.005,
            m.type === "v" ? m.z : m.x,
          ]}
        >
          <planeGeometry args={[0.15, 2.5]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.9}
            opacity={0.6}
            transparent
          />
        </mesh>
      ))}

      {/* Yellow center double lines */}
      {ROAD_POSITIONS.map(({ index, pos }) => (
        <group key={`yellow-pos-${index}`}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[pos - 0.25, 0.004, 0]}
          >
            <planeGeometry args={[0.12, CITY_SIZE]} />
            <meshStandardMaterial
              color="#ffcc00"
              roughness={0.9}
              opacity={0.8}
              transparent
            />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[pos + 0.25, 0.004, 0]}
          >
            <planeGeometry args={[0.12, CITY_SIZE]} />
            <meshStandardMaterial
              color="#ffcc00"
              roughness={0.9}
              opacity={0.8}
              transparent
            />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, Math.PI / 2, 0]}
            position={[0, 0.004, pos - 0.25]}
          >
            <planeGeometry args={[0.12, CITY_SIZE]} />
            <meshStandardMaterial
              color="#ffcc00"
              roughness={0.9}
              opacity={0.8}
              transparent
            />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, Math.PI / 2, 0]}
            position={[0, 0.004, pos + 0.25]}
          >
            <planeGeometry args={[0.12, CITY_SIZE]} />
            <meshStandardMaterial
              color="#ffcc00"
              roughness={0.9}
              opacity={0.8}
              transparent
            />
          </mesh>
        </group>
      ))}

      {/* Buildings */}
      {buildings.map((b) => (
        <group key={`building-x${b.x.toFixed(2)}-z${b.z.toFixed(2)}`}>
          <mesh position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[b.x, b.h + 0.15, b.z]}>
            <boxGeometry args={[b.w + 0.2, 0.3, b.d + 0.2]} />
            <meshStandardMaterial color="#888890" roughness={0.8} />
          </mesh>
          <BuildingWindows x={b.x} z={b.z} h={b.h} w={b.w} d={b.d / 2} />
        </group>
      ))}

      {/* Trees */}
      {treeList.map((t) => (
        <group
          key={`tree-x${t.x.toFixed(2)}-z${t.z.toFixed(2)}`}
          position={[t.x, 0, t.z]}
        >
          <mesh position={[0, t.h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.15 * t.scale, 0.2 * t.scale, t.h, 6]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
          </mesh>
          <mesh position={[0, t.h + 0.8 * t.scale, 0]} castShadow>
            <sphereGeometry args={[0.9 * t.scale, 7, 7]} />
            <meshStandardMaterial color="#2d6e2a" roughness={0.8} />
          </mesh>
          <mesh position={[0, t.h + 1.5 * t.scale, 0]} castShadow>
            <sphereGeometry args={[0.6 * t.scale, 6, 6]} />
            <meshStandardMaterial color="#338c30" roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* Street lights */}
      {ROAD_POSITIONS.map(({ index: i, pos: iPos }) =>
        ROAD_POSITIONS.map(({ index: j, pos: jPos }) => {
          const x = iPos + ROAD_WIDTH / 2 + 0.5;
          const z = jPos + ROAD_WIDTH / 2 + 0.5;
          return (
            <group key={`light-${i}-${j}`} position={[x, 0, z]}>
              <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 6, 6]} />
                <meshStandardMaterial
                  color="#4a4a52"
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>
              <mesh position={[0.5, 5.9, 0]} rotation={[0, 0, Math.PI / 8]}>
                <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
                <meshStandardMaterial
                  color="#4a4a52"
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>
              <mesh position={[0.9, 5.6, 0]}>
                <boxGeometry args={[0.35, 0.15, 0.2]} />
                <meshStandardMaterial
                  color="#ffffcc"
                  emissive="#ffffa0"
                  emissiveIntensity={1.5}
                />
              </mesh>
            </group>
          );
        }),
      )}

      {/* Lighting */}
      <ambientLight intensity={0.4} color="#c8d8f0" />
      <directionalLight
        position={[80, 120, 60]}
        intensity={1.8}
        color="#fff5e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={400}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      <directionalLight
        position={[-40, 60, -40]}
        intensity={0.4}
        color="#a0c0ff"
      />
      <hemisphereLight args={["#c8d8f0", "#3a4050", 0.35]} />

      {/* Fog */}
      <fog attach="fog" args={["#1a2030", 80, 220]} />
    </group>
  );
}
