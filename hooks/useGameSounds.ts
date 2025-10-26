
import { useRef, useState, useCallback } from 'react';
import { Player } from '../types';

// Tone.js is loaded from a CDN, so we declare it to satisfy TypeScript
declare const Tone: any;

interface Synths {
    moveSound: any;
    winSound: any;
    drawSound: any;
}

export const useGameSounds = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const synths = useRef<Synths | null>(null);

    const initializeSounds = useCallback(async () => {
        if (isInitialized || typeof Tone === 'undefined') return;
        
        await Tone.start();
        
        synths.current = {
            moveSound: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination(),
            winSound: new Tone.Synth().toDestination(),
            drawSound: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
        };
        setIsInitialized(true);
    }, [isInitialized]);

    const playMoveSound = useCallback((player: Player) => {
        if (!synths.current?.moveSound) return;
        synths.current.moveSound.triggerAttackRelease(player === 'X' ? 'C4' : 'E4', '8n');
    }, []);

    const playWinSound = useCallback(() => {
        if (!synths.current?.winSound) return;
        const now = Tone.now();
        synths.current.winSound.triggerAttackRelease("C4", "8n", now);
        synths.current.winSound.triggerAttackRelease("E4", "8n", now + 0.15);
        synths.current.winSound.triggerAttackRelease("G4", "8n", now + 0.3);
    }, []);
    
    const playDrawSound = useCallback(() => {
        if (!synths.current?.drawSound) return;
        synths.current.drawSound.triggerAttackRelease('C3', '4n');
    }, []);

    return { initializeSounds, playMoveSound, playWinSound, playDrawSound };
};
