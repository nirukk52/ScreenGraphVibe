/**
 * @module UI/Management/PersonaManagementPage
 * @description Entry page for Persona Management Dashboard.
 * @dependencies React, Next.js routing, @screengraph/persona-management
 * @publicAPI Page component renders Dashboard from persona-management module
 */
import React from 'react';
import { Dashboard } from '@screengraph/persona-management/ui';

export default function PersonaManagementPage(): JSX.Element {
  return <Dashboard />;
}

