'use client';

import { useState } from 'react';

import { saveToolCard } from '@/lib/client-db';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { getSensitiveInputWarning } from '@/lib/privacy';
import { Button } from '@/components/ui/button';
import { constantTimeCompareHex, hmacSha256, sha256, sha512 } from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';

type HashMode = 'sha-256' | 'sha-512' | 'hmac-sha256';

type ToolState = {
  mode: HashMode;
  input: string;
  secret: string;
  expectedHash: string;
};

const sharingDisabledReason = 'Permalink disabled for privacy: this tool never encodes input in URL state.';

function parseMode(value: string | null): HashMode {
  if (value === 'sha-512') {
    return 'sha-512';
  }

  return 'sha-256';
}

function decodeInitialState(): ToolState {
  return {
    mode: parseMode(null),
    input: '',
    secret: '',
    expectedHash: '',
  };
}

async function generateHash(state: Pick<ToolState, 'mode' | 'input' | 'secret'>): Promise<string> {
  if (state.mode === 'sha-256') {
    return sha256(state.input);
  }

  if (state.mode === 'sha-512') {
    return sha512(state.input);
  }

  return hmacSha256(state.input, state.secret);
}

export default function ToolClient() {
  const [state, setState] = useState<ToolState>(() => decodeInitialState());
  const [digest, setDigest] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const sensitiveInputWarning = state.mode === 'hmac-sha256' ? getSensitiveInputWarning('hash-hmac') : undefined;

  const hasDigest = digest.length > 0;
  const canCompare = hasDigest && state.expectedHash.trim().length > 0;
  const hashesMatch = canCompare ? constantTimeCompareHex(digest, state.expectedHash) : false;

  const handleModeChange = (mode: HashMode) => {
    const nextState: ToolState = {
      ...state,
      mode,
    };

    setState(nextState);
    setDigest('');
    setStatusMessage(null);
  };

  const handleInputChange = (input: string) => {
    const nextState: ToolState = {
      ...state,
      input,
    };

    setState(nextState);
    setDigest('');
    setStatusMessage(null);
  };

  const handleSecretChange = (secret: string) => {
    setState({
      ...state,
      secret,
    });
    setDigest('');
    setStatusMessage(null);
  };

  const handleExpectedHashChange = (expectedHash: string) => {
    setState({
      ...state,
      expectedHash,
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const nextDigest = await generateHash(state);
      setDigest(nextDigest);
      setStatusMessage('Hash generated.');
    } catch {
      setDigest('');
      setStatusMessage('Failed to generate hash.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyHash = async () => {
    if (!hasDigest || !globalThis.navigator?.clipboard) {
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(digest);
      setStatusMessage('Hash copied.');
      notifyAction('copy', 'Hash copied to clipboard.');
    } catch {
      notifyActionError('Copy hash');
    }
  };

  const handleSaveCard = async () => {
    if (!hasDigest) {
      return;
    }

    try {
      await saveToolCard({
        id: globalThis.crypto.randomUUID(),
        toolId: 'hash-hmac',
        title: `Hash ${new Date().toISOString()}`,
        payload: {
          mode: state.mode,
          input: state.input,
          hash: digest,
        },
      });

      setStatusMessage('Card saved locally.');
      notifyAction('save', 'Card saved locally.');
    } catch {
      notifyActionError('Save card');
    }
  };

  const handleDownload = () => {
    if (!hasDigest) {
      return;
    }

    try {
      const blob = new globalThis.Blob([`${digest}\n`], { type: 'text/plain;charset=utf-8' });
      const url = globalThis.URL.createObjectURL(blob);
      const anchor = globalThis.document.createElement('a');

      anchor.href = url;
      anchor.download = `${state.mode}-hash.txt`;
      anchor.click();

      globalThis.URL.revokeObjectURL(url);
      notifyAction('download', `${state.mode}-hash.txt is ready.`);
    } catch {
      notifyActionError('Download');
    }
  };

  const handleClear = () => {
    const nextState: ToolState = {
      mode: 'sha-256',
      input: '',
      secret: '',
      expectedHash: '',
    };

    setState(nextState);
    setDigest('');
    setStatusMessage(null);
  };

  return (
    <ToolShell
      title="Hash and HMAC"
      description="Generate SHA checksums or HMAC-SHA256 signatures and verify expected checksums safely."
      shareWarning={sharingDisabledReason}
      sensitiveInputWarning={sensitiveInputWarning}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleCopyHash} disabled={!hasDigest}>
            Copy hash
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!hasDigest}>
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveCard} disabled={!hasDigest}>
            Save card
          </Button>
          <Button variant="secondary" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Mode</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={state.mode === 'sha-256' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleModeChange('sha-256')}
              >
                SHA-256
              </Button>
              <Button
                type="button"
                variant={state.mode === 'sha-512' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleModeChange('sha-512')}
              >
                SHA-512
              </Button>
              <Button
                type="button"
                variant={state.mode === 'hmac-sha256' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleModeChange('hmac-sha256')}
              >
                HMAC-SHA256
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="hash-input">
              Input text
            </label>
            <textarea
              id="hash-input"
              className="h-72 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
              value={state.input}
              onChange={(event) => handleInputChange(event.target.value)}
              placeholder="Enter text to hash"
              spellCheck={false}
            />
          </div>

          {state.mode === 'hmac-sha256' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="hmac-secret">
                Secret
              </label>
              <input
                id="hmac-secret"
                type="password"
                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                value={state.secret}
                onChange={(event) => handleSecretChange(event.target.value)}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">Secret is never encoded in URL state and never saved to cards.</p>
            </div>
          ) : null}

          <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate hash'}
          </Button>
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Digest</h2>
            {hasDigest ? (
              <pre className="max-h-60 overflow-auto rounded-md border border-border/70 bg-muted/30 p-3 font-mono text-xs">
                {digest}
              </pre>
            ) : (
              <p className="rounded-md border border-border/70 p-3 text-sm text-muted-foreground">
                Generate a hash to see output.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Checksum compare</h2>
            <label className="block text-sm font-medium" htmlFor="expected-hash">
              Expected hash
            </label>
            <textarea
              id="expected-hash"
              className="h-24 w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
              value={state.expectedHash}
              onChange={(event) => handleExpectedHashChange(event.target.value)}
              placeholder="Paste expected checksum"
              spellCheck={false}
            />
            {canCompare ? (
              <p className={hashesMatch ? 'text-sm font-medium text-emerald-600' : 'text-sm font-medium text-destructive'}>
                {hashesMatch ? 'Match' : 'No match'}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Paste an expected hash to compare against the generated digest.</p>
            )}
          </div>

          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
    />
  );
}
