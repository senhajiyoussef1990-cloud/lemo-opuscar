#!/usr/bin/env python3
"""Audio quality gate for narrated Papy exports. Uses FFmpeg and NumPy.
This is a signal analysis gate, not a substitute for human listening."""
import json,subprocess,sys
from pathlib import Path
import numpy as np
def decode(path):
 p=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(path),'-vn','-ac','1','-ar','16000','-f','f32le','pipe:1'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
 x=np.frombuffer(p.stdout,dtype='<f4')
 if not len(x):raise RuntimeError(f'No decoded audio: {path}')
 return x
def inspect(path):
 x=decode(path);sr=16000
 peak=float(np.max(np.abs(x)));rms=float(np.sqrt(np.mean(x*x)))
 clips=int(np.sum(np.abs(x)>=.998))
 # Abrupt sample jumps with high amplitude are candidates for clicks.
 d=np.abs(np.diff(x))
 abrupt=np.flatnonzero((d>.48)&(np.abs(x[:-1])>.23)&(np.abs(x[1:])>.23))
 # Sustained long absolute silence in a voiced film may indicate a missing voice.
 seconds=len(x)/sr
 windows=np.array([np.sqrt(np.mean(z*z)) for z in np.array_split(x,max(1,int(seconds)))])
 quiet=int(np.sum(windows<.0004))
 return dict(file=str(path),duration_s=round(seconds,2),peak=round(peak,4),rms=round(rms,5),clipped_samples=clips,abrupt_jumps=int(len(abrupt)),silent_1s_windows=quiet)
def main(d,slug):
 paths=[d/'out/mix.wav',d/f'le-livre-de-papy-{slug}-short-9x16.mp4',d/f'le-livre-de-papy-{slug}-youtube-16x9.mp4']
 report=[inspect(p) for p in paths]
 (d/'audio-qc.json').write_text(json.dumps(report,indent=2)+'\n')
 for r in report:print('AUDIO-QC',json.dumps(r))
 for r in report:
  if r['peak']>.999 or r['clipped_samples']>10:raise RuntimeError('Clipping/saturation detected: '+r['file'])
  if r['rms']<.003:raise RuntimeError('Audio is nearly silent: '+r['file'])
 if max(abs(report[1]['duration_s']-report[2]['duration_s']),abs(report[0]['duration_s']-report[1]['duration_s']))>2.0:
  raise RuntimeError('Audio durations differ between formats')
 if any(r['abrupt_jumps']>100 for r in report):raise RuntimeError('Too many potential click transients')
 print('Audio signal checks passed; manual listening is still required for subjective noise and intelligibility.')
if __name__=='__main__':main(Path(sys.argv[1]),sys.argv[2])
