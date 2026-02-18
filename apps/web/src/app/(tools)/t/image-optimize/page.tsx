import ToolPage from '@/components/tools/ToolPage';

import ToolClientLoader from './ToolClientLoader';

export default function Page() {
  return <ToolPage toolId="image-optimize" ToolClient={ToolClientLoader} />;
}
