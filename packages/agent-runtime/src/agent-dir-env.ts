/**
 * Side-effect module: must be the sidecar's first import. The pi SDK resolves
 * some agent paths while its modules load (e.g. the tools `bin` directory),
 * so `PI_CODING_AGENT_DIR` has to be set before any pi module is evaluated.
 */
import { pinPiAgentDir } from "./agent-dir.js";

pinPiAgentDir();
