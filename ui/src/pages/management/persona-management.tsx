/**
 * @module UI/Management/PersonaManagementPage
 * @description Entry page for Persona Management Dashboard.
 * @dependencies React, Next.js routing, feature components
 * @publicAPI Page component renders feature Dashboard
 */
import React from 'react';
import { Dashboard } from '@/features/management/persona-management';

export default function PersonaManagementPage(): JSX.Element {
  return <Dashboard />;
}

