import ToolRecentTracker from '@/components/tools/ToolRecentTracker';

import ToolClientLoader from './ToolClientLoader';

export default function Page() {
  return (
    <>
      <ToolRecentTracker toolId="hash-hmac" href="/t/hash-hmac" />
      <ToolClientLoader />
    </>
  );
}
