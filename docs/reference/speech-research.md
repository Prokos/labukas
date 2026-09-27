# Deferred speech research

Provider documentation and list prices checked on 23 September 2026. Recheck them when scheduling speech work. No paid calls or comparative listening tests have been run.

This reference supports future audio production; it is not part of current implementation. See [speech and proficiency boundaries](../speech-and-proficiency-plan.md) for the active scope.

## Listening production

When listening is scheduled, begin with Google Chirp and review a representative sample of Lithuanian before generating the library. Compare another provider only if quality warrants it; a broad provider benchmark is not required before building the text curriculum. Generate lesson audio during audio content production. A Lithuanian reviewer approves the actual clip and transcript, then it becomes a versioned static asset. Learners replay it without another synthesis request; downloaded units retain audio offline. Use human recordings for examples a model cannot produce correctly. Short dialogues can use two approved voices, with additional speakers introduced as learners progress.

Preserve a text route through every unit, with a temporary “Can't listen now” option and a persistent preference. Convert comprehension to reading when appropriate; replace dictation/sound-only tasks with another useful text activity or omit an optional audio activity. Never display the answer and call it equivalent listening practice.

Listening tasks should include audio-to-meaning, sound/form contrasts, extracting information and following a short exchange. Dictation alone cannot demonstrate listening comprehension. Reveal the transcript after an audio-first attempt; a transcript-supported attempt remains useful but records different evidence. Natural and slower playback need to preserve intelligibility, with the normal-speed recording retained.

### Provider candidates, not a quality ranking

