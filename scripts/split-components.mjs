import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function sliceLines(filePath, startLine, endLine) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  return lines.slice(startLine - 1, endLine).join('\n');
}

function writeFile(relativePath, content) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  const lineCount = content.split('\n').length;
  console.log(`Wrote ${relativePath} (${lineCount} lines)`);
}

const landingPath = path.join(root, 'src/components/LandingPage.tsx');

writeFile(
  'src/features/landing/LandingHomeView.tsx',
  `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  TrendingUp,
  FolderLock,
  Layers,
  Compass,
  LineChart,
  Heart,
  ArrowRight,
  Search,
  CheckCircle2,
  ShieldCheck,
  PieChart,
  ChevronRight,
  Database,
  Coins,
  QrCode,
  Plus,
} from 'lucide-react';
import { TiltCard } from './TiltCard';
import type { ShowcasePortfolioCard } from './landingTypes';

interface LandingHomeViewProps {
  showcasePortfolioCards: ShowcasePortfolioCard[];
  totalShowcaseValue: number;
  totalShowcaseCost: number;
  totalShowcaseRoi: number;
  onOpenRegister: () => void;
}

export function LandingHomeView({
  showcasePortfolioCards,
  totalShowcaseValue,
  totalShowcaseCost,
  totalShowcaseRoi,
  onOpenRegister,
}: LandingHomeViewProps) {
  return (
${sliceLines(landingPath, 338, 793).split('\n').map((line) => line).join('\n')}
  );
}
`,
);

console.log('Landing home view extracted');
