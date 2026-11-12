import { Injectable, BadRequestException } from '@nestjs/common';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const TIMEOUT_MS = 10_000;

const EXTENSIONS: Record<string, string> = {
  python:     'py',
  javascript: 'js',
  c:          'c',
};

const SUPPORTED = new Set(Object.keys(EXTENSIONS));

interface Parameter {
  name: string;
  type: string;
}

// Convert camelCase function name to snake_case for Python
function toSnakeCase(s: string): string {
  return s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

// Convert JSON args to simple stdin for C (length-prefixed arrays)
function jsonArgsToStdin(jsonInput: string, parameters: Parameter[]): string {
  const args = JSON.parse(jsonInput);
  const lines: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (Array.isArray(arg)) {
      if (arg.length > 0 && Array.isArray(arg[0])) {
        // 2D array: num_rows, then each row
        lines.push(String(arg.length));
        for (const row of arg) {
          lines.push(row.join(' '));
        }
      } else {
        // 1D array: length + space-separated values
        lines.push(String(arg.length));
        if (arg.length > 0) lines.push(arg.join(' '));
      }
    } else {
      lines.push(String(arg));
    }
  }
  return lines.join('\n');
}

function buildPythonHarness(fnName: string): string {
  const snakeName = toSnakeCase(fnName);
  return `
import json as _json, sys as _sys
_args = _json.loads(_sys.stdin.read().strip())
_result = ${snakeName}(*_args)
if isinstance(_result, list):
    print(' '.join(str(_x) for _x in _result))
elif isinstance(_result, bool):
    print(str(_result).lower())
else:
    print(_result)
`;
}

function buildJsHarness(fnName: string): string {
  return `
const _fs = require('fs');
const _args = JSON.parse(_fs.readFileSync(0, 'utf8').trim());
const _result = ${fnName}(..._args);
if (Array.isArray(_result)) {
  process.stdout.write(_result.join(' ') + '\\n');
} else if (typeof _result === 'boolean') {
  process.stdout.write(String(_result) + '\\n');
} else {
  process.stdout.write((_result !== undefined && _result !== null ? String(_result) : '') + '\\n');
}
`;
}

@Injectable()
export class ExecuteService {
  async run(
    language: string,
    code: string,
    stdin: string,
    functionName?: string,
    parameters?: Parameter[],
    returnType?: string,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    if (!SUPPORTED.has(language)) {
      throw new BadRequestException(`Unsupported language: ${language}`);
    }

    const id  = crypto.randomBytes(8).toString('hex');
    const ext = EXTENSIONS[language];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `cx_${id}_`));
    const src = path.join(dir, `main.${ext}`);

    try {
      let finalCode = code;
      let finalStdin = stdin;

      if (functionName) {
        if (language === 'python') {
          finalCode = code + '\n' + buildPythonHarness(functionName);
        } else if (language === 'javascript') {
          finalCode = code + '\n' + buildJsHarness(functionName);
        } else if (language === 'c' && parameters && stdin) {
          // Convert JSON args to length-prefixed stdin for C
          try {
            finalStdin = jsonArgsToStdin(stdin, parameters);
          } catch {
            // If conversion fails (e.g. stdin is already plain text), use as-is
          }
        }
      }

      fs.writeFileSync(src, finalCode, 'utf8');

      if (language === 'c') {
        return await this.runC(dir, src, finalStdin);
      } else if (language === 'python') {
        return await this.runProcess('python3', [src], finalStdin, dir);
      } else {
        return await this.runProcess('node', [src], finalStdin, dir);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  private async runC(dir: string, src: string, stdin: string) {
    const bin = path.join(dir, 'main');

    try {
      await execFileAsync('gcc', [src, '-o', bin, '-lm'], { timeout: TIMEOUT_MS });
    } catch (e: any) {
      return { stdout: '', stderr: e.stderr || e.message, exitCode: 1 };
    }

    return this.runProcess(bin, [], stdin, dir);
  }

  private async runProcess(
    cmd: string,
    args: string[],
    stdin: string,
    cwd: string,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      const { spawn } = require('child_process');
      const child = spawn(cmd, args, { cwd, timeout: TIMEOUT_MS });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
      child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

      if (stdin) {
        child.stdin.write(stdin);
      }
      child.stdin.end();

      const timer = setTimeout(() => {
        child.kill();
        resolve({ stdout, stderr: 'Time limit exceeded (10s)', exitCode: 124 });
      }, TIMEOUT_MS);

      child.on('close', (code: number) => {
        clearTimeout(timer);
        resolve({ stdout, stderr, exitCode: code ?? 1 });
      });

      child.on('error', (err: Error) => {
        clearTimeout(timer);
        resolve({ stdout: '', stderr: err.message, exitCode: 1 });
      });
    });
  }
}
