/** Parse JSON from a fetch Response; never throws. */
export async function readApiJson(res) {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {
      error: `Invalid response (${res.status}). If you just deployed, wait for the build or redeploy. ${text.slice(0, 80)}`,
    };
  }
}
