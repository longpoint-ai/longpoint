import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import sharp from 'sharp';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

export interface VideoProbeResult {
  duration: number;
  width: number;
  height: number;
  size: number;
  aspectRatio: number;
}

export interface ImageProbeResult {
  width: number;
  height: number;
  format: string;
  aspectRatio: number;
  size: {
    bytes: number;
    megabytes: string;
  };
}

export interface AudioProbeResult {
  size: number;
  duration: number;
}

@Injectable()
export class MediaProbeService {
  async probeVideo(url: string): Promise<VideoProbeResult> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        '-i',
        url,
      ]);

      let outputData = '';
      let errorData = '';

      ffprobe.stdout.on('data', (data) => {
        outputData += data;
      });

      ffprobe.stderr.on('data', (data) => {
        errorData += data;
      });

      ffprobe.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFprobe process failed: ${errorData}`));
          return;
        }

        try {
          const probe = JSON.parse(outputData);
          const size = parseFloat(probe.format.size);
          const duration = parseFloat(probe.format.duration);
          const videoStream = probe.streams.find(
            (stream: any) => stream.codec_type === 'video'
          );

          if (!videoStream || !videoStream.width || !videoStream.height) {
            reject(
              new Error(
                'Could not determine required video stream metadata. Stream: ' +
                videoStream
                  ? JSON.stringify(videoStream)
                  : 'null'
              )
            );
            return;
          }

          resolve({
            duration,
            width: videoStream.width,
            height: videoStream.height,
            size,
            aspectRatio: this.getAspectRatio(
              videoStream.width,
              videoStream.height
            ),
          });
        } catch (error) {
          reject(new Error('Failed to parse FFprobe output'));
        }
      });
    });
  }

  async probeImage(url: string): Promise<ImageProbeResult> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get file size from Content-Length header (if available)
    let size = response.headers.get('content-length')
      ? parseInt(response.headers.get('content-length') ?? '0', 10)
      : null;

    // If Content-Length is missing, we need to clone the response to get size
    // without locking the original response body
    if (size === null && response.body) {
      const clonedResponse = response.clone();
      const buffer = await clonedResponse.arrayBuffer();
      size = buffer.byteLength;
    }

    if (size === null) {
      throw new Error('Response body is null');
    }

    const stream = Readable.fromWeb(response.body as ReadableStream);
    const pipeline = sharp();
    pipeline.on('error', (err: Error) => {
      console.error('Sharp processing error:', err);
    });

    const streamPipeline = stream.pipe(pipeline);

    const metadata = await pipeline.metadata();

    stream.destroy();
    streamPipeline.destroy();

    if (!metadata.width || !metadata.height) {
      throw new Error('Failed to extract image dimensions');
    }

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format ?? 'unknown',
      aspectRatio: this.getAspectRatio(metadata.width, metadata.height),
      size: {
        bytes: size,
        megabytes: (size / (1024 * 1024)).toFixed(2),
      },
    };
  }

  async probeAudio(url: string): Promise<AudioProbeResult> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        '-select_streams',
        'a:0', // Select only the first audio stream
        '-i',
        url,
      ]);

      let outputData = '';
      let errorData = '';

      ffprobe.stdout.on('data', (data) => {
        outputData += data;
      });

      ffprobe.stderr.on('data', (data) => {
        errorData += data;
      });

      ffprobe.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFprobe process failed: ${errorData}`));
          return;
        }

        try {
          const metadata = JSON.parse(outputData);
          resolve({
            size: parseFloat(metadata?.format?.size ?? '0'),
            duration: parseFloat(metadata?.format?.duration ?? '0'),
          });
        } catch (error) {
          reject(new Error('Failed to parse FFprobe output'));
        }
      });
    });
  }

  private getAspectRatio(width: number, height: number) {
    return parseFloat((width / height).toFixed(6));
  }
}
