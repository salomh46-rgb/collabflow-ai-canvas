import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface TopologyNode {
  id: string;
  label: string;
  sub: string;
  color: string;
  glow: string;
  icon: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  mass: number;
  pulsePhase: number;
}

export interface TopologyEdge {
  source: string;
  target: string;
  restLength: number;
  stiffness: number;
  bandwidth: string;
}

interface ProjectedNode {
  node: TopologyNode;
  screenX: number;
  screenY: number;
  scale: number;
  depthZ: number;
}

const INITIAL_NODES: TopologyNode[] = [
  {
    id: 'gemini',
    label: 'Gemini 1.5 Pro',
    sub: 'AI Core',
    color: '#c084fc',
    glow: '#a855f7',
    icon: '✦',
    x: 0,
    y: -90,
    z: 30,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 36,
    mass: 1.4,
    pulsePhase: 0,
  },
  {
    id: 'ws',
    label: 'WebSocket Server',
    sub: 'Real-time Sync',
    color: '#22d3ee',
    glow: '#06b6d4',
    icon: '⚡',
    x: -120,
    y: 20,
    z: -40,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 32,
    mass: 1.2,
    pulsePhase: 1.2,
  },
  {
    id: 'db',
    label: 'PostgreSQL + Prisma',
    sub: 'Persistence',
    color: '#34d399',
    glow: '#10b981',
    icon: '🗄️',
    x: 130,
    y: 60,
    z: -30,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 30,
    mass: 1.1,
    pulsePhase: 2.4,
  },
  {
    id: 'redis',
    label: 'Redis PubSub',
    sub: 'Distributed Queue',
    color: '#fb7185',
    glow: '#f43f5e',
    icon: '📡',
    x: 40,
    y: 130,
    z: 50,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 28,
    mass: 1.0,
    pulsePhase: 3.6,
  },
  {
    id: 'vector',
    label: 'Vector Knowledge',
    sub: 'Embeddings',
    color: '#fbbf24',
    glow: '#f59e0b',
    icon: '🧠',
    x: 140,
    y: -70,
    z: 70,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 28,
    mass: 1.0,
    pulsePhase: 4.8,
  },
  {
    id: 'client',
    label: 'Client Canvas',
    sub: 'User Node',
    color: '#38bdf8',
    glow: '#0284c7',
    icon: '🎨',
    x: -140,
    y: 110,
    z: 20,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 30,
    mass: 1.0,
    pulsePhase: 0.8,
  },
];

const INITIAL_EDGES: TopologyEdge[] = [
  { source: 'client', target: 'ws', restLength: 130, stiffness: 0.015, bandwidth: '< 15ms' },
  { source: 'ws', target: 'gemini', restLength: 150, stiffness: 0.014, bandwidth: 'Stream' },
  { source: 'ws', target: 'redis', restLength: 140, stiffness: 0.012, bandwidth: 'Pub/Sub' },
  { source: 'ws', target: 'db', restLength: 150, stiffness: 0.012, bandwidth: 'Prisma pool' },
  { source: 'gemini', target: 'vector', restLength: 120, stiffness: 0.016, bandwidth: 'Cosine 1536d' },
  { source: 'redis', target: 'db', restLength: 130, stiffness: 0.011, bandwidth: 'Sync state' },
  { source: 'client', target: 'gemini', restLength: 190, stiffness: 0.007, bandwidth: 'Direct Intent' },
];

interface ForceDirectedTopologyGraphProps {
  className?: string;
  showControls?: boolean;
}

