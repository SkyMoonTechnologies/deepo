import ToolRecentTracker from '@/components/tools/ToolRecentTracker';

import ToolClientLoader from './ToolClientLoader';

export default function Page() {
  return (
    <>
      <ToolRecentTracker toolId="uuid-ulid" href="/t/uuid-ulid" />
      <ToolClientLoader />
    </>
  );
}
