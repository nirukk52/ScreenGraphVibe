import { FakeAppLaunchConfigListAdapter } from '../adapters/fake.adapter.js';
import { AppLaunchConfigListResponseSchema } from '../schemas/response.schema.js';
import { TRACE } from '../../../../shared/constants.js';
async function main() {
  const port = new FakeAppLaunchConfigListAdapter();
  const items = await port.list();
  const out = AppLaunchConfigListResponseSchema.parse({ items, trace_id: TRACE.EXEC_FIXED_TRACE_ID });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(out));
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}


