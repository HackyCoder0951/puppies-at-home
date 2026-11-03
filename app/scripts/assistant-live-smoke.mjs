#!/usr/bin/env node
/**
 * One real call to the configured NVIDIA model with a tool definition, to check the key, the model name and tool calling.
 * Reads NVIDIA_API_KEY (and optionally NVIDIA_MODEL, NVIDIA_BASE_URL) from the environment; never prints the key.
 * Usage: NVIDIA_API_KEY=... npm run assistant:smoke
 */
const key = process.env.NVIDIA_API_KEY;
if (!key) { console.error('Set NVIDIA_API_KEY first (key from build.nvidia.com).'); process.exit(1); }
const model = process.env.NVIDIA_MODEL ?? 'meta/llama-3.1-70b-instruct';
const base = (process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');

const body = {
  model, max_tokens: 200, temperature: 0.2, stream: false, tool_choice: 'auto',
  messages: [{ role: 'system', content: 'You help visitors find puppies. Use the tool to look up puppies; never invent any.' }, { role: 'user', content: 'Do you have a girl Maltipoo?' }],
  tools: [{ type: 'function', function: { name: 'retrieve_puppies', description: 'Find available puppies.', parameters: { type: 'object', properties: { breed: { type: 'string', enum: ['maltipoo', 'pomeranian', 'poodle', 'cavapoo', 'shih-tzu'] }, sex: { type: 'string', enum: ['male', 'female'] } }, additionalProperties: false } } }],
};
const started = Date.now();
const res = await fetch(`${base}/chat/completions`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(60_000) });
console.log(`status ${res.status} in ${Date.now() - started} ms (model ${model})`);
if (!res.ok) { console.error((await res.text()).slice(0, 300)); process.exit(1); }
const json = await res.json();
const message = json.choices?.[0]?.message ?? {};
const call = message.tool_calls?.[0]?.function;
console.log(call ? `tool call: ${call.name} ${call.arguments}` : `no tool call; text: ${String(message.content ?? '').slice(0, 200)}`);
console.log('usage:', JSON.stringify(json.usage ?? {}));
process.exit(call ? 0 : 2);
