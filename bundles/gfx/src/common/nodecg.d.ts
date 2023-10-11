import type { NodeCGAPIClient } from "@nodecg/types/client/api/api.client";

declare global {
    interface Window {
        nodecg: NodeCGAPIClient
    }
}
