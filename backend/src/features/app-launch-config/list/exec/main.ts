import { FakeAppLaunchConfigListAdapter } from '../adapters/fake.adapter.js';
import { AppLaunchConfigListResponseSchema } from '../schemas/response.schema.js';
import { TRACE } from '../../../../shared/constants.js';

export type RunOptions = { traceId?: string; pretty?: boolean };

export async function run(options: RunOptions = {}) {
  const traceId = options.traceId ?? TRACE.EXEC_FIXED_TRACE_ID;
  const port = new FakeAppLaunchConfigListAdapter();
  const items = await port.list();
  return AppLaunchConfigListResponseSchema.parse({ items, trace_id: traceId });
}

function parseArg(flag: string) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const pretty = process.argv.includes('--pretty');
  const trace = parseArg('--trace-id');
  const out = await run({ pretty, traceId: trace });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(out, null, pretty ? 2 : 0));
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}


