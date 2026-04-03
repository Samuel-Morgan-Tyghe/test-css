import { shouldShowChunkWarning } from '../utils/chunkAnalysis';
import { useSpecStore } from '../store/specStore';
import './ChunkWarning.css';

interface Props {
  stageName: string;
  content: string;
  specId: string;
}

export default function ChunkWarning({ stageName, content, specId }: Props) {
  const splitSpec = useSpecStore((s) => s.splitSpec);
  const { level, message } = shouldShowChunkWarning(stageName, content);

  if (!level) return null;

  const handleSplit = () => {
    const newLabel = prompt('Name for the new sub-feature:');
    if (newLabel) {
      splitSpec(specId, newLabel);
    }
  };

  return (
    <div className={`chunk-warning chunk-warning--${level}`}>
      <span className="chunk-warning__icon">{level === 'high' ? '⚠' : '↑'}</span>
      <span className="chunk-warning__message">{message}</span>
      <button className="chunk-warning__split" onClick={handleSplit}>
        Split ↗
      </button>
    </div>
  );
}