export const ForceDirectedTopologyGraph: React.FC<ForceDirectedTopologyGraphProps> = ({
  className = '',
  showControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation state refs (avoid React re-render overhead in 60fps loop)
  const nodesRef = useRef<TopologyNode[]>(JSON.parse(JSON.stringify(INITIAL_NODES)));
  const edgesRef = useRef<TopologyEdge[]>(INITIAL_EDGES);

  // Camera angles
  const cameraRef = useRef({
    rotX: 0.15,
    rotY: 0,
    autoRotate: true,
    zoom: 1.0,
    camDist: 450,
  });

  // Interaction tracking
  const interactionRef = useRef({
    isDraggingNode: false,
    draggedNodeId: null as string | null,
    dragPlaneZ: 0,
    isOrbiting: false,
    lastMouseX: 0,
    lastMouseY: 0,
    hoveredNodeId: null as string | null,
  });

  const [activeInfoNode, setActiveInfoNode] = useState<TopologyNode | null>(null);
  const [isPhysicsActive, setIsPhysicsActive] = useState(true);

  // Helper: 3D to 2D projection
  const project3D = useCallback((
    x: number,
    y: number,
    z: number,
    cx: number,
    cy: number,
    rotX: number,
    rotY: number,
    camDist: number,
    zoom: number
  ) => {
    // 1. Yaw rotation (around Y-axis)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    // 2. Pitch rotation (around X-axis)
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // 3. Perspective division
    const fov = 420;
    const perspectiveZ = z2 + camDist;
    const scale = Math.max(0.2, (fov / (perspectiveZ > 10 ? perspectiveZ : 10)) * zoom);

    return {
      screenX: cx + x1 * scale,
      screenY: cy + y2 * scale,
      scale,
      depthZ: z2,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let photonOffset = 0;

    // Resize handler
    const updateDimensions = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(() => updateDimensions());
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Main animation & physics loop
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      photonOffset += dt * 1.5;

      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 800;
      const height = rect?.height || 600;
      const cx = width / 2;
      const cy = height / 2;

      const cam = cameraRef.current;
      const interaction = interactionRef.current;

      // Ambient 3D auto-drift
      if (cam.autoRotate && !interaction.isOrbiting && !interaction.isDraggingNode) {
        cam.rotY += 0.0035;
        cam.rotX = 0.15 + Math.sin(time * 0.0008) * 0.08;
      }

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Physics Simulation Step (Coulomb repulsion + Hooke spring attraction + Damping)
      if (isPhysicsActive) {
        const kCoulomb = 28000;
        const kCenter = 0.025;
        const damping = 0.88;

        // 1. Coulomb Repulsion between all node pairs: F = k / d^2
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];

            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dz = n1.z - n2.z;
            const distSq = dx * dx + dy * dy + dz * dz + 100;
            const dist = Math.sqrt(distSq);

            const force = (kCoulomb / distSq) * (1 / n1.mass);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            const fz = (dz / dist) * force;

            if (n1.id !== interaction.draggedNodeId) {
              n1.vx += fx;
              n1.vy += fy;
              n1.vz += fz;
            }
            if (n2.id !== interaction.draggedNodeId) {
              n2.vx -= fx;
              n2.vy -= fy;
              n2.vz -= fz;
            }
          }
        }

        // 2. Hooke Spring Attraction along edges: F = -k * (d - restLength)
        const nodeMap = new Map<string, TopologyNode>(nodes.map((n) => [n.id, n]));
        for (const edge of edges) {
          const sNode = nodeMap.get(edge.source);
          const tNode = nodeMap.get(edge.target);
          if (!sNode || !tNode) continue;

          const dx = tNode.x - sNode.x;
          const dy = tNode.y - sNode.y;
          const dz = tNode.z - sNode.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          const delta = dist - edge.restLength;
          const force = edge.stiffness * delta;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          const fz = (dz / dist) * force;

          if (sNode.id !== interaction.draggedNodeId) {
            sNode.vx += fx;
            sNode.vy += fy;
            sNode.vz += fz;
          }
          if (tNode.id !== interaction.draggedNodeId) {
            tNode.vx -= fx;
            tNode.vy -= fy;
            tNode.vz -= fz;
          }
        }

        // 3. Center anchoring gravity, velocity limit, and damping
        for (const node of nodes) {
          if (node.id === interaction.draggedNodeId) continue;

          // Weak gravitational pull toward origin (0, 0, 0)
          node.vx -= node.x * kCenter;
          node.vy -= node.y * kCenter;
          node.vz -= node.z * kCenter;

          // Velocity caps to prevent explosive oscillations
          const maxVel = 18;
          node.vx = Math.max(-maxVel, Math.min(maxVel, node.vx * damping));
          node.vy = Math.max(-maxVel, Math.min(maxVel, node.vy * damping));
          node.vz = Math.max(-maxVel, Math.min(maxVel, node.vz * damping));

          // Position update
          node.x += node.vx;
          node.y += node.vy;
          node.z += node.vz;
        }
      }

      // Project all nodes to 2D
      const projectedNodes: ProjectedNode[] = nodes.map((node) => {
        const proj = project3D(node.x, node.y, node.z, cx, cy, cam.rotX, cam.rotY, cam.camDist, cam.zoom);
        return {
          node,
          screenX: proj.screenX,
          screenY: proj.screenY,
          scale: proj.scale,
          depthZ: proj.depthZ,
        };
      });

      const projectedMap = new Map<string, ProjectedNode>(
        projectedNodes.map((p) => [p.node.id, p])
      );

      // Render Clear with deep gradient background
      ctx.clearRect(0, 0, width, height);

      // Draw subtle depth background glow
      ctx.save();
      const gridGradient = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(width, height) / 1.2);
      gridGradient.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
      gridGradient.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = gridGradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // Render Edges (with glowing neon beams, elastic tension color, and traveling photons)
      for (const edge of edges) {
        const p1 = projectedMap.get(edge.source);
        const p2 = projectedMap.get(edge.target);
        if (!p1 || !p2) continue;

        const isHoveredEdge =
          interaction.hoveredNodeId === edge.source || interaction.hoveredNodeId === edge.target;
        const isDraggedEdge =
          interaction.draggedNodeId === edge.source || interaction.draggedNodeId === edge.target;
        const isHighlighted = isHoveredEdge || isDraggedEdge;

        // Current 3D edge length vs rest length (tension ratio)
        const dx3d = p2.node.x - p1.node.x;
        const dy3d = p2.node.y - p1.node.y;
        const dz3d = p2.node.z - p1.node.z;
        const currentLen = Math.sqrt(dx3d * dx3d + dy3d * dy3d + dz3d * dz3d);
        const stretchRatio = currentLen / edge.restLength;

        ctx.save();

        // Edge gradient from source glow to target glow
        const edgeGrad = ctx.createLinearGradient(p1.screenX, p1.screenY, p2.screenX, p2.screenY);
        if (isHighlighted) {
          edgeGrad.addColorStop(0, p1.node.color);
          edgeGrad.addColorStop(0.5, '#ffffff');
          edgeGrad.addColorStop(1, p2.node.color);
        } else {
          edgeGrad.addColorStop(0, `${p1.node.glow}`);
          edgeGrad.addColorStop(1, `${p2.node.glow}`);
        }

        ctx.beginPath();
        ctx.moveTo(p1.screenX, p1.screenY);
        ctx.lineTo(p2.screenX, p2.screenY);

        if (isHighlighted) {
          ctx.shadowColor = p1.node.color;
          ctx.shadowBlur = 18;
          ctx.strokeStyle = edgeGrad;
          ctx.lineWidth = Math.max(2, 3.5 * ((p1.scale + p2.scale) / 2));
        } else {
          ctx.shadowColor = p1.node.glow;
          ctx.shadowBlur = 8;
          ctx.strokeStyle = edgeGrad;
          ctx.lineWidth = Math.max(1, 1.8 * ((p1.scale + p2.scale) / 2));
          ctx.globalAlpha = Math.min(0.8, Math.max(0.25, 0.55 / stretchRatio));
        }
        ctx.stroke();
        ctx.restore();

        // Traveling glowing photons along edge
        const photonCount = isHighlighted ? 3 : 2;
        for (let k = 0; k < photonCount; k++) {
          const tProgress = (photonOffset * 0.6 + k / photonCount) % 1.0;
          const px = p1.screenX + (p2.screenX - p1.screenX) * tProgress;
          const py = p1.screenY + (p2.screenY - p1.screenY) * tProgress;
          const pScale = (p1.scale + (p2.scale - p1.scale) * tProgress);

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, (isHighlighted ? 4 : 2.5) * pScale, 0, Math.PI * 2);
          ctx.fillStyle = isHighlighted ? '#ffffff' : p1.node.color;
          ctx.shadowColor = isHighlighted ? '#ffffff' : p1.node.color;
          ctx.shadowBlur = isHighlighted ? 12 : 6;
          ctx.fill();
          ctx.restore();
        }

        // Bandwidth / Connection latency pill (rendered if highlighted or hovered)
        if (isHighlighted) {
          const midX = (p1.screenX + p2.screenX) / 2;
          const midY = (p1.screenY + p2.screenY) / 2;
          ctx.save();
          ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
          const textWidth = ctx.measureText(edge.bandwidth).width;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = p1.node.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(midX - textWidth / 2 - 6, midY - 9, textWidth + 12, 18, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f8fafc';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(edge.bandwidth, midX, midY);
          ctx.restore();
        }
      }

      // Sort nodes by depthZ ascending (far to near for painter's algorithm)
      const sortedProjected = [...projectedNodes].sort((a, b) => a.depthZ - b.depthZ);

      // Render Nodes
      for (const p of sortedProjected) {
        const { node, screenX, screenY, scale } = p;
        const isHovered = interaction.hoveredNodeId === node.id;
        const isDragged = interaction.draggedNodeId === node.id;
        const isNeighbor =
          interaction.hoveredNodeId &&
          edges.some(
            (e) =>
              (e.source === interaction.hoveredNodeId && e.target === node.id) ||
              (e.target === interaction.hoveredNodeId && e.source === node.id)
          );

        // Breathing pulse animation
        const pulse = Math.sin(time * 0.003 + node.pulsePhase) * 2.5;
        const baseRadius = (node.radius + pulse) * scale;
        const drawRadius = Math.max(12, baseRadius * (isHovered || isDragged ? 1.2 : 1.0));

        ctx.save();

        // 1. Ambient Outer Halo
        const haloGrad = ctx.createRadialGradient(screenX, screenY, drawRadius * 0.4, screenX, screenY, drawRadius * 2.2);
        haloGrad.addColorStop(0, `${node.color}${isHovered || isDragged ? '99' : '44'}`);
        haloGrad.addColorStop(0.7, `${node.glow}22`);
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, drawRadius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // 2. Pulsing Neon Border Ring
        ctx.beginPath();
        ctx.arc(screenX, screenY, drawRadius + 4 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered || isDragged ? '#ffffff' : node.color;
        ctx.lineWidth = (isHovered || isDragged ? 3 : 1.8) * scale;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered || isDragged ? 25 : 12;
        ctx.stroke();

        // 3. Node Core Glass Body
        const coreGrad = ctx.createRadialGradient(
          screenX - drawRadius * 0.3,
          screenY - drawRadius * 0.3,
          drawRadius * 0.1,
          screenX,
          screenY,
          drawRadius
        );
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, node.color);
        coreGrad.addColorStop(1, '#0f172a');

        ctx.beginPath();
        ctx.arc(screenX, screenY, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // 4. Center Icon / Glyphs
        ctx.font = `${Math.max(12, Math.round(18 * scale))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(node.icon, screenX, screenY);

        // 5. Node Title & Subtitle Badge
        ctx.restore();
        ctx.save();
        const badgeY = screenY + drawRadius + 14 * scale;

        // Label Background Pill
        ctx.font = `bold ${Math.max(10, Math.round(12 * scale))}px system-ui, -apple-system, sans-serif`;
        const labelWidth = ctx.measureText(node.label).width;
        const pillWidth = labelWidth + 18 * scale;
        const pillHeight = 22 * scale;

        ctx.fillStyle = isHovered || isDragged ? 'rgba(15, 23, 42, 0.95)' : 'rgba(2, 6, 23, 0.8)';
        ctx.strokeStyle = isHovered || isNeighbor ? node.color : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(screenX - pillWidth / 2, badgeY - pillHeight / 2, pillWidth, pillHeight, 8 * scale);
        ctx.fill();
        ctx.stroke();

        // Title text
        ctx.fillStyle = isHovered || isDragged ? '#ffffff' : '#f1f5f9';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, screenX, badgeY - 1 * scale);

        // Subtitle text underneath
        ctx.font = `${Math.max(8, Math.round(9 * scale))}px system-ui, sans-serif`;
        ctx.fillStyle = node.color;
        ctx.fillText(node.sub.toUpperCase(), screenX, badgeY + 16 * scale);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [project3D, isPhysicsActive]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const cam = cameraRef.current;

    // Find clicked node in 2D projection space
    let selectedNode: TopologyNode | null = null;
    let minDistance = Infinity;

    for (const node of nodesRef.current) {
      const proj = project3D(node.x, node.y, node.z, cx, cy, cam.rotX, cam.rotY, cam.camDist, cam.zoom);
      const hitRadius = Math.max(30, node.radius * proj.scale + 15);
      const dist = Math.hypot(mouseX - proj.screenX, mouseY - proj.screenY);

      if (dist < hitRadius && dist < minDistance) {
        minDistance = dist;
        selectedNode = node;
      }
    }

    if (selectedNode) {
      // Begin node dragging
      interactionRef.current.isDraggingNode = true;
      interactionRef.current.draggedNodeId = selectedNode.id;
      interactionRef.current.dragPlaneZ = selectedNode.z;
      setActiveInfoNode(selectedNode);
    } else {
      // Begin camera orbit
      interactionRef.current.isOrbiting = true;
    }

    interactionRef.current.lastMouseX = mouseX;
    interactionRef.current.lastMouseY = mouseY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const deltaX = mouseX - interactionRef.current.lastMouseX;
    const deltaY = mouseY - interactionRef.current.lastMouseY;
    interactionRef.current.lastMouseX = mouseX;
    interactionRef.current.lastMouseY = mouseY;

    const cam = cameraRef.current;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    if (interactionRef.current.isDraggingNode && interactionRef.current.draggedNodeId) {
      const node = nodesRef.current.find((n) => n.id === interactionRef.current.draggedNodeId);
      if (node) {
        // Inverse projection approximate for 3D displacement
        const cosY = Math.cos(cam.rotY);
        const sinY = Math.sin(cam.rotY);
        const scaleFactor = (cam.camDist + node.z) / 420 / cam.zoom;

        const moveX = deltaX * scaleFactor;
        const moveY = deltaY * scaleFactor;

        // Apply rotation to move vectors
        node.x += moveX * cosY;
        node.z += -moveX * sinY;
        node.y += moveY;

        // Clear velocity while actively dragged
        node.vx = 0;
        node.vy = 0;
        node.vz = 0;
      }
    } else if (interactionRef.current.isOrbiting) {
      // Orbit camera
      cam.rotY += deltaX * 0.008;
      cam.rotX = Math.max(-0.8, Math.min(0.8, cam.rotX + deltaY * 0.008));
    } else {
      // Check Hover state
      let foundHover: TopologyNode | null = null;
      let minDistance = Infinity;

      for (const node of nodesRef.current) {
        const proj = project3D(node.x, node.y, node.z, cx, cy, cam.rotX, cam.rotY, cam.camDist, cam.zoom);
        const hitRadius = Math.max(28, node.radius * proj.scale + 10);
        const dist = Math.hypot(mouseX - proj.screenX, mouseY - proj.screenY);

        if (dist < hitRadius && dist < minDistance) {
          minDistance = dist;
          foundHover = node;
        }
      }

      interactionRef.current.hoveredNodeId = foundHover ? foundHover.id : null;
      if (foundHover) {
        setActiveInfoNode(foundHover);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    interactionRef.current.isDraggingNode = false;
    interactionRef.current.draggedNodeId = null;
    interactionRef.current.isOrbiting = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.001;
    cameraRef.current.zoom = Math.max(0.6, Math.min(1.8, cameraRef.current.zoom + zoomDelta));
  };

  const resetPositions = () => {
    nodesRef.current = JSON.parse(JSON.stringify(INITIAL_NODES));
    cameraRef.current.rotX = 0.15;
    cameraRef.current.rotY = 0;
    cameraRef.current.zoom = 1.0;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[420px] select-none overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-2xl shadow-purple-950/20 ${className}`}
    >
      {/* 3D Force-Directed Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
      />

      {/* Top Header Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-semibold text-white">Engine №12</span>
        <span className="text-slate-500">•</span>
        <span>3D Knowledge Topology</span>
      </div>

      {/* Interactive Controls Pill */}
      {showControls && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setIsPhysicsActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition backdrop-blur-md ${
              isPhysicsActive
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {isPhysicsActive ? '⚡ Physics: On' : '⏸ Physics: Paused'}
          </button>
          <button
            onClick={resetPositions}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:text-white hover:border-slate-600 transition backdrop-blur-md"
            title="Reset Node Positions"
          >
            ↺ Reset
          </button>
        </div>
      )}

      {/* Active Node Live Telemetry Drawer */}
      {activeInfoNode && (
        <div className="absolute bottom-4 left-4 z-20 max-w-xs p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-xl transition-all duration-200">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ backgroundColor: activeInfoNode.color, boxShadow: `0 0 10px ${activeInfoNode.glow}` }}
            />
            <h4 className="font-bold text-white text-sm tracking-tight">{activeInfoNode.label}</h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {activeInfoNode.sub}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            Dynamic force-directed node reacting to Coulomb repulsion and Hooke spring tensions.
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>
              Pos: [{Math.round(activeInfoNode.x)}, {Math.round(activeInfoNode.y)}, {Math.round(activeInfoNode.z)}]
            </span>
            <span className="text-emerald-400 font-medium">Synced 60FPS</span>
          </div>
        </div>
      )}

      {/* Interactive Helper Hint */}
      <div className="absolute bottom-4 right-4 z-20 text-[11px] text-slate-500/80 pointer-events-none hidden sm:block">
        💡 Drag nodes to stretch springs • Drag background to orbit 3D camera
      </div>
    </div>
  );
};

export default ForceDirectedTopologyGraph;
