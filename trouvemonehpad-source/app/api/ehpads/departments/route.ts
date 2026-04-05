import sql from "../../../lib/db";
import { jsonUtf8 } from "../../../lib/http";
import { repairRecordStrings } from "../../../lib/text";

export async function GET() {
  const rows = await sql`
    SELECT DISTINCT department_code, department_name
    FROM ehpad_establishments
    WHERE department_code IS NOT NULL AND department_name IS NOT NULL
    ORDER BY department_code
  `;

  return jsonUtf8(rows.map((row) => repairRecordStrings(row)));
}
