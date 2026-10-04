import type { CSSProperties } from "react";

type Props = { source: any; mediaUrl: (value: string) => string };

export default function QuestionSource({ source, mediaUrl }: Props) {
  if (!source) return null;
  const video = source.video?.local_src ? String(source.video.local_src) : "";
  const steps = Array.isArray(source.steps) ? source.steps : [];
  const examples = Array.isArray(source.examples) ? source.examples : [];
  const text = [source.reading, source.context, source.situation_ar].find((value) => typeof value === "string" && value.trim());
  const sentences = steps.map((step: any) => step.sentence || step.english).filter(Boolean);
  const dialogue = Array.isArray(source.dialogue) ? source.dialogue : Array.isArray(source.dialogue_lines) ? source.dialogue_lines : [];
  if (!video && !text && !sentences.length && !examples.length && !dialogue.length) return null;
  return <section className="question-source" aria-label="Source material for this question">
    <div className="question-source-head">
      <div><span className="eyebrow">SOURCE BEFORE YOU ANSWER</span><h3>{source.situation_title || "Watch or read the situation first"}</h3></div>
      <span className="source-required">شاهدي أو اقرئي المصدر أولاً</span>
    </div>
    {video && <div className="lesson-video-wrap source-video"><video controls playsInline preload="metadata" src={mediaUrl(video)}><track kind="captions" /></video><div className="video-credit"><span>{String(source.video.title || "Situation video")}</span><small>{String(source.video.spoken_language || "Video source")} · <a href={String(source.video.source_url || "#")} target="_blank" rel="noreferrer">source</a></small></div></div>}
    {text && <div className="source-passage" dir="ltr"><strong>Read the context</strong><p>{String(text)}</p></div>}
    {sentences.length > 0 && <div className="source-passage" dir="ltr"><strong>Key lines from the situation</strong>{sentences.slice(0, 4).map((line: string, index: number) => <p key={`${line}-${index}`}>{line}</p>)}</div>}
    {dialogue.length > 0 && <div className="source-passage" dir="ltr"><strong>Dialogue</strong>{dialogue.slice(0, 6).map((line: any, index: number) => <p key={`${line.line || line.english}-${index}`}><b>{line.speaker ? `${line.speaker}: ` : ""}</b>{line.line || line.english}</p>)}</div>}
    {examples.length > 0 && <div className="source-passage" dir="ltr"><strong>Examples from the situation</strong>{examples.slice(0, 3).map((example: any, index: number) => <p key={`${example.sentence}-${index}`}>{example.sentence}</p>)}</div>}
  </section>;
}

export const questionSourceStyles: CSSProperties = {};
