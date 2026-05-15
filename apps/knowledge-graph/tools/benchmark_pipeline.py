#!/usr/bin/env python3
import argparse
import time
from src.pipeline.orchestrator import process_scene


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--file', '-f', help='Text file to analyze', default=None)
    p.add_argument('--text', '-t', help='Inline text to analyze', default=None)
    args = p.parse_args()

    if args.file:
        with open(args.file, 'r', encoding='utf8') as fh:
            text = fh.read()
    elif args.text:
        text = args.text
    else:
        text = (
            "It was a dark and stormy night. Detective Langley found the bloody knife "
            "near the fireplace. Mary Maloney said she had been in the kitchen earlier."
        )

    start = time.time()
    result = process_scene(text, verbose=True)
    end = time.time()

    total = end - start
    print('\n--- BENCHMARK ---')
    print(f'Total elapsed: {total:.3f}s')
    if result.metadata and getattr(result.metadata, 'timings', None):
        print('Per-layer timings:')
        for k, v in result.metadata.timings.items():
            print(f'  {k}: {v:.3f}s')


if __name__ == '__main__':
    main()