| Provider/model          | Verified support                                                                                                                                                              | Role in the evaluation                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Google Cloud Chirp 3 HD | Multiple dedicated `lt-LT` voices in the [official voice list](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types)                                       | First candidate for reusable course recordings.                                                                 |
| Azure Speech            | `lt-LT-OnaNeural` and `lt-LT-LeonasNeural` listed in [language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support)                  | Compare against Google for clarity and linguistic accuracy.                                                     |
| ElevenLabs Eleven v3    | Lithuanian explicitly supported in [model documentation](https://elevenlabs.io/docs/overview/models); older Multilingual v2/Flash v2.5 lists do not include it                | Compare dialogue delivery and naturalness. Do not assume a cheaper older model has equivalent language support. |
| OpenAI GPT-4o mini TTS  | Lithuanian listed in [official OpenAI documentation](https://developers.openai.com/api/docs/guides/text-to-speech), which also says built-in voices are optimized for English | Additional candidate, not an assumed native-quality Lithuanian default.                                         |

“Supports Lithuanian” does not establish that an individual clip is suitable for teaching. The evaluation set should cover common short utterances, case/person endings, vowel length, stress, softened consonants, names, numbers, times, prices and natural dialogue intonation. These are linguistic properties to review, not instructions to imitate a synthetic voice's mistakes. For phonetic reference, use reviewed descriptions such as [Standard Lithuanian, Journal of the International Phonetic Association](https://www.cambridge.org/core/journals/journal-of-the-international-phonetic-association/article/standard-lithuanian/EC7F33EC51FCE8F7142A63D99C38199D).

If a broader voice comparison becomes necessary, the retained evaluation proposal is 100 short scripts across the required contrasts, multiple candidate voices, blind review by a Lithuanian teacher, and an issue ledger. This is future audio work. Review every selected production clip as well. Record voice/model/version and the approved transcript so future regeneration cannot silently replace correct assets with different pronunciation. Disclose synthetic narration as appropriate to the provider and product.

## Speaking activities and assessment

Speaking is out of the current release. While authoring, mark suitable exchanges for future spoken replies using stable goal/utterance references and an optional planned variant. Planned variants are never shown, required or marked passed. This preserves a place for speaking in the progression without empty exercises, recording code or speculative scoring infrastructure.

When speaking is reconsidered, the following distinctions remain useful:

1. **Listen, repeat, record and compare.** Capture locally and replay beside the model. Learners can rehearse without uploading audio or paying per attempt. This records practice, not independently measured pronunciation mastery.
2. **Produce a meaningful reply.** Ask the learner to answer a question or complete a bounded interaction aloud without displaying the answer. Transcribe the recording and evaluate its meaning/forms using the same reviewed response contract as other tasks. Show what was heard, permit a retry on recognition failure and distinguish self-correction from independently recognized speech.
3. **Hold a short exchange.** Use several authored turns and allowed branches: respond, clarify, change a choice, confirm a detail. Later, evaluate more open conversation under a task-specific rubric. A native-speaker assessment sample remains necessary for validating spoken interaction.

The transcript can support feedback about words, grammar and task completion. It cannot prove accurate stress, vowel length or articulation. A recognizer may infer the intended word despite a sound error, or misrecognize understandable learner speech. Evaluate false acceptances and false rejections against native judgments. Do not feed the expected answer as a transcription instruction or treat uncertain transcription as a learner error.

Azure's [documented pronunciation-assessment locale list](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment) does **not** include Lithuanian, despite supporting Lithuanian speech generation and recognition. We should not present an unsupported percentage as a pronunciation grade. A future phoneme/prosody assessor or audio-model critic requires its own Lithuanian learner-speech validation.

For transcription, [ElevenLabs Scribe documentation](https://elevenlabs.io/docs/overview/capabilities/speech-to-text) explicitly lists Lithuanian. Compare it with Azure's Lithuanian recognition; OpenAI's mini transcription model is a cost candidate whose performance and applicable Lithuanian support should be verified in the benchmark before selection. Test accented learners, deliberately wrong endings, silence, background noise and different phones—not only native speech or synthesized examples.

Implementation needs a small authenticated server endpoint for paid calls, short upload limits and usage accounting. Keep provider secrets off the client. Local recording/playback and cached listening can work offline; remote assessment needs a connection. Make uploading explicit and avoid retaining raw recordings by default. These are part of shipping voice, not extra teaching screens.

## Cost scenarios

All figures below are **USD usage estimates**, before tax, free allowances, hosting, review labor and any account minimums. They are calculations from published rates, not supplier quotes for the finished product.

### Prepared lesson audio

Assume **2,000 clips × 80 billed characters = 160,000 characters** for one complete generation pass:

| Option               | Published usage rate     | Calculated library generation |
| -------------------- | ------------------------ | ----------------------------: |
| Google Chirp 3 HD    | $30 / million characters |                     **$4.80** |
| ElevenLabs Eleven v3 | $0.10 / 1,000 characters |                    **$16.00** |

Sources: [Google pricing](https://cloud.google.com/text-to-speech/pricing), [ElevenLabs API pricing](https://elevenlabs.io/pricing/api). Three full generation passes would be $14.40 or $48 respectively. Extra voices and separately generated slow versions add to the character count. Replays have no synthesis charge, though storage/delivery still have costs. Human linguistic review is likely to cost substantially more than raw generation and must be budgeted separately; no reviewer rate has been obtained.

### Learner speaking

Assume **10 minutes of uploaded learner speech per day × 30 days = 300 minutes/month**. This is recorded audio duration, not time spent on the lesson page.

| Transcription option                                         | Published rate          | Calculated monthly usage per learner |
| ------------------------------------------------------------ | ----------------------- | -----------------------------------: |
| ElevenLabs Scribe v2                                         | $0.22/hour              |                            **$1.10** |
| OpenAI GPT-4o mini transcribe, pending Lithuanian validation | Estimated $0.003/minute |                            **$0.90** |

Sources: [ElevenLabs API pricing](https://elevenlabs.io/pricing/api), [official OpenAI pricing](https://developers.openai.com/api/docs/pricing). These costs cover transcription, not pronunciation scoring, hosting or generative feedback. At 100 learners using that allowance, Scribe usage would be $110/month before other costs. Local record-and-compare has no model usage fee.

Live generative conversation has a different budget: uploaded speech + text-model turns + newly synthesized replies. For illustration, 300 minutes of tutor replies at an assumed 800 characters/minute would add 240,000 synthesized characters: $7.20 with Chirp 3 HD or $24 with Eleven v3, plus transcription and text-model charges. This is a volume scenario, not a measured Lithuanian speaking rate or a promise about a realtime model's bill. The initial authored-dialogue system can reuse prepared replies instead.

