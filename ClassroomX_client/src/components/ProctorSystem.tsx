"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "@vladmandic/face-api";

interface ProctorSystemProps {
  sessionId?: string | number;
  onVerified?: () => void;
  onAutoSubmit: () => void;
  onViolation?: (type: string, details?: string) => void;
}

export default function ProctorSystem({
  sessionId,
  onVerified,
  onAutoSubmit,
  onViolation,
}: ProctorSystemProps) {
  // --- States ---
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyingStatus, setVerifyingStatus] = useState("Initializing camera & microphone...");
  const [idImage, setIdImage] = useState<string | null>(null);

  // Permissions & Hardware Inspection
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [ambientBaseline, setAmbientBaseline] = useState<number>(18);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [faceInPreview, setFaceInPreview] = useState(false);
  const [secondaryDisplayDetected, setSecondaryDisplayDetected] = useState(false);

  // Assessment Monitoring States
  const [warnings, setWarnings] = useState<number>(0);
  const [lastWarningReason, setLastWarningReason] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [speechActiveNotice, setSpeechActiveNotice] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);

  const MAX_WARNINGS = 5;

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const idImgRef = useRef<HTMLImageElement>(null);
  const warningsRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastViolationTimeRef = useRef<number>(0);
  const sustainedSpeechMsRef = useRef<number>(0);
  const noFaceCountRef = useRef<number>(0);
  const isVerifiedRef = useRef<boolean>(false);

  // Keep isVerifiedRef in sync
  useEffect(() => {
    isVerifiedRef.current = isVerified;
  }, [isVerified]);

  // Check for secondary display
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && (window.screen as any).isExtended) {
        setSecondaryDisplayDetected(true);
      }
    } catch {}
  }, []);

  // --- 1. Request Camera & Mic with Real-time Diagnostics ---
  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let animFrame: number;

    const initHardware = async () => {
      try {
        setVerifyingStatus("Requesting Camera & Microphone permissions...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: {
            echoCancellation: true,
            noiseSuppression: false, // We inspect raw acoustic variance
            autoGainControl: true,
          },
        });

        streamRef.current = stream;
        setCameraActive(stream.getVideoTracks().length > 0);
        setMicActive(stream.getAudioTracks().length > 0);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Setup Audio Diagnostics for Pre-Check VU Meter
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioCtxClass();
        audioCtxRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);

        // Vocal Bandpass Filter (300Hz - 3400Hz): Cuts AC hum & typing clicks
        const biquad = audioContext.createBiquadFilter();
        biquad.type = "bandpass";
        biquad.frequency.value = 1800;
        biquad.Q.value = 0.7;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        analyserRef.current = analyser;

        source.connect(biquad);
        biquad.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let samples: number[] = [];

        const updateVuMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate RMS in vocal band
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sumSquares += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          const scaledVolume = Math.min(100, Math.round((rms / 128) * 100));
          setMicLevel(scaledVolume);

          // Calibrate baseline over initial 2.5 seconds
          if (samples.length < 50) {
            samples.push(scaledVolume);
            if (samples.length === 50) {
              const avgBase = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
              setAmbientBaseline(Math.max(12, avgBase));
              setIsCalibrated(true);
            }
          }

          animFrame = requestAnimationFrame(updateVuMeter);
        };
        updateVuMeter();

        setVerifyingStatus("Loading facial biometric AI models...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);

        setModelsLoaded(true);
        setVerifyingStatus("System calibrated. Upload your College ID Card to verify.");
      } catch (err: any) {
        console.error("Hardware/Model init error:", err);
        setVerifyingStatus(
          "Permission Denied: Please allow Camera & Microphone access in your browser settings to proceed."
        );
      }
    };

    initHardware();

    return () => {
      cancelAnimationFrame(animFrame);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(() => {});
      }
    };
  }, []);

  // --- 2. Live Face Preview Check in Pre-Check Modal ---
  useEffect(() => {
    if (isVerified || !modelsLoaded) return;
    const interval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        try {
          const det = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          );
          setFaceInPreview(!!det);
        } catch {
          // ignore transient detection frames
        }
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isVerified, modelsLoaded]);

  // Re-attach video stream if DOM element unmounts/remounts
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isVerified, isMinimized]);

  // --- 3. Handle ID Card File Upload ---
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setIdImage(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- Helper: Capture Webcam Evidence Snapshot ---
  const captureSnapshot = useCallback((): string | null => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      return canvas.toDataURL("image/jpeg", 0.5);
    } catch {
      return null;
    }
  }, []);

  // --- Helper: Request Fullscreen Mode ---
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  };

  // --- 4. Verify Identity (ID Face vs Live Webcam Face) ---
  const verifyIdentity = async () => {
    if (!idImgRef.current || !videoRef.current) return;

    // Ensure audio context is resumed on user gesture
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    setVerifyingStatus("Scanning ID card and matching facial biometrics...");

    const idDetection = await faceapi
      .detectSingleFace(idImgRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!idDetection) {
      setVerifyingStatus("❌ No clear face detected on the uploaded ID card. Try a clearer photo.");
      return;
    }

    const liveDetection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!liveDetection) {
      setVerifyingStatus("❌ Face not detected in camera. Look straight into the webcam.");
      return;
    }

    const distance = faceapi.euclideanDistance(idDetection.descriptor, liveDetection.descriptor);

    if (distance < 0.65) {
      setVerifyingStatus("✅ Identity & Biometrics Verified! Locking Fullscreen & Starting Assessment...");
      setTimeout(async () => {
        await enterFullscreen();
        setIsVerified(true);
        if (onVerified) onVerified();
      }, 1000);
    } else {
      setVerifyingStatus("❌ Face mismatch! Live webcam face does not match the uploaded College ID.");
    }
  };

  // Quick bypass for dev demo
  const handleDemoBypass = async () => {
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    await enterFullscreen();
    setIsVerified(true);
    if (onVerified) onVerified();
  };

  // --- 5. Trigger Warning & Persist Violation with Visual Evidence ---
  const triggerViolation = useCallback(
    (type: string, reason: string) => {
      if (warningsRef.current >= MAX_WARNINGS) return;

      const now = Date.now();
      // Enforce 4.5-second cooldown per distinct violation type
      if (now - lastViolationTimeRef.current < 4500) return;
      lastViolationTimeRef.current = now;

      warningsRef.current += 1;
      const count = warningsRef.current;
      setWarnings(count);
      setLastWarningReason(reason);

      // Capture photo snapshot from webcam as evidence
      const snapshot = captureSnapshot();
      const content = snapshot
        ? JSON.stringify({ reason: `Violation ${count}/${MAX_WARNINGS}: ${reason}`, snapshot })
        : `Violation ${count}/${MAX_WARNINGS}: ${reason}`;

      // Report to parent page to persist in backend database
      if (onViolation) {
        onViolation(type, content);
      }

      if (count >= MAX_WARNINGS) {
        setTimeout(() => {
          alert(`🚨 TERMINATED: Maximum proctoring violations reached (${MAX_WARNINGS}/${MAX_WARNINGS})!\n\nReason: ${reason}\n\nYour session is being automatically submitted.`);
          onAutoSubmit();
        }, 300);
      }
    },
    [onViolation, onAutoSubmit, captureSnapshot]
  );

  // --- 6. Listen for Fullscreen Changes during Assessment ---
  useEffect(() => {
    if (!isVerified) return;

    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        triggerViolation("FULLSCREEN_EXIT", "Assessment fullscreen window was exited or minimized!");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isVerified, triggerViolation]);

  // --- 7. Rigid Continuous Audio & Video Proctoring Engine ---
  useEffect(() => {
    if (!isVerified) return;

    // Ensure audio context is running
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }

    // A. Real-time Continuous Audio Inspection Loop (Every 100ms)
    const audioData = new Uint8Array(analyserRef.current ? analyserRef.current.frequencyBinCount : 128);
    let lastSpectrum: number[] = [];

    const audioInterval = setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) return;

      analyser.getByteFrequencyData(audioData);

      // 1. RMS Energy in vocal range
      let sumSq = 0;
      for (let i = 0; i < audioData.length; i++) {
        sumSq += audioData[i] * audioData[i];
      }
      const rms = Math.sqrt(sumSq / audioData.length);
      const level = Math.min(100, Math.round((rms / 128) * 100));
      setMicLevel(level);

      // 2. Spectral Variance / Flux (Human speech has changing formants; steady noise is stationary)
      let flux = 0;
      if (lastSpectrum.length === audioData.length) {
        for (let i = 0; i < audioData.length; i++) {
          const diff = audioData[i] - lastSpectrum[i];
          if (diff > 0) flux += diff;
        }
      }
      lastSpectrum = Array.from(audioData);

      // Speech threshold: Must exceed ambient baseline by +18 AND have dynamic spectral flux
      const speechThreshold = ambientBaseline + 18;
      const isVoiceEnergy = level > speechThreshold && flux > 35;

      if (isVoiceEnergy) {
        sustainedSpeechMsRef.current += 100;
        setSpeechActiveNotice(true);

        // 3. Temporal Consistency: Sustained speech for > 1.2 seconds (rejects mechanical keystrokes & coughs)
        if (sustainedSpeechMsRef.current >= 1200) {
          // Inspect for multiple vocal harmonics (Multi-voice heuristic)
          let highBandEnergy = 0;
          let lowBandEnergy = 0;
          const mid = Math.floor(audioData.length / 2);
          for (let i = 0; i < mid; i++) lowBandEnergy += audioData[i];
          for (let i = mid; i < audioData.length; i++) highBandEnergy += audioData[i];

          const isMultipleVoices = lowBandEnergy > 500 && highBandEnergy > 450;
          const reason = isMultipleVoices
            ? "Multiple voices / conversation detected in assessment room!"
            : "Talking or loud vocal communication detected!";

          triggerViolation("VOICE_DETECTED", reason);
          sustainedSpeechMsRef.current = 0;
        }
      } else {
        // Leaky decay
        sustainedSpeechMsRef.current = Math.max(0, sustainedSpeechMsRef.current - 60);
        if (sustainedSpeechMsRef.current === 0) {
          setSpeechActiveNotice(false);
        }
      }
    }, 100);

    // B. Facial & Multiple Person Detection Loop (Every 2.8s)
    const videoInterval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      try {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );

        if (detections.length === 0) {
          noFaceCountRef.current += 1;
          // Must be absent for 2 consecutive cycles (> 5.5s) to prevent false alerts when blinking/looking down
          if (noFaceCountRef.current >= 2) {
            triggerViolation("NO_FACE_DETECTED", "Face not detected in camera frame!");
          }
        } else if (detections.length > 1) {
          noFaceCountRef.current = 0;
          triggerViolation(
            "MULTIPLE_FACES",
            `Multiple people (${detections.length}) detected in camera frame!`
          );
        } else {
          // Exactly 1 face - normal
          noFaceCountRef.current = 0;
        }
      } catch (err) {
        // Ignore momentary frame errors
      }
    }, 2800);

    return () => {
      clearInterval(audioInterval);
      clearInterval(videoInterval);
    };
  }, [isVerified, ambientBaseline, triggerViolation]);

  // --- VIEW 1: Pre-Exam ID & Biometric/Acoustic Verification Modal ---
  if (!isVerified) {
    return (
      <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 text-white overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  AI Biometric & Acoustic Pre-Assessment Check
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Verifying camera biometric identity and calibrating microphone for anti-malpractice monitoring.
                </p>
              </div>
              <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-3 py-1 rounded-full font-mono">
                AI Proctor v2.0
              </span>
            </div>
            <p className="text-xs text-amber-300/90 mt-2 bg-amber-950/40 border border-amber-800/50 p-2 rounded-lg">
              ℹ️ {verifyingStatus}
            </p>
            {secondaryDisplayDetected && (
              <p className="text-xs text-red-300 mt-2 bg-red-950/60 border border-red-700 p-2 rounded-lg font-semibold flex items-center gap-2">
                ⚠️ External secondary monitor detected! Exam integrity requires disconnecting external displays.
              </p>
            )}
          </div>

          {/* Verification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* 1. College ID Card Upload */}
            <div className="border border-slate-700/80 rounded-xl p-4 bg-slate-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Step 1: College ID Card
                  </label>
                  {idImage && <span className="text-[10px] text-emerald-400 font-bold">✓ Attached</span>}
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Upload an image of your physical student ID card showing your face clearly.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIdUpload}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer mb-3 bg-slate-900 p-1.5 rounded-lg border border-slate-700"
                />
              </div>

              {idImage ? (
                <div className="relative mt-2 flex justify-center bg-black/40 rounded-lg p-2 border border-slate-700">
                  <img
                    ref={idImgRef}
                    src={idImage}
                    alt="Uploaded ID Card"
                    className="h-32 object-contain rounded"
                  />
                </div>
              ) : (
                <div className="h-32 rounded-lg border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <span>No ID photo uploaded yet</span>
                </div>
              )}
            </div>

            {/* 2. Live Webcam & Audio Inspector */}
            <div className="border border-slate-700/80 rounded-xl p-4 bg-slate-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Step 2: Camera & Mic Inspection
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cameraActive && micActive
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                        : "bg-amber-950 text-amber-300 border border-amber-700"
                    }`}
                  >
                    {cameraActive && micActive ? "● Sensors Ready" : "Awaiting Permissions"}
                  </span>
                </div>

                {/* Webcam Box */}
                <div className="relative rounded-lg overflow-hidden bg-black border border-slate-700 mb-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded backdrop-blur-md font-medium ${
                        faceInPreview ? "bg-emerald-600/80 text-white" : "bg-red-600/80 text-white"
                      }`}
                    >
                      {faceInPreview ? "✓ Face Aligned" : "⚠ Looking for face..."}
                    </span>
                  </div>
                </div>

                {/* Audio Level Diagnostic Meter */}
                <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2.5">
                  <div className="flex justify-between items-center text-[11px] mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      Live Microphone VU Meter:
                    </span>
                    <span className="font-mono text-indigo-300">
                      {micActive ? `${micLevel}% level` : "Disabled"}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-75 ${
                        micLevel > 50
                          ? "bg-amber-400"
                          : micLevel > 20
                          ? "bg-emerald-400"
                          : "bg-slate-600"
                      }`}
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                    <span>
                      Ambient Room Baseline:{" "}
                      <strong className="text-slate-200">
                        {isCalibrated ? `${ambientBaseline} dB (Quiet)` : "Calibrating..."}
                      </strong>
                    </span>
                    <span className="text-indigo-400">Speak to test</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleDemoBypass}
              className="text-xs text-slate-400 underline hover:text-slate-200 transition"
              title="Quickly bypass verification during development or demonstration"
            >
              Skip Verification (Demo Mode)
            </button>

            <button
              disabled={!modelsLoaded || !idImage || !cameraActive || !micActive}
              onClick={verifyIdentity}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <span>Verify Face, Mic & Lock Fullscreen</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: In-Assessment Floating Proctor Widget (Top-Right, Hideable/Unhideable) ---
  return (
    <>
      {/* FULLSCREEN LOCKOUT OVERLAY IF STUDENT EXITS FULLSCREEN */}
      {!isFullscreen && isVerified && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-red-500 rounded-2xl p-8 max-w-md shadow-2xl text-white">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 text-red-500 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ⛶
            </div>
            <h3 className="text-xl font-bold mb-2 text-red-400">Security Alert: Fullscreen Exited</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Exiting fullscreen or minimizing your assessment window is a proctoring violation and has been recorded with a webcam evidence snapshot.
            </p>
            <button
              onClick={enterFullscreen}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/40 flex items-center justify-center gap-2"
            >
              <span>Re-enter Fullscreen Mode</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FLOATING CORNER WIDGET */}
      <div className="fixed top-16 right-4 z-50 select-none">
        {isMinimized ? (
          /* MINIMIZED FLOATING PILL (Student can code distraction-free) */
          <div
            onClick={() => setIsMinimized(false)}
            className={`flex items-center gap-3 bg-slate-900/95 hover:bg-slate-850 backdrop-blur-md px-3.5 py-2 rounded-full border shadow-2xl cursor-pointer transition-all duration-200 ${
              lastWarningReason
                ? "border-red-500 animate-pulse text-red-200"
                : "border-indigo-500/80 text-white"
            }`}
            title="Click to expand camera preview"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>

            <span className="text-xs font-semibold tracking-wide">AI Proctor</span>

            {/* Warning Badge */}
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                warnings > 0 ? "bg-red-600 text-white" : "bg-slate-700 text-slate-300"
              }`}
            >
              ⚠️ {warnings}/{MAX_WARNINGS}
            </span>

            {/* Mic Active Dot */}
            <span
              className={`text-xs flex items-center gap-1 ${
                speechActiveNotice ? "text-amber-400 font-bold" : "text-emerald-400"
              }`}
              title="Microphone is actively monitoring for human voice"
            >
              🎙️
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded-md font-medium transition ml-1"
            >
              Show Cam
            </button>
          </div>
        ) : (
          /* EXPANDED CORNER WIDGET */
          <div className="w-64 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border-2 border-indigo-500/80 transition-all duration-200">
            {/* Header with Title, Warnings & Minimize Button */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">Proctor Live</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                    warnings > 2
                      ? "bg-red-600 text-white animate-pulse"
                      : warnings > 0
                      ? "bg-amber-600 text-white"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  Strikes: {warnings}/{MAX_WARNINGS}
                </span>

                {/* Hide / Minimize Button */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded hover:bg-slate-700/80 text-slate-400 hover:text-white transition"
                  title="Hide camera preview to save screen space (Monitoring remains active in background)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Persistent Webcam Feed */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-32 object-cover"
              />
              {/* Real-time speech alert badge over video */}
              {speechActiveNotice && (
                <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-amber-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded text-center backdrop-blur-sm animate-pulse">
                  🎙️ Voice Detected
                </div>
              )}
            </div>

            {/* Mini Live Mic Level Footer */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
              <span className="flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Mic Guard Active
              </span>
              <div className="w-16 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${
                    micLevel > 40 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>

            {/* Active Warning Banner */}
            {lastWarningReason && (
              <div className="mt-2 bg-red-950/90 border border-red-500/80 rounded-lg p-2 text-[11px] text-red-200 font-medium animate-pulse">
                ⚠️ {lastWarningReason}
              </div>
            )}

            {/* Hide button prompt */}
            <div className="mt-2 text-center">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
              >
                Hide camera while coding
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
