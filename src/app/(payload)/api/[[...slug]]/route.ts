import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from "@payloadcms/next/routes";
import config from "@payload-config";

const GET = REST_GET(config);
const POST = REST_POST(config);
const DELETE = REST_DELETE(config);
const PATCH = REST_PATCH(config);
const PUT = REST_PUT(config);
const OPTIONS = REST_OPTIONS(config);

export { GET, POST, DELETE, PATCH, PUT, OPTIONS };
