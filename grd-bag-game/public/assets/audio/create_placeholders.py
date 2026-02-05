import wave
import struct

# Create silent audio files as placeholders
sounds = ['pop', 'error', 'success', 'tick']

for sound_name in sounds:
    filename = f'{sound_name}.wav'
    
    # Create a 0.1 second silent audio file
    with wave.open(filename, 'w') as wav_file:
        # Set parameters
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(44100)  # 44.1kHz
        
        # Write silent frames (0.1 seconds)
        num_frames = int(44100 * 0.1)
        silent_data = struct.pack('<' + ('h' * num_frames), *([0] * num_frames))
        wav_file.writeframes(silent_data)
    
    print(f'Created {filename}')

print('\nAll placeholder audio files created successfully!')
