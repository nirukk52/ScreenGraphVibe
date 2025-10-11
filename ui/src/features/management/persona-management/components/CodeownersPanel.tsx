/**
 * @module UI/Management/PersonaManagement/CodeownersPanel
 * @description CODEOWNERS preview/apply UI with basic fetch hooks.
 */
import React, { useState } from 'react';

export function CodeownersPanel(): JSX.Element {
  const [preview, setPreview] = useState<string>('');
  const [applied, setApplied] = useState<boolean>(false);

  const doPreview = async () => {
    const res = await fetch('http://localhost:3000/management/codeowners/preview');
    const data = await res.json();
    setPreview(data.preview ?? '');
  };

  const doApply = async () => {
    const res = await fetch('http://localhost:3000/management/codeowners/apply', { method: 'POST' });
    const data = await res.json();
    setApplied(Boolean(data.applied));
  };

  return (
    <div className="rounded border p-4" data-testid="panel-codeowners" aria-labelledby="panel-codeowners-title">
      <h2 className="font-medium mb-2" id="panel-codeowners-title">CODEOWNERS</h2>
      <div className="flex gap-3 mb-3">
        <button className="px-3 py-1 rounded border" onClick={doPreview} data-testid="btn-preview" aria-label="Preview CODEOWNERS">Preview</button>
        <button className="px-3 py-1 rounded border" onClick={doApply} data-testid="btn-apply" aria-label="Apply CODEOWNERS">Apply</button>
      </div>
      <pre className="text-sm bg-gray-50 p-3 rounded border" data-testid="preview-box" aria-labelledby="panel-codeowners-title">{preview}</pre>
      {applied && <div className="text-green-600 mt-2" data-testid="apply-status">Applied</div>}
    </div>
  );
}

