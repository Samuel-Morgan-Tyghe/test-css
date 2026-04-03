import { getComplexityLevel } from '../utils/chunkAnalysis';
import type { ComplexityLevel } from '../types';
import './ComplexityIndicator.css';

interface Props {
  content: string;
  stageName: string;
}

const labels: Record<ComplexityLevel, string> = {
  atomic: '✓ atomic',
  'getting-broad': '↑ getting broad',
  'consider-splitting': '⚠ consider splitting',
};

export default function ComplexityIndicator({ content, stageName }: Props) {
  const showComplexity = stageName === 'ideation' || stageName === 'prd';
  if (!showComplexity) return null;

  const level = getComplexityLevel(content);

  return (
    <span className={`complexity complexity--${level}`}>
      {labels[level]}
    </span>
  );
}
