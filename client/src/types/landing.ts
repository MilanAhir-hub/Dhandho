// Navbar links type
export interface NavLink {
  label: string;
  href: string;
}

// Hero stat card
export interface StatItem {
  icon: string;
  value: string;
  label: string;
}

// Feature card for "One tool, every role" section
export interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
  color: 'green' | 'rose' | 'amber' | 'violet';
}

// Step for how-it-works section
export interface WorkStep {
  step: string;
  title: string;
  description: string;
}

import React from 'react';
