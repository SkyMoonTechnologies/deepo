import { describe, expect, it } from 'vitest';

import {
  base64Decode,
  base64Encode,
  htmlDecode,
  htmlEncode,
  transformText,
  urlDecode,
  urlEncode,
} from '../encoders';

describe('encoders tools', () => {
  it('encodes and decodes base64 with unicode text', () => {
    const source = 'hello 👋 world';
    const encoded = base64Encode(source);
    const decoded = base64Decode(encoded);

    expect(encoded).toBe('aGVsbG8g8J+RiyB3b3JsZA==');
    expect(decoded).toEqual({ ok: true, value: source });
  });

  it('decodes url-safe and unpadded base64 variants', () => {
    const decoded = base64Decode('8J-Riw');

    expect(decoded).toEqual({ ok: true, value: '👋' });
  });

  it('returns parse error for invalid base64', () => {
    const decoded = base64Decode('%$bad');

    expect(decoded.ok).toBe(false);
    if (!decoded.ok) {
      expect(decoded.error.code).toBe('PARSE_ERROR');
    }
  });

  it('encodes and decodes URL text', () => {
    const source = 'hello world + slash/emoji 👋';
    const encoded = urlEncode(source);
    const decoded = urlDecode(encoded);

    expect(encoded).toBe('hello%20world%20%2B%20slash%2Femoji%20%F0%9F%91%8B');
    expect(decoded).toEqual({ ok: true, value: source });
  });

  it('handles plus-to-space URL decoding', () => {
    const decoded = urlDecode('hello+world');

    expect(decoded).toEqual({ ok: true, value: 'hello world' });
  });

  it('returns parse error for invalid URL encoding', () => {
    const decoded = urlDecode('%E0%A4%A');

    expect(decoded.ok).toBe(false);
    if (!decoded.ok) {
      expect(decoded.error.code).toBe('PARSE_ERROR');
    }
  });

  it('encodes and decodes minimal HTML entities', () => {
    const source = `<button title="say 'hi'">& click</button>`;
    const encoded = htmlEncode(source);
    const decoded = htmlDecode(encoded);

    expect(encoded).toBe('&lt;button title=&quot;say &#39;hi&#39;&quot;&gt;&amp; click&lt;/button&gt;');
    expect(decoded).toEqual({ ok: true, value: source });
  });

  it('supports transformText dispatch', () => {
    expect(transformText('html', 'encode', '<x>')).toEqual({ ok: true, value: '&lt;x&gt;' });
    expect(transformText('html', 'decode', '&lt;x&gt;')).toEqual({ ok: true, value: '<x>' });
  });
});
