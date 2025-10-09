// Self-executable CLI for this sub-feature
import { FakeScreenDetailsAdapter } from '../adapters/fake.adapter.js';
import { ExecResponseSchema } from '../schemas/exec-response.schema.js';

export type RunOptions = { traceId?: string; pretty?: boolean };

export async function run(options: RunOptions = {}) {
  const traceId = options.traceId ?? 'exec-fixed-trace-id';
  const port = new FakeScreenDetailsAdapter();
  const data = await port.run({ params: { deviceID: 'device-123' }, body: { screenName: 'Login' } });
  return ExecResponseSchema.parse({ data, trace_id: traceId });
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
