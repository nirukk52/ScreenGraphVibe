import { HealthExecResponseSchema } from '../schemas/exec-response.schema.js';
import { TRACE } from '../../../shared/constants.js';

async function main() {
  const out = HealthExecResponseSchema.parse({ feature: 'health', trace_id: TRACE.EXEC_FIXED_TRACE_ID });
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


