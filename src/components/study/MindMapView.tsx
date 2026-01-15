import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import { MindMapNode } from '@/types/study';
import { Card } from '@/components/ui/card';

interface MindMapViewProps {
  title: string;
  nodes: MindMapNode[];
}

const nodeColors = [
  'hsl(221, 83%, 53%)',
  'hsl(262, 83%, 58%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(340, 82%, 52%)',
];

export const MindMapView = ({ title, nodes }: MindMapViewProps) => {
  const flattenNodes = useCallback((
    mindMapNodes: MindMapNode[],
    parentId: string | null = null,
    level: number = 0,
    xOffset: number = 0
  ): { nodes: Node[]; edges: Edge[] } => {
    const resultNodes: Node[] = [];
    const resultEdges: Edge[] = [];
    
    const spacing = 200;
    const levelSpacing = 150;

    mindMapNodes.forEach((node, index) => {
      const nodeId = node.id;
      const x = level * levelSpacing + 100;
      const y = xOffset + index * spacing;
      
      resultNodes.push({
        id: nodeId,
        data: { label: node.label },
        position: { x, y },
        style: {
          background: level === 0 ? nodeColors[0] : nodeColors[level % nodeColors.length],
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: level === 0 ? 'bold' : 'normal',
          fontSize: level === 0 ? '16px' : '14px',
        },
      });

      if (parentId) {
        resultEdges.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          style: { stroke: nodeColors[level % nodeColors.length], strokeWidth: 2 },
        });
      }

      if (node.children && node.children.length > 0) {
        const childResults = flattenNodes(
          node.children,
          nodeId,
          level + 1,
          y - ((node.children.length - 1) * spacing) / 2
        );
        resultNodes.push(...childResults.nodes);
        resultEdges.push(...childResults.edges);
      }
    });

    return { nodes: resultNodes, edges: resultEdges };
  }, []);

  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    if (nodes.length === 0) {
      return { nodes: [], edges: [] };
    }
    return flattenNodes(nodes);
  }, [nodes, flattenNodes]);

  const [rfNodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  if (nodes.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground h-96 flex items-center justify-center">
        No mind map yet. Generate one by asking about an AI topic!
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div style={{ height: '500px' }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </Card>
  );
};
