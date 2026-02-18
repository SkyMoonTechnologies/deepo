'use client';

import { saveToolCard } from '@/lib/client-db';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { getSensitiveInputWarning } from '@/lib/privacy';
import { Button } from '@/components/ui/button';
import { decodeJwt, verifyJwt } from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';
import { useState } from 'react';

type VerifyState = {
  status: 'idle' | 'valid' | 'invalid';
  message: string | null;
};

type UrlState = {
  token: string;
};

const sharingDisabledReason = 'Permalink disabled for privacy: JWT tokens are never encoded in URL state.';
const sensitiveInputWarning = getSensitiveInputWarning('jwt');

async function fingerprintToken(token: string): Promise<string> {
  const bytes = new globalThis.TextEncoder().encode(token);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  const digestBytes = new Uint8Array(digest);
  const hex = Array.from(digestBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 16);
}

export default function ToolClient() {
  const [state, setState] = useState<UrlState>({ token: '' });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>({
    status: 'idle',
    message: null,
  });
  const [secret, setSecret] = useState('');
  const [publicKeyPem, setPublicKeyPem] = useState('');

  const decoded = decodeJwt(state.token);
  const alg = decoded.ok && typeof decoded.value.header.alg === 'string' ? decoded.value.header.alg : null;

  const handleTokenChange = (nextToken: string) => {
    setVerifyState({ status: 'idle', message: null });
    setStatusMessage(null);
    setState({ token: nextToken });
  };

  const handleVerify = async () => {
    if (!decoded.ok) {
      return;
    }

    const result = await verifyJwt(state.token, { secret, publicKeyPem });
    if (result.ok) {
      setVerifyState({
        status: 'valid',
        message: `Signature valid (${result.value.alg}).`,
      });
      return;
    }

    setVerifyState({
      status: 'invalid',
      message: `${result.error.code}: ${result.error.message}`,
    });
  };

  const handleCopyPayload = async () => {
    if (!decoded.ok || !globalThis.navigator?.clipboard) {
      return;
    }

    const payloadText = JSON.stringify(decoded.value.payload, null, 2);
    try {
      await globalThis.navigator.clipboard.writeText(payloadText);
      setStatusMessage('Decoded payload copied.');
      notifyAction('copy', 'Decoded payload copied to clipboard.');
    } catch {
      notifyActionError('Copy decoded payload');
    }
  };

  const handleDownloadDecoded = () => {
    if (!decoded.ok) {
      return;
    }

    const body = JSON.stringify(
      {
        header: decoded.value.header,
        payload: decoded.value.payload,
        signature: decoded.value.signature,
      },
      null,
      2,
    );

    try {
      const blob = new globalThis.Blob([body], { type: 'application/json;charset=utf-8' });
      const url = globalThis.URL.createObjectURL(blob);
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = 'jwt-decoded.json';
      anchor.click();
      globalThis.URL.revokeObjectURL(url);
      notifyAction('download', 'jwt-decoded.json is ready.');
    } catch {
      notifyActionError('Download');
    }
  };

  const handleSaveCard = async () => {
    if (!decoded.ok) {
      return;
    }

    try {
      const tokenFingerprint = await fingerprintToken(state.token);
      await saveToolCard({
        id: globalThis.crypto.randomUUID(),
        toolId: 'jwt',
        title: `JWT ${new Date().toISOString()}`,
        payload: {
          header: decoded.value.header,
          payload: decoded.value.payload,
          tokenFingerprint,
        },
      });

      setStatusMessage('Card saved locally.');
      notifyAction('save', 'Card saved locally.');
    } catch {
      notifyActionError('Save card');
    }
  };

  const handleClear = () => {
    setSecret('');
    setPublicKeyPem('');
    setStatusMessage(null);
    setVerifyState({ status: 'idle', message: null });
    setState({ token: '' });
  };

  return (
    <ToolShell
      title="JWT Decoder"
      description="Decode JWTs and verify HS/RS signatures while keeping keys out of URL and saved data."
      shareWarning={sharingDisabledReason}
      sensitiveInputWarning={sensitiveInputWarning}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleCopyPayload} disabled={!decoded.ok}>
            Copy decoded payload
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadDecoded} disabled={!decoded.ok}>
            Download decoded JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveCard} disabled={!decoded.ok}>
            Save card
          </Button>
          <Button variant="secondary" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="jwt-token-input">
              JWT token
            </label>
            <textarea
              id="jwt-token-input"
              className="mt-2 h-56 w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
              value={state.token}
              onChange={(event) => handleTokenChange(event.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              spellCheck={false}
            />
          </div>

          <fieldset className="space-y-3 rounded-lg border border-border/70 p-3">
            <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Verify</legend>
            <p className="text-sm text-muted-foreground">Algorithm: {alg ?? 'Unknown'}</p>
            {alg?.startsWith('HS') ? (
              <div>
                <label className="block text-sm font-medium" htmlFor="jwt-secret-input">
                  Secret
                </label>
                <input
                  id="jwt-secret-input"
                  type="password"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 font-mono text-sm"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  placeholder="shared secret"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium" htmlFor="jwt-public-key-input">
                  Public key (PEM)
                </label>
                <textarea
                  id="jwt-public-key-input"
                  className="mt-1 h-32 w-full rounded-md border border-input bg-background p-2 font-mono text-xs"
                  value={publicKeyPem}
                  onChange={(event) => setPublicKeyPem(event.target.value)}
                  placeholder="-----BEGIN PUBLIC KEY-----"
                  spellCheck={false}
                />
              </div>
            )}
            <Button type="button" size="sm" onClick={handleVerify} disabled={!decoded.ok}>
              Verify
            </Button>
            {verifyState.message ? (
              <p
                className={
                  verifyState.status === 'valid'
                    ? 'text-sm text-emerald-600 dark:text-emerald-400'
                    : 'text-sm text-destructive'
                }
              >
                {verifyState.message}
              </p>
            ) : null}
          </fieldset>
        </div>
      }
      right={
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Header</h2>
            {decoded.ok ? (
              <pre className="mt-2 max-h-44 overflow-auto rounded-md border border-border/70 bg-muted/30 p-3 font-mono text-xs">
                {JSON.stringify(decoded.value.header, null, 2)}
              </pre>
            ) : (
              <p className="mt-2 rounded-md border border-border/70 p-3 text-sm text-muted-foreground">
                Enter a JWT to decode its header.
              </p>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold">Payload</h2>
            {decoded.ok ? (
              <pre className="mt-2 max-h-56 overflow-auto rounded-md border border-border/70 bg-muted/30 p-3 font-mono text-xs">
                {JSON.stringify(decoded.value.payload, null, 2)}
              </pre>
            ) : (
              <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {decoded.error.code}: {decoded.error.message}
              </div>
            )}
          </div>
          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
    />
  );
}
