// Google Cloud TTS API route for Next.js

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Instantiates a client
const client = new TextToSpeechClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { text, voice = 'en-US-Wavenet-F', speakingRate = 1.0 } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Missing text' });
    return;
  }

  const request = {
    input: { text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: 'en-US', name: voice },
    audioConfig: { audioEncoding: 'MP3', speakingRate },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="output.mp3"');
    res.status(200).send(Buffer.from(response.audioContent, 'base64'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'TTS synthesis failed' });
  }
}
